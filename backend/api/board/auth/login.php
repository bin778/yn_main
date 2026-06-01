<?php

require_once __DIR__ . '/../../../lib/cors.php';
require_once __DIR__ . '/../../../lib/bootstrap.php';
require_once __DIR__ . '/../../../lib/board_auth.php';

board_handle_options('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

if (board_rate_limit_exceeded('login', 10)) {
    board_json_response(['error' => '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'], 429);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw === false ? '' : $raw, true);
if (!is_array($body)) {
    $body = $_POST;
}

$mb_id = trim((string) ($body['mb_id'] ?? ''));
$mb_password = (string) ($body['mb_password'] ?? '');

if ($mb_id === '' || $mb_password === '') {
    board_json_response(['error' => '아이디와 비밀번호를 입력해 주세요.'], 400);
}

$member = board_verify_login($pdo, $mb_id, $mb_password);
if ($member === null) {
    board_json_response(['error' => '아이디 또는 비밀번호가 올바르지 않습니다.'], 401);
}

$jwt_role = '';
foreach (array_merge([''], BOARD_ALLOWED_TABLES) as $table) {
    $resolved = board_resolve_admin_role($pdo, $member, $table);
    if ($resolved === 'super') {
        $jwt_role = 'super';
        break;
    }
    if ($resolved === 'board' && $jwt_role === '') {
        $jwt_role = 'board';
    }
}

if ($jwt_role === '') {
    board_json_response(['error' => '게시판 관리 권한이 없습니다.'], 403);
}

$token = jwt_issue(
    [
        'sub'  => (string) $member['mb_id'],
        'name' => board_display_name($member),
        'role' => $jwt_role,
    ],
    $JWT_SECRET,
    (int) $JWT_TTL_SECONDS
);

board_set_auth_cookie($token, (int) $JWT_TTL_SECONDS, $JWT_COOKIE_NAME, $JWT_COOKIE_DOMAIN);

board_json_response([
    'ok'       => true,
    'mb_id'    => (string) $member['mb_id'],
    'mb_name'  => board_display_name($member),
    'is_admin' => $jwt_role,
]);
