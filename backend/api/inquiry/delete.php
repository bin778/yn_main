<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/inquiry_admin.php';

board_handle_options('DELETE, POST, OPTIONS');

$method = strtoupper((string) $_SERVER['REQUEST_METHOD']);
if ($method === 'POST') {
    $method = 'DELETE';
}

if ($method !== 'DELETE') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$auth = board_require_super($pdo, $JWT_SECRET, $JWT_COOKIE_NAME);
if ($auth === null) {
    board_json_response(['error' => '최고관리자 권한이 필요합니다.'], 403);
}

$raw  = file_get_contents('php://input');
$body = json_decode($raw === false ? '' : $raw, true);
if (!is_array($body)) {
    board_json_response(['error' => '요청 형식이 올바르지 않습니다.'], 400);
}

$idx = (int) ($body['idx'] ?? 0);
if ($idx <= 0) {
    board_json_response(['error' => '유효하지 않은 문의 번호입니다.'], 400);
}

try {
    $check = $pdo->prepare('SELECT idx FROM user_inquiry WHERE idx = :idx LIMIT 1');
    $check->execute(['idx' => $idx]);
    if (!$check->fetch(PDO::FETCH_ASSOC)) {
        board_json_response(['error' => '문의를 찾을 수 없습니다.'], 404);
    }

    $stmt = $pdo->prepare('DELETE FROM user_inquiry WHERE idx = :idx');
    $stmt->execute(['idx' => $idx]);

    board_json_response(['ok' => true]);
} catch (PDOException $e) {
    error_log('inquiry delete error: ' . $e->getMessage());
    board_json_response(['error' => '삭제에 실패했습니다.'], 500);
}
