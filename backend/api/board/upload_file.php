<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/board_write.php';
require_once __DIR__ . '/../../lib/board_files.php';

board_handle_options('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$bo_table = trim((string) ($_POST['bo_table'] ?? ''));
$wr_id = (int) ($_POST['wr_id'] ?? 0);
$purpose = trim((string) ($_POST['purpose'] ?? 'editor_image'));

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $bo_table) ||
    !in_array($bo_table, BOARD_ALLOWED_TABLES, true)
) {
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

if (!in_array($purpose, ['editor_image', 'thumbnail', 'attachment'], true)) {
    board_json_response(['error' => '유효하지 않은 업로드 유형입니다.'], 400);
}

$auth = board_require_admin($pdo, $JWT_SECRET, $JWT_COOKIE_NAME, $bo_table);
if ($auth === null) {
    board_json_response(['error' => '인증이 필요합니다.'], 403);
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    board_json_response(['error' => '파일이 없습니다.'], 400);
}

if ($purpose === 'attachment' && $wr_id <= 0) {
    board_json_response(['error' => '첨부 파일은 글 저장 후 업로드할 수 있습니다.'], 400);
}

try {
    $images_only = $purpose !== 'attachment';
    $stored = board_store_uploaded_file($bo_table, $_FILES['file'], $images_only);
    $password_hash = '';

    if ($purpose === 'attachment') {
        $check = $pdo->prepare(
            'SELECT wr_id FROM g5_write_' . $bo_table . ' WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1'
        );
        $check->execute(['wr_id' => $wr_id]);
        if (!$check->fetch(PDO::FETCH_ASSOC)) {
            board_delete_stored_file($bo_table, $stored['stored_name']);
            board_json_response(['error' => '게시물을 찾을 수 없습니다.'], 404);
        }
        $attachment_password = trim((string) ($_POST['attachment_password'] ?? ''));
        if ($attachment_password !== '') {
            $password_hash = board_hash_attachment_password($attachment_password);
        }
        board_upsert_attachment($pdo, $bo_table, $wr_id, $stored, $password_hash);
    }

    $has_password = $purpose === 'attachment' && $password_hash !== '';

    $public_url = null;
    if ($purpose === 'attachment' && !$has_password && $wr_id > 0) {
        $public_url = board_attachment_download_url($bo_table, $wr_id, 0);
    } elseif (!$has_password) {
        $public_url = $stored['url'];
    }

    board_json_response([
        'ok'   => true,
        'url'  => $public_url,
        'file' => [
            'source'       => $stored['source'],
            'size'         => $stored['size'],
            'width'        => $stored['width'],
            'height'       => $stored['height'],
            'has_password' => $has_password,
        ],
    ]);
} catch (InvalidArgumentException $e) {
    board_json_response(['error' => $e->getMessage()], 400);
} catch (RuntimeException $e) {
    error_log('upload_file runtime error: ' . $e->getMessage());
    board_json_response(['error' => $e->getMessage()], 500);
} catch (Throwable $e) {
    error_log('upload_file error: ' . $e->getMessage());
    board_json_response(['error' => '파일 업로드에 실패했습니다.'], 500);
}
