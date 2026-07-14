<?php

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
}

const INQUIRY_CONTENT_MAX = 500;
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
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED'])) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    } elseif (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    } elseif (isset($_SERVER['HTTP_FORWARDED'])) {
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    } elseif (isset($_SERVER['REMOTE_ADDR'])) {
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    } else {
        $ipaddress = 'UNKNOWN';
    }

    $ips = explode(',', $ipaddress);
    $ip = trim($ips[0]);

    if ($ip === '::1') {
        $ip = '127.0.0.1';
    }

    return $ip;
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
    $host_info = parse_url($api_url);
    $port = (strtolower($host_info['scheme']) === 'https') ? 443 : 80;

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

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_PORT, $port);
    curl_setopt($curl, CURLOPT_URL, $api_url);
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($variables));
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($curl);

    return $response;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['result' => '0', 'msg' => '허용되지 않은 요청입니다.']);
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
$utm_source = sanitize_input($_POST['utm_source'] ?? ALIMTALK_DEFAULT_UTM_SOURCE);
$utm_campaign = sanitize_input($_POST['utm_campaign'] ?? ALIMTALK_DEFAULT_UTM_CAMPAIGN);

$user_ip = get_client_ip();

try {
    $block_check_query = "SELECT COUNT(*) as cnt FROM user_inquiry WHERE userip = :ip AND (block = '1' OR block = 1)";
    $block_stmt = $pdo->prepare($block_check_query);
    $block_stmt->bindParam(':ip', $user_ip);
    $block_stmt->execute();
    $block_row = $block_stmt->fetch();

    if ($block_row['cnt'] > 0) {
        json_response(['result' => '1', 'msg' => FAKE_SUCCESS_MSG]);
    }

    $spam_check_query = "SELECT COUNT(*) as cnt FROM user_inquiry WHERE userip = :ip AND c_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
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

    $check_query = 'SELECT COUNT(*) as cnt FROM user_inquiry WHERE c_tel = :tel';
    $check_stmt = $pdo->prepare($check_query);
    $check_stmt->bindParam(':tel', $safe_tel);
    $check_stmt->execute();
    $row = $check_stmt->fetch();

    if ($row['cnt'] > 0) {
        json_response(['result' => '0', 'msg' => DUPLICATE_TEL_MSG]);
    }

    $insert_query = 'INSERT INTO user_inquiry (
        c_date, c_name, c_tel, c_content, c_inflow,
        c_state, c_inflowdate, c_inflowurl, userip, block
    ) VALUES (
        NOW(), :name, :tel, :content, :inflow,
        :state, NOW(), :inflowurl, :ip, :block
    )';

    $state = '상담접수';
    $block = '0';

    $stmt = $pdo->prepare($insert_query);
    $stmt->bindParam(':name', $safe_name);
    $stmt->bindParam(':tel', $safe_tel);
    $stmt->bindParam(':content', $safe_content);
    $stmt->bindParam(':inflow', $safe_inflow);
    $stmt->bindParam(':state', $state);
    $stmt->bindParam(':inflowurl', $inflowurl);
    $stmt->bindParam(':ip', $user_ip);
    $stmt->bindParam(':block', $block);

    if ($stmt->execute()) {
        send_kakao_alimtalk($safe_name, $safe_tel, $case_keyword, $inflowurl, $utm_source, $utm_campaign);
        json_response(['result' => '1', 'msg' => FAKE_SUCCESS_MSG]);
    }

    json_response(['result' => '0', 'msg' => '상담 접수 중 문제가 발생했습니다.']);
} catch (PDOException $e) {
    error_log('DB Insert Error: ' . $e->getMessage());
    json_response(['result' => '0', 'msg' => '일시적인 서버 오류가 발생했습니다.']);
}
