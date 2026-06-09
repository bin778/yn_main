<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/board_write.php';
require_once __DIR__ . '/../../lib/board_files.php';

board_handle_options('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$bo_table = trim((string) ($_GET['bo_table'] ?? ''));
$wr_id = (int) ($_GET['wr_id'] ?? 0);

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $bo_table) ||
    !in_array($bo_table, BOARD_ALLOWED_TABLES, true)
) {
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

if ($wr_id <= 0) {
    board_json_response(['error' => '유효하지 않은 게시물 번호입니다.'], 400);
}

$auth = board_require_admin($pdo, $JWT_SECRET, $JWT_COOKIE_NAME, $bo_table);
if ($auth === null) {
    board_json_response(['error' => '인증이 필요합니다.'], 403);
}

$write_table = 'g5_write_' . $bo_table;

try {
    $stmt = $pdo->prepare(
        "SELECT wr_id, wr_subject, wr_content, wr_name, wr_datetime, wr_hit, wr_file, wr_option,
                wr_1, wr_2, wr_3, wr_4, wr_5, wr_6
         FROM `{$write_table}`
         WHERE wr_id = :wr_id AND wr_is_comment = 0
         LIMIT 1"
    );
    $stmt->execute(['wr_id' => $wr_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        board_json_response(['error' => '게시물을 찾을 수 없습니다.'], 404);
    }

    $files_stmt = $pdo->prepare(
        'SELECT bf_no, bf_source, bf_file, bf_filesize, bf_width, bf_height, bf_content
         FROM g5_board_file
         WHERE bo_table = :bo_table AND wr_id = :wr_id
         ORDER BY bf_no ASC'
    );
    $files_stmt->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id]);
    $file_rows = $files_stmt->fetchAll(PDO::FETCH_ASSOC);

    $files = array_map(function (array $file) use ($bo_table, $wr_id): array {
        return board_format_attachment_meta($file, $bo_table, $wr_id);
    }, $file_rows);

    $item = board_format_admin_post($row, $bo_table);
    $item['files'] = $files;

    board_json_response(['ok' => true, 'item' => $item]);
} catch (PDOException $e) {
    error_log('get_post error: ' . $e->getMessage());
    board_json_response(['error' => '게시물을 불러오지 못했습니다.'], 500);
}
