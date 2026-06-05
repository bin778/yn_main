<?php

require_once __DIR__ . '/pbkdf2.php';
require_once __DIR__ . '/password_verify.php';

const BOARD_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const BOARD_ATTACHMENT_PASSWORD_MIN = 4;
const BOARD_ATTACHMENT_PASSWORD_MAX = 64;
const BOARD_UPLOAD_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/** @see frontend/app/admin/lib/boardAttachmentAccept.ts — 확장자 목록 동기화 */
const BOARD_UPLOAD_FILE_EXT = [
    'jpg', 'jpeg', 'png', 'gif', 'webp',
    'pdf',
    'doc', 'docx', 'hwp', 'hwpx', 'txt', 'rtf', 'odt',
    'xls', 'xlsx', 'csv', 'ods',
    'ppt', 'pptx',
    'zip', '7z', 'rar',
];

function board_file_storage_dir(string $bo_table): string
{
    global $BOARD_FILE_DIR;

    if (empty($BOARD_FILE_DIR) || !is_string($BOARD_FILE_DIR)) {
        throw new RuntimeException('BOARD_FILE_DIR가 설정되지 않았습니다. app_config.php를 확인하세요.');
    }

    $base = rtrim($BOARD_FILE_DIR, '/');
    $dir = $base . '/' . $bo_table;

    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('업로드 디렉터리를 만들 수 없습니다.');
    }

    return $dir;
}

/**
 * @param array<string, mixed> $file  $_FILES 항목
 */
function board_validate_upload_file(array $file, bool $images_only): void
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException('파일 업로드에 실패했습니다.');
    }

    if (($file['size'] ?? 0) > BOARD_UPLOAD_MAX_BYTES) {
        throw new InvalidArgumentException('파일 크기는 10MB 이하여야 합니다.');
    }

    $original = (string) ($file['name'] ?? '');
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    $allowed = $images_only ? BOARD_UPLOAD_IMAGE_EXT : BOARD_UPLOAD_FILE_EXT;

    if (!in_array($ext, $allowed, true)) {
        throw new InvalidArgumentException('허용되지 않는 파일 형식입니다.');
    }
}

function board_generate_stored_filename(string $original_name): string
{
    $ext = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

    return time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
}

/**
 * @return array{width: int, height: int}|null
 */
function board_image_dimensions(string $path): ?array
{
    $info = @getimagesize($path);
    if ($info === false) {
        return null;
    }

    return ['width' => (int) $info[0], 'height' => (int) $info[1]];
}

function board_public_file_url(string $bo_table, string $stored_name): string
{
    return board_file_url_base() . '/' . $bo_table . '/' . rawurlencode($stored_name);
}

/**
 * @param array<string, mixed> $file
 * @return array{url: string, stored_name: string, source: string, size: int, width: int|null, height: int|null}
 */
function board_store_uploaded_file(string $bo_table, array $file, bool $images_only): array
{
    board_validate_upload_file($file, $images_only);

    $dir = board_file_storage_dir($bo_table);
    $source = (string) ($file['name'] ?? 'upload');
    $stored = board_generate_stored_filename($source);
    $target = $dir . '/' . $stored;

    if (!move_uploaded_file((string) $file['tmp_name'], $target)) {
        throw new RuntimeException('파일을 저장하지 못했습니다.');
    }

    $dims = board_image_dimensions($target);

    return [
        'url'         => board_public_file_url($bo_table, $stored),
        'stored_name' => $stored,
        'source'      => $source,
        'size'        => (int) filesize($target),
        'width'       => $dims['width'] ?? null,
        'height'      => $dims['height'] ?? null,
    ];
}

function board_attachment_has_password(string $bf_content): bool
{
    return trim($bf_content) !== '';
}

function board_validate_attachment_password(string $password): void
{
    $len = mb_strlen($password, 'UTF-8');
    if ($len < BOARD_ATTACHMENT_PASSWORD_MIN || $len > BOARD_ATTACHMENT_PASSWORD_MAX) {
        throw new InvalidArgumentException(
            '다운로드 비밀번호는 ' . BOARD_ATTACHMENT_PASSWORD_MIN
            . '~' . BOARD_ATTACHMENT_PASSWORD_MAX . '자여야 합니다.'
        );
    }
}

function board_hash_attachment_password(string $password): string
{
    board_validate_attachment_password($password);

    return pbkdf2_create_hash($password);
}

function board_verify_attachment_password(string $password, string $stored_hash, PDO $pdo): bool
{
    return board_verify_password($password, $stored_hash, $pdo);
}

/**
 * @return array<string, mixed>|null
 */
function board_fetch_attachment(PDO $pdo, string $bo_table, int $wr_id, int $bf_no = 0): ?array
{
    $stmt = $pdo->prepare(
        'SELECT bf_no, bf_source, bf_file, bf_filesize, bf_width, bf_height, bf_content
         FROM g5_board_file
         WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no
         LIMIT 1'
    );
    $stmt->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id, 'bf_no' => $bf_no]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

/**
 * @return array{no: int, source: string, url: string|null, size: int, is_image: bool, width: int|null, height: int|null, has_password: bool}
 */
function board_format_attachment_meta(array $file, string $bo_table): array
{
    $is_image = (int) $file['bf_width'] > 0;
    $has_password = board_attachment_has_password((string) ($file['bf_content'] ?? ''));

    return [
        'no'           => (int) $file['bf_no'],
        'source'       => $file['bf_source'],
        'url'          => $has_password ? null : board_public_file_url($bo_table, (string) $file['bf_file']),
        'size'         => (int) $file['bf_filesize'],
        'is_image'     => $is_image,
        'width'        => $is_image ? (int) $file['bf_width'] : null,
        'height'       => $is_image ? (int) $file['bf_height'] : null,
        'has_password' => $has_password,
    ];
}

function board_set_attachment_password(PDO $pdo, string $bo_table, int $wr_id, string $password): void
{
    $attachment = board_fetch_attachment($pdo, $bo_table, $wr_id);
    if ($attachment === null) {
        throw new InvalidArgumentException('첨부 파일이 없습니다.');
    }

    $hash = board_hash_attachment_password($password);
    $pdo->prepare(
        'UPDATE g5_board_file SET bf_content = :bf_content
         WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no'
    )->execute([
        'bf_content' => $hash,
        'bo_table'   => $bo_table,
        'wr_id'      => $wr_id,
        'bf_no'      => (int) $attachment['bf_no'],
    ]);
}

function board_clear_attachment_password(PDO $pdo, string $bo_table, int $wr_id): void
{
    $attachment = board_fetch_attachment($pdo, $bo_table, $wr_id);
    if ($attachment === null) {
        return;
    }

    $pdo->prepare(
        'UPDATE g5_board_file SET bf_content = ""
         WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no'
    )->execute([
        'bo_table' => $bo_table,
        'wr_id'    => $wr_id,
        'bf_no'    => (int) $attachment['bf_no'],
    ]);
}

function board_stream_attachment_file(PDO $pdo, string $bo_table, int $wr_id, int $bf_no = 0): void
{
    $attachment = board_fetch_attachment($pdo, $bo_table, $wr_id, $bf_no);
    if ($attachment === null || empty($attachment['bf_file'])) {
        throw new RuntimeException('첨부 파일을 찾을 수 없습니다.');
    }

    $stored_name = (string) $attachment['bf_file'];
    if (preg_match('/[^a-zA-Z0-9._-]/', $stored_name)) {
        throw new RuntimeException('유효하지 않은 파일입니다.');
    }

    $path = board_file_storage_dir($bo_table) . '/' . $stored_name;
    if (!is_file($path)) {
        throw new RuntimeException('파일이 존재하지 않습니다.');
    }

    $pdo->prepare(
        'UPDATE g5_board_file SET bf_download = bf_download + 1
         WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no'
    )->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id, 'bf_no' => $bf_no]);

    $source = (string) $attachment['bf_source'];
    $ascii_name = preg_replace('/[^\x20-\x7E]/', '_', $source) ?? 'download';
    $utf8_name = rawurlencode($source);

    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $ascii_name . '"; filename*=UTF-8\'\'' . $utf8_name);
    header('Content-Length: ' . (string) filesize($path));
    header('Cache-Control: no-store');

    readfile($path);
    exit;
}

function board_delete_stored_file(string $bo_table, string $stored_name): void
{
    if ($stored_name === '' || preg_match('/[^a-zA-Z0-9._-]/', $stored_name)) {
        return;
    }

    try {
        $path = board_file_storage_dir($bo_table) . '/' . $stored_name;
        if (is_file($path)) {
            unlink($path);
        }
    } catch (Throwable $e) {
        error_log('board_delete_stored_file: ' . $e->getMessage());
    }
}

function board_upsert_attachment(
    PDO $pdo,
    string $bo_table,
    int $wr_id,
    array $stored,
    string $password_hash = ''
): void {
    $write_table = 'g5_write_' . $bo_table;
    $bf_no = 0;

    $existing = $pdo->prepare(
        'SELECT bf_file FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no LIMIT 1'
    );
    $existing->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id, 'bf_no' => $bf_no]);
    $old = $existing->fetch(PDO::FETCH_ASSOC);
    if ($old && !empty($old['bf_file'])) {
        board_delete_stored_file($bo_table, (string) $old['bf_file']);
    }

    $pdo->prepare(
        'DELETE FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no'
    )->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id, 'bf_no' => $bf_no]);

    $width = $stored['width'] ?? 0;
    $height = $stored['height'] ?? 0;
    $bf_type = $width > 0 ? 1 : 0;

    $insert = $pdo->prepare(
        'INSERT INTO g5_board_file
            (bo_table, wr_id, bf_no, bf_source, bf_file, bf_download, bf_content, bf_filesize,
             bf_width, bf_height, bf_type, bf_datetime)
         VALUES
            (:bo_table, :wr_id, :bf_no, :bf_source, :bf_file, 0, :bf_content, :bf_filesize,
             :bf_width, :bf_height, :bf_type, :bf_datetime)'
    );
    $insert->execute([
        'bo_table'    => $bo_table,
        'wr_id'       => $wr_id,
        'bf_no'       => $bf_no,
        'bf_source'   => $stored['source'],
        'bf_file'     => $stored['stored_name'],
        'bf_content'  => $password_hash,
        'bf_filesize' => $stored['size'],
        'bf_width'    => $width,
        'bf_height'   => $height,
        'bf_type'     => $bf_type,
        'bf_datetime' => date('Y-m-d H:i:s'),
    ]);

    $pdo->prepare("UPDATE `{$write_table}` SET wr_file = 1 WHERE wr_id = :wr_id")
        ->execute(['wr_id' => $wr_id]);
}

function board_remove_attachment(PDO $pdo, string $bo_table, int $wr_id): void
{
    $write_table = 'g5_write_' . $bo_table;
    $bf_no = 0;

    $existing = $pdo->prepare(
        'SELECT bf_file FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no LIMIT 1'
    );
    $existing->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id, 'bf_no' => $bf_no]);
    $old = $existing->fetch(PDO::FETCH_ASSOC);
    if ($old && !empty($old['bf_file'])) {
        board_delete_stored_file($bo_table, (string) $old['bf_file']);
    }

    $pdo->prepare(
        'DELETE FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id AND bf_no = :bf_no'
    )->execute(['bo_table' => $bo_table, 'wr_id' => $wr_id, 'bf_no' => $bf_no]);

    $pdo->prepare("UPDATE `{$write_table}` SET wr_file = 0 WHERE wr_id = :wr_id")
        ->execute(['wr_id' => $wr_id]);
}
