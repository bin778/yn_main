<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/inquiry_admin.php';

board_handle_options('PATCH, OPTIONS');

$method = strtoupper((string) $_SERVER['REQUEST_METHOD']);
if ($method === 'POST') {
    $method = 'PATCH';
}

if ($method !== 'PATCH') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$auth = board_require_super($pdo, $JWT_SECRET, $JWT_COOKIE_NAME);
if ($auth === null) {
    board_json_response(['error' => '최고관리자 권한이 필요합니다.'], 403);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw === false ? '' : $raw, true);
if (!is_array($body)) {
    board_json_response(['error' => '요청 형식이 올바르지 않습니다.'], 400);
}

$idx = (int) ($body['idx'] ?? 0);
if ($idx <= 0) {
    board_json_response(['error' => '유효하지 않은 문의 번호입니다.'], 400);
}

$updates = [];
$params = ['idx' => $idx];

if (array_key_exists('c_state', $body)) {
    $state = trim((string) $body['c_state']);
    if (!inquiry_state_is_valid($state)) {
        board_json_response(['error' => '유효하지 않은 처리 상태입니다.'], 400);
    }
    $updates[] = 'c_state = :c_state';
    $params['c_state'] = $state;
}

if (array_key_exists('block', $body)) {
    $updates[] = 'block = :block';
    $params['block'] = inquiry_normalize_block($body['block']);
}

if (array_key_exists('c_state2', $body)) {
    $memo = trim((string) $body['c_state2']);
    if (mb_strlen($memo, 'UTF-8') > 45) {
        board_json_response(['error' => '메모는 45자 이내로 입력해 주세요.'], 400);
    }
    $updates[] = 'c_state2 = :c_state2';
    $params['c_state2'] = $memo;
}

if ($updates === []) {
    board_json_response(['error' => '변경할 항목이 없습니다.'], 400);
}

try {
    $check = $pdo->prepare('SELECT idx FROM user_inquiry WHERE idx = :idx LIMIT 1');
    $check->execute(['idx' => $idx]);
    if (!$check->fetch(PDO::FETCH_ASSOC)) {
        board_json_response(['error' => '문의를 찾을 수 없습니다.'], 404);
    }

    $sql = 'UPDATE user_inquiry SET ' . implode(', ', $updates) . ' WHERE idx = :idx';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $fetch = $pdo->prepare('SELECT * FROM user_inquiry WHERE idx = :idx LIMIT 1');
    $fetch->execute(['idx' => $idx]);
    $row = $fetch->fetch(PDO::FETCH_ASSOC);

    board_json_response([
        'ok'   => true,
        'item' => $row ? inquiry_format_detail_row($row) : null,
    ]);
} catch (PDOException $e) {
    error_log('inquiry update error: ' . $e->getMessage());
    board_json_response(['error' => '저장에 실패했습니다.'], 500);
}
