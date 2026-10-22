<?php

require_once __DIR__ . '/../lib/client_ip.php';
require_once __DIR__ . '/../lib/rate_limit.php';
require_once __DIR__ . '/../lib/recaptcha.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://yeoon.co.kr',
    'https://www.yeoon.co.kr',
    'https://new.yeoon.co.kr',
    'http://localhost:3000',
    'http://localhost:4173',
];

if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/db_conn.php';

$app_config_path = __DIR__ . '/../config/app_config.php';
if (is_readable($app_config_path)) {
    require_once $app_config_path;
} else {
    $ALIGO_API_KEY = '';
    $ALIGO_USER_ID = '';
    $ALIGO_SENDER_KEY = '';
    $ALIGO_TPL_CODE = '';
    $ALIGO_SENDER = '';
    $ALIGO_RECEIVERS = [];
    $RECAPTCHA_SECRET_KEY = '';
}

if (!isset($RECAPTCHA_SECRET_KEY)) {
    $RECAPTCHA_SECRET_KEY = '';
}

const INQUIRY_CONTENT_MAX = 500;
const INQUIRY_POST_MAX_PER_MINUTE = 10;
const INQUIRY_CONTENT_MIN = 5;
const FAKE_SUCCESS_MSG = '상담이 접수되었습니다.';
const DUPLICATE_TEL_MSG = "이미 접수된 연락처입니다.\n회신 대기 중이거나 빠른 상담을 원하시면 02-318-2981 로 연락 부탁드립니다.";
const MSG_NAME_INVALID = '올바른 성함을 입력하고, 한글 2~10자로만 입력해 주세요.';
const MSG_TEL_INVALID = '연락처는 010으로 시작하는 11자리 숫자만 입력해 주세요.';
const MSG_CONTENT_MIN = '문의사항은 5자 이상 입력해 주세요.';
const ALIMTALK_INFLOW_URL = 'contact';
const ALIMTALK_INFLOW_URL_GOOGLE = 'contact-ad';
const ALIMTALK_DEFAULT_UTM_SOURCE = 'main';
const ALIMTALK_DEFAULT_UTM_CAMPAIGN = '직접문의';
const GCLID_MAX_LENGTH = 255;
const UTM_MAX_LENGTH = 200;
const MSG_RECAPTCHA_INVALID = '보안 검증에 실패했습니다. 새로고침 후 다시 시도해 주세요.';
const MSG_RECAPTCHA_UNAVAILABLE = '보안 검증 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';

/**
 * @return list<string>
 */
function allowed_inflow_urls()
{
    return [ALIMTALK_INFLOW_URL, ALIMTALK_INFLOW_URL_GOOGLE];
}

function resolve_inflow_url($raw)
{
    $value = sanitize_input($raw);
    if (in_array($value, allowed_inflow_urls(), true)) {
        return $value;
    }
    return ALIMTALK_INFLOW_URL;
}

function resolve_gclid($raw)
{
    $value = trim((string) $raw);
    if ($value === '') {
        return '';
    }

    // Google gclid: 영문·숫자·하이픈·밑줄·점
    if (!preg_match('/^[A-Za-z0-9._-]{1,' . GCLID_MAX_LENGTH . '}$/', $value)) {
        return '';
    }

    return $value;
}

function resolve_utm($raw, $default)
{
    $value = sanitize_input($raw);
    if ($value === '') {
        return sanitize_input($default);
    }

    if (mb_strlen($value, 'UTF-8') > UTM_MAX_LENGTH) {
        return mb_substr($value, 0, UTM_MAX_LENGTH, 'UTF-8');
    }

    return $value;
}

/** @return array{is_bot: bool, state2: string} */
function verify_recaptcha_token($token, $remote_ip)
{
    global $RECAPTCHA_SECRET_KEY, $RECAPTCHA_ALLOWED_HOSTNAMES, $RECAPTCHA_EXPECTED_ACTION;

    $secret = is_string($RECAPTCHA_SECRET_KEY) ? trim($RECAPTCHA_SECRET_KEY) : '';
    $hostnames = isset($RECAPTCHA_ALLOWED_HOSTNAMES) && is_array($RECAPTCHA_ALLOWED_HOSTNAMES)
        ? $RECAPTCHA_ALLOWED_HOSTNAMES : RECAPTCHA_DEFAULT_HOSTNAMES;
    $action = isset($RECAPTCHA_EXPECTED_ACTION) && is_string($RECAPTCHA_EXPECTED_ACTION)
        ? $RECAPTCHA_EXPECTED_ACTION : RECAPTCHA_DEFAULT_ACTION;
    $result = recaptcha_verify_token(trim((string) $token), (string) $remote_ip, $secret, $hostnames, $action);
    if (!$result['verified']) {
        error_log('[reCAPTCHA] verification rejected: ' . $result['reason']);
        $unavailable = $result['reason'] !== 'invalid';
        http_response_code($unavailable ? 503 : 403);
        json_response([
            'result' => '0',
            'msg' => $unavailable ? MSG_RECAPTCHA_UNAVAILABLE : MSG_RECAPTCHA_INVALID,
        ]);
    }

    return ['is_bot' => $result['is_bot'], 'state2' => $result['is_bot'] ? '부정클릭' : ''];
}

/**
 * @param array<string, mixed> $payload
 */
function json_response($payload)
{
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_client_ip()
{
    return app_client_ip();
}

function sanitize_input($data): string
{
    if ($data === null) {
        return '';
    }

    return htmlspecialchars(trim((string) $data), ENT_QUOTES, 'UTF-8');
}

function is_aligo_configured()
{
    global $ALIGO_API_KEY, $ALIGO_USER_ID, $ALIGO_SENDER_KEY, $ALIGO_TPL_CODE, $ALIGO_SENDER, $ALIGO_RECEIVERS;

    if (
        empty($ALIGO_API_KEY) ||
        empty($ALIGO_USER_ID) ||
        empty($ALIGO_SENDER_KEY) ||
        empty($ALIGO_TPL_CODE) ||
        empty($ALIGO_SENDER)
    ) {
        return false;
    }

    if (!is_array($ALIGO_RECEIVERS) || count($ALIGO_RECEIVERS) === 0) {
        return false;
    }

    return true;
}

function build_alimtalk_message(
    string $name,
    string $phone,
    string $case_keyword,
    string $inflow_url,
    string $utm_source,
    string $utm_campaign
): string {
    $inflow_path = $inflow_url . '/' . $utm_source . '/' . $utm_campaign;

    return '상담이 접수되었습니다.' . PHP_EOL
        . '이름 : ' . $name . PHP_EOL
        . '연락처 : ' . $phone . PHP_EOL
        . '유입경로 : ' . $inflow_path . PHP_EOL
        . '사건키워드 : ' . $case_keyword;
}

function send_kakao_alimtalk(
    string $name,
    string $phone,
    string $case_keyword,
    string $inflow_url,
    string $utm_source,
    string $utm_campaign
): bool {
    global $ALIGO_API_KEY, $ALIGO_USER_ID, $ALIGO_SENDER_KEY, $ALIGO_TPL_CODE, $ALIGO_SENDER, $ALIGO_RECEIVERS;

    if (!is_aligo_configured()) {
        return false;
    }

    $api_url = 'https://kakaoapi.aligo.in/akv10/alimtalk/send/';
    $message = build_alimtalk_message($name, $phone, $case_keyword, $inflow_url, $utm_source, $utm_campaign);

    $variables = [
        'apikey' => $ALIGO_API_KEY,
        'userid' => $ALIGO_USER_ID,
        'senderkey' => $ALIGO_SENDER_KEY,
        'tpl_code' => $ALIGO_TPL_CODE,
        'sender' => $ALIGO_SENDER,
    ];

    $receiver_index = 1;
    foreach ($ALIGO_RECEIVERS as $receiver) {
        $receiver = trim((string) $receiver);
        if ($receiver === '') {
            continue;
        }
        $variables['receiver_' . $receiver_index] = $receiver;
        $variables['message_' . $receiver_index] = $message;
        $receiver_index++;
    }

    $response = app_post_form($api_url, $variables);
    $sent = $response['body'] !== false && $response['status'] >= 200 && $response['status'] < 300;
    if (!$sent) {
        error_log('[Alimtalk] HTTPS request failed');
    }

    return $sent;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['result' => '0', 'msg' => '허용되지 않은 요청입니다.']);
}

$user_ip = get_client_ip();
if (app_rate_limit_exceeded('inquiry-submit|' . $user_ip, INQUIRY_POST_MAX_PER_MINUTE)) {
    http_response_code(429);
    header('Retry-After: ' . APP_RATE_LIMIT_WINDOW_SECONDS);
    json_response(['result' => '0', 'msg' => '요청이 너무 많습니다. 1분 후 다시 시도해 주세요.']);
}

$raw_name = trim((string) ($_POST['c_name'] ?? ''));
$raw_tel = trim((string) ($_POST['c_tel'] ?? ''));
$raw_content = trim((string) ($_POST['c_content'] ?? ''));
$raw_inflow = $_POST['c_inflow'] ?? '상담 페이지';

if ($raw_name === '' || $raw_tel === '' || $raw_content === '') {
    json_response(['result' => '0', 'msg' => '필수 입력값이 없습니다.']);
}

if (!preg_match('/^[\x{AC00}-\x{D7A3}]{2,10}$/u', $raw_name)) {
    json_response(['result' => '0', 'msg' => MSG_NAME_INVALID]);
}

$safe_tel = preg_replace('/[^0-9]/', '', $raw_tel);
if (!preg_match('/^010\d{8}$/', $safe_tel)) {
    json_response(['result' => '0', 'msg' => MSG_TEL_INVALID]);
}

$content_length = mb_strlen($raw_content, 'UTF-8');
if ($content_length < INQUIRY_CONTENT_MIN) {
    json_response(['result' => '0', 'msg' => MSG_CONTENT_MIN]);
}

if ($content_length > INQUIRY_CONTENT_MAX) {
    json_response(['result' => '0', 'msg' => '문의사항은 ' . INQUIRY_CONTENT_MAX . '자 이내로 입력해 주세요.']);
}

$safe_name = sanitize_input($raw_name);
$safe_content = sanitize_input($raw_content);
$safe_inflow = sanitize_input($raw_inflow);
$inflowurl = resolve_inflow_url($_POST['c_inflowurl'] ?? ALIMTALK_INFLOW_URL);
$raw_option = trim((string) ($_POST['c_option'] ?? ''));
$case_keyword = $raw_option !== '' ? sanitize_input($raw_option) : $safe_content;
$utm_source = resolve_utm($_POST['utm_source'] ?? '', ALIMTALK_DEFAULT_UTM_SOURCE);
$utm_campaign = resolve_utm($_POST['utm_campaign'] ?? '', ALIMTALK_DEFAULT_UTM_CAMPAIGN);
$gclid = resolve_gclid($_POST['gclid'] ?? '');

$recaptcha = verify_recaptcha_token($_POST['recaptcha_token'] ?? '', $user_ip);
$is_bot = $recaptcha['is_bot'];
$state2 = $recaptcha['state2'];

try {
    $block_check_query = "SELECT COUNT(*) as cnt FROM user_inquiry WHERE userip = :ip AND (block = '1' OR block = 1)";
    $block_stmt = $pdo->prepare($block_check_query);
    $block_stmt->bindParam(':ip', $user_ip);
    $block_stmt->execute();
    $block_row = $block_stmt->fetch();

    if ($block_row['cnt'] > 0) {
        json_response(['result' => '1', 'msg' => FAKE_SUCCESS_MSG]);
    }

    // 전화·카톡 CTA 리드는 상담 폼 스팸 카운트에서 제외
    $spam_check_query = "SELECT COUNT(*) as cnt FROM user_inquiry
        WHERE userip = :ip
        AND c_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND (c_state IS NULL OR c_state NOT IN ('전화클릭', '카톡클릭'))";
    $spam_stmt = $pdo->prepare($spam_check_query);
    $spam_stmt->bindParam(':ip', $user_ip);
    $spam_stmt->execute();
    $spam_row = $spam_stmt->fetch();

    if ($spam_row['cnt'] >= 3) {
        $auto_block_query = "UPDATE user_inquiry SET block = '1' WHERE userip = :ip";
        $auto_block_stmt = $pdo->prepare($auto_block_query);
        $auto_block_stmt->bindParam(':ip', $user_ip);
        $auto_block_stmt->execute();

        json_response(['result' => '1', 'msg' => FAKE_SUCCESS_MSG]);
    }

    $check_query = "SELECT COUNT(*) as cnt FROM user_inquiry
        WHERE c_tel = :tel AND c_tel != ''
        AND (c_state IS NULL OR c_state NOT IN ('전화클릭', '카톡클릭'))";
    $check_stmt = $pdo->prepare($check_query);
    $check_stmt->bindParam(':tel', $safe_tel);
    $check_stmt->execute();
    $row = $check_stmt->fetch();

    if ($row['cnt'] > 0) {
        json_response(['result' => '0', 'msg' => DUPLICATE_TEL_MSG]);
    }

    $insert_query = 'INSERT INTO user_inquiry (
        c_date, c_name, c_tel, c_content, c_inflow,
        c_state, c_state2, c_inflowdate, c_inflowurl,
        utm_source, utm_campaign, gclid,
        userip, block
    ) VALUES (
        NOW(), :name, :tel, :content, :inflow,
        :state, :state2, NOW(), :inflowurl,
        :utm_source, :utm_campaign, :gclid,
        :ip, :block
    )';

    $state = '상담접수';
    $block = '0';
    $gclid_or_null = $gclid !== '' ? $gclid : null;

    $stmt = $pdo->prepare($insert_query);
    $stmt->bindParam(':name', $safe_name);
    $stmt->bindParam(':tel', $safe_tel);
    $stmt->bindParam(':content', $safe_content);
    $stmt->bindParam(':inflow', $safe_inflow);
    $stmt->bindParam(':state', $state);
    $stmt->bindParam(':state2', $state2);
    $stmt->bindParam(':inflowurl', $inflowurl);
    $stmt->bindParam(':utm_source', $utm_source);
    $stmt->bindParam(':utm_campaign', $utm_campaign);
    $stmt->bindValue(':gclid', $gclid_or_null, $gclid_or_null === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindParam(':ip', $user_ip);
    $stmt->bindParam(':block', $block);

    if ($stmt->execute()) {
        if (!$is_bot) {
            send_kakao_alimtalk($safe_name, $safe_tel, $case_keyword, $inflowurl, $utm_source, $utm_campaign);
        }
        json_response(['result' => '1', 'msg' => FAKE_SUCCESS_MSG]);
    }

    json_response(['result' => '0', 'msg' => '상담 접수 중 문제가 발생했습니다.']);
} catch (PDOException $e) {
    error_log('DB Insert Error: ' . $e->getMessage());
    json_response(['result' => '0', 'msg' => '일시적인 서버 오류가 발생했습니다.']);
}
