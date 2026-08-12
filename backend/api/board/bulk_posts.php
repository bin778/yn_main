<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/board_bulk.php';

board_handle_options('POST, OPTIONS');

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

if (strtoupper((string) $_SERVER['REQUEST_METHOD']) !== 'POST') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw === false ? '' : $raw, true);
if (!is_array($body)) {
    $body = $_POST;
}

$bo_table = trim((string) ($body['bo_table'] ?? ''));
$action = trim((string) ($body['action'] ?? ''));

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $bo_table) ||
    !in_array($bo_table, BOARD_ALLOWED_TABLES, true)
) {
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

if ($action !== 'section' && $action !== 'move') {
    board_json_response(['error' => '유효하지 않은 작업입니다.'], 400);
}

$auth = board_require_admin($pdo, $JWT_SECRET, $JWT_COOKIE_NAME, $bo_table);
if ($auth === null) {
    board_json_response(['error' => '인증이 필요합니다.'], 401);
}

$parsed_ids = board_parse_wr_ids($body['wr_ids'] ?? null);
if ($parsed_ids['error'] !== null) {
    board_json_response(['error' => $parsed_ids['error']], 400);
}

$wr_ids = $parsed_ids['ids'];
$wr_7_raw = trim((string) ($body['wr_7'] ?? $body['category'] ?? ''));
$wr_8_raw = trim((string) ($body['wr_8'] ?? $body['subcategory'] ?? ''));

if ($action === 'section') {
    $section = board_normalize_section_pair($bo_table, $wr_7_raw, $wr_8_raw);
    if ($section['error'] !== null) {
        board_json_response(['error' => $section['error']], 400);
    }

    $write_table = 'g5_write_' . $bo_table;
    $placeholders = implode(',', array_fill(0, count($wr_ids), '?'));
    $sql = "UPDATE `{$write_table}`
            SET wr_7 = ?, wr_8 = ?
            WHERE wr_is_comment = 0 AND wr_id IN ({$placeholders})";
    $params = array_merge(array($section['wr_7'], $section['wr_8']), $wr_ids);

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        board_json_response(array(
            'ok'      => true,
            'action'  => 'section',
            'updated' => $stmt->rowCount(),
            'wr_ids'  => $wr_ids,
            'bo_table'=> $bo_table,
        ));
    } catch (Throwable $e) {
        error_log('bulk_posts section failed: ' . $e->getMessage());
        board_json_response(['error' => '분류를 변경하지 못했습니다.'], 500);
    }
}

$target_bo_table = trim((string) ($body['target_bo_table'] ?? ''));
if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $target_bo_table) ||
    !in_array($target_bo_table, BOARD_ALLOWED_TABLES, true)
) {
    board_json_response(['error' => '이동할 게시판이 올바르지 않습니다.'], 400);
}

if ($target_bo_table === $bo_table) {
    board_json_response(['error' => '같은 게시판으로는 이동할 수 없습니다.'], 400);
}

if ($auth['role'] !== 'super') {
    $target_auth = board_require_admin($pdo, $JWT_SECRET, $JWT_COOKIE_NAME, $target_bo_table);
    if ($target_auth === null) {
        board_json_response(['error' => '이동할 게시판 권한이 없습니다.'], 403);
    }
}

$section = board_normalize_section_pair($target_bo_table, $wr_7_raw, $wr_8_raw);
if ($section['error'] !== null) {
    board_json_response(['error' => $section['error']], 400);
}

$moved = array();
$source_files_to_delete = array();

try {
    $pdo->beginTransaction();

    foreach ($wr_ids as $src_wr_id) {
        $result = board_move_single_post(
            $pdo,
            $bo_table,
            $src_wr_id,
            $target_bo_table,
            $section['wr_7'],
            $section['wr_8']
        );
        $source_files = board_delete_moved_source($pdo, $bo_table, $src_wr_id);
        $source_files_to_delete = array_merge($source_files_to_delete, $source_files);
        $moved[] = array(
            'from_wr_id' => $src_wr_id,
            'to_wr_id'   => $result['new_wr_id'],
            'to_bo_table'=> $target_bo_table,
        );
    }

    $write_delta = count($moved);
    $pdo->prepare(
        'UPDATE g5_board SET bo_count_write = GREATEST(0, CAST(bo_count_write AS SIGNED) - :delta)
         WHERE bo_table = :bo_table'
    )->execute(array('delta' => $write_delta, 'bo_table' => $bo_table));
    $pdo->prepare(
        'UPDATE g5_board SET bo_count_write = CAST(bo_count_write AS SIGNED) + :delta
         WHERE bo_table = :bo_table'
    )->execute(array('delta' => $write_delta, 'bo_table' => $target_bo_table));

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('bulk_posts move failed: ' . $e->getMessage());
    board_json_response(['error' => '게시물을 이동하지 못했습니다.'], 500);
}

foreach ($source_files_to_delete as $stored_name) {
    board_delete_stored_file($bo_table, $stored_name);
}

board_json_response(array(
    'ok'             => true,
    'action'         => 'move',
    'moved'          => count($moved),
    'items'          => $moved,
    'bo_table'       => $bo_table,
    'target_bo_table'=> $target_bo_table,
));
