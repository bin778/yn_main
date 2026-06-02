<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';

board_handle_options('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$auth = board_require_super($pdo, $JWT_SECRET, $JWT_COOKIE_NAME);
if ($auth === null) {
    board_json_response(['error' => '최고관리자 권한이 필요합니다.'], 403);
}

$ip = trim((string) ($_GET['ip'] ?? ''));

if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    board_json_response(['error' => '유효하지 않은 IP 주소입니다.'], 400);
}

// 루프백·사설 IP는 API 조회 불필요
if (
    filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
) {
    board_json_response(['ok' => true, 'ip' => $ip, 'loc' => null, 'note' => '사설/예약 IP입니다.']);
}

$url = 'https://ipinfo.io/' . rawurlencode($ip) . '/json';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_USERAGENT      => 'yn-admin/1.0',
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $http_code < 200 || $http_code >= 300) {
    board_json_response(['error' => 'IP 정보를 가져오지 못했습니다.'], 502);
}

$data = json_decode($response, true);
if (!is_array($data)) {
    board_json_response(['error' => 'IP 응답 파싱에 실패했습니다.'], 502);
}

board_json_response([
    'ok'      => true,
    'ip'      => $data['ip']       ?? $ip,
    'city'    => $data['city']     ?? null,
    'region'  => $data['region']   ?? null,
    'country' => $data['country']  ?? null,
    'org'     => $data['org']      ?? null,
    'loc'     => $data['loc']      ?? null,   // "lat,lng" 형식
    'timezone'=> $data['timezone'] ?? null,
]);
