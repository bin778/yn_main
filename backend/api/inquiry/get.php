<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/inquiry_admin.php';

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

$idx = (int) ($_GET['idx'] ?? 0);
if ($idx <= 0) {
    board_json_response(['error' => '유효하지 않은 문의 번호입니다.'], 400);
}

try {
    $stmt = $pdo->prepare('SELECT * FROM user_inquiry WHERE idx = :idx LIMIT 1');
    $stmt->execute(['idx' => $idx]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        board_json_response(['error' => '문의를 찾을 수 없습니다.'], 404);
    }

    board_json_response([
        'ok'   => true,
        'item' => inquiry_format_detail_row($row),
    ]);
} catch (PDOException $e) {
    error_log('inquiry get error: ' . $e->getMessage());
    board_json_response(['error' => '문의를 불러오지 못했습니다.'], 500);
}
