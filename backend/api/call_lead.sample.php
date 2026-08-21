<?php
/**
 * 전화·카톡 CTA 클릭 리드 저장
 * - 이름/번호 없이 gclid(+유입)만 남겨 오프라인 전환 매칭용으로 사용
 * - channel: call(기본) | kakao
 * - 배포 시 call_lead.php 로 복사
 */
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['result' => 'error', 'msg' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../config/db_conn.php';

const CALL_LEAD_GCLID_MAX = 255;
const CALL_LEAD_INFLOW_MAX = 45;
const CALL_LEAD_INFLOW_URL = 'contact';
const CALL_LEAD_INFLOW_URL_GOOGLE = 'contact-ad';

/**
 * @param array<string, mixed> $payload
 */
function call_lead_json($payload)
{
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function call_lead_client_ip()
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

$raw = file_get_contents('php://input');
$data = json_decode($raw === false ? '' : $raw);
if (!$data) {
    call_lead_json(['result' => 'error', 'msg' => 'Invalid JSON']);
}

$gclid = isset($data->gclid) ? trim((string) $data->gclid) : '';
if ($gclid !== '' && !preg_match('/^[A-Za-z0-9._-]{1,' . CALL_LEAD_GCLID_MAX . '}$/', $gclid)) {
    $gclid = '';
}

// 오프라인 전환용 — gclid 없으면 저장하지 않음
if ($gclid === '') {
    call_lead_json(['result' => 'success', 'msg' => 'skipped_no_gclid']);
}

$channel_raw = isset($data->channel) ? strtolower(trim((string) $data->channel)) : 'call';
if ($channel_raw === 'kakao') {
    $c_state = '카톡클릭';
    $default_source = 'Kakao_Chat';
} else {
    $c_state = '전화클릭';
    $default_source = 'Call_Now';
}

$lead_name = '익명';

$source = isset($data->source) ? trim((string) $data->source) : $default_source;
if ($source === '' || strlen($source) > 45) {
    $source = $default_source;
}
$source = preg_replace('/[\x00-\x1F\x7F]/', '', $source);
if ($source === null || $source === '') {
    $source = $default_source;
}

$default_inflow = $channel_raw === 'kakao' ? '카톡클릭' : '전화클릭';
$c_inflow = isset($data->c_inflow) ? trim((string) $data->c_inflow) : '';
$c_inflow = preg_replace('/[\x00-\x1F\x7F]/', '', $c_inflow);
if ($c_inflow === null || $c_inflow === '') {
    $c_inflow = $default_inflow;
}
if (function_exists('mb_substr')) {
    $c_inflow = mb_substr($c_inflow, 0, CALL_LEAD_INFLOW_MAX, 'UTF-8');
} else {
    $c_inflow = substr($c_inflow, 0, CALL_LEAD_INFLOW_MAX);
}

// gclid가 있으면 항상 Google Ads 유입으로 기록 (프론트 page와 무관)
$inflow_url = CALL_LEAD_INFLOW_URL_GOOGLE;
$utm_campaign = 'google-ads';
$user_ip = call_lead_client_ip();
$lead_tel = '';

try {
    $block_check = $pdo->prepare(
        "SELECT COUNT(*) as cnt FROM user_inquiry WHERE userip = :ip AND (block = '1' OR block = 1)"
    );
    $block_check->bindParam(':ip', $user_ip);
    $block_check->execute();
    $block_row = $block_check->fetch(PDO::FETCH_ASSOC);
    if ($block_row && (int) $block_row['cnt'] > 0) {
        call_lead_json(['result' => 'success', 'msg' => 'ok']);
    }

    // IP당 1시간 5회 제한 (전화·카톡 합산)
    $rate = $pdo->prepare(
        "SELECT COUNT(*) as cnt FROM user_inquiry
         WHERE userip = :ip
         AND c_state IN ('전화클릭', '카톡클릭')
         AND c_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)"
    );
    $rate->bindParam(':ip', $user_ip);
    $rate->execute();
    $rate_row = $rate->fetch(PDO::FETCH_ASSOC);
    if ($rate_row && (int) $rate_row['cnt'] >= 5) {
        call_lead_json(['result' => 'success', 'msg' => 'ok']);
    }

    // 동일 gclid + 채널이 24시간 내 있으면 중복 저장 생략
    $dup = $pdo->prepare(
        "SELECT idx FROM user_inquiry
         WHERE gclid = :gclid AND c_state = :c_state
         AND c_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         LIMIT 1"
    );
    $dup->bindParam(':gclid', $gclid);
    $dup->bindParam(':c_state', $c_state);
    $dup->execute();
    if ($dup->fetch(PDO::FETCH_ASSOC)) {
        call_lead_json(['result' => 'success', 'msg' => 'already_logged']);
    }

    $query = "INSERT INTO user_inquiry (
        c_date, c_name, c_tel, c_state, c_option, c_inflow,
        c_inflowdate, c_inflowurl, utm_source, utm_campaign, gclid, userip, c_state2, block
    ) VALUES (
        NOW(), :name, :tel, :c_state, :source, :c_inflow,
        NOW(), :inflow_url, 'google', :utm_campaign, :gclid, :ip, '', '0'
    )";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':name', $lead_name);
    $stmt->bindParam(':tel', $lead_tel);
    $stmt->bindParam(':c_state', $c_state);
    $stmt->bindParam(':source', $source);
    $stmt->bindParam(':c_inflow', $c_inflow);
    $stmt->bindParam(':inflow_url', $inflow_url);
    $stmt->bindParam(':utm_campaign', $utm_campaign);
    $stmt->bindParam(':gclid', $gclid);
    $stmt->bindParam(':ip', $user_ip);

    if ($stmt->execute()) {
        call_lead_json(['result' => 'success', 'msg' => 'ok']);
    }

    call_lead_json(['result' => 'error', 'msg' => 'insert failed']);
} catch (PDOException $e) {
    error_log('[call_lead] DB Error: ' . $e->getMessage());
    call_lead_json(['result' => 'error', 'msg' => 'server error']);
}
