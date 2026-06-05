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

$bo_table = trim((string) ($_GET['bo_table'] ?? ''));

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $bo_table) ||
    !in_array($bo_table, BOARD_ALLOWED_TABLES, true)
) {
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

$auth = board_require_admin($pdo, $JWT_SECRET, $JWT_COOKIE_NAME, $bo_table);
if ($auth === null) {
    board_json_response(['error' => '인증이 필요합니다.'], 403);
}

$write_table = 'g5_write_' . $bo_table;

try {
    $count_sql = "SELECT COUNT(*) FROM `{$write_table}` WHERE wr_is_comment = 0 AND wr_datetime > NOW()";
    $total = (int) $pdo->query($count_sql)->fetchColumn();

    $list_sql = "SELECT wr_id, wr_subject, wr_name, wr_datetime
                 FROM `{$write_table}`
                 WHERE wr_is_comment = 0 AND wr_datetime > NOW()
                 ORDER BY wr_datetime ASC, wr_id ASC";
    $rows = $pdo->query($list_sql)->fetchAll(PDO::FETCH_ASSOC);

    $items = array_map(function (array $row): array {
        return [
            'wr_id'       => (int) $row['wr_id'],
            'wr_subject'  => (string) $row['wr_subject'],
            'wr_name'     => (string) $row['wr_name'],
            'wr_datetime' => (string) $row['wr_datetime'],
        ];
    }, $rows);

    board_json_response([
        'ok'    => true,
        'total' => $total,
        'items' => $items,
    ]);
} catch (PDOException $e) {
    error_log('[board/get_scheduled_list] DB error: ' . $e->getMessage());
    board_json_response(['error' => '예약글 목록을 불러오지 못했습니다.'], 500);
}
