<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_write.php';
require_once __DIR__ . '/../../lib/board_files.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, BOARD_ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Expose-Headers: Content-Disposition');
}

header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = strtoupper((string) $_SERVER['REQUEST_METHOD']);
if ($method !== 'GET' && $method !== 'POST') {
    header('Content-Type: application/json; charset=UTF-8');
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($method === 'GET') {
    $params = $_GET;
    $password = '';
} else {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($body)) {
        $body = $_POST;
    }
    $params = $body;
    $password = (string) ($body['password'] ?? '');
}

$bo_table = trim((string) ($params['bo_table'] ?? ''));
$wr_id = (int) ($params['wr_id'] ?? 0);
$bf_no = (int) ($params['bf_no'] ?? 0);

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $bo_table) ||
    !in_array($bo_table, BOARD_ALLOWED_TABLES, true)
) {
    header('Content-Type: application/json; charset=UTF-8');
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

if ($wr_id <= 0) {
    header('Content-Type: application/json; charset=UTF-8');
    board_json_response(['error' => '유효하지 않은 게시물 번호입니다.'], 400);
}

try {
    $write_table = 'g5_write_' . $bo_table;
    $check = $pdo->prepare(
        "SELECT wr_id FROM `{$write_table}` WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1"
    );
    $check->execute(['wr_id' => $wr_id]);
    if (!$check->fetch(PDO::FETCH_ASSOC)) {
        header('Content-Type: application/json; charset=UTF-8');
        // 다운로드 URL은 인덱싱 대상이 아님 — 부재 리소스는 410으로 크롤 Not Found 누적을 막는다
        board_json_response(['error' => '게시물을 찾을 수 없습니다.'], 410);
    }

    $attachment = board_fetch_attachment($pdo, $bo_table, $wr_id, $bf_no);
    if ($attachment === null) {
        header('Content-Type: application/json; charset=UTF-8');
        board_json_response(['error' => '첨부 파일을 찾을 수 없습니다.'], 410);
    }

    $stored_hash = (string) ($attachment['bf_content'] ?? '');
    if (board_attachment_has_password($stored_hash)) {
        if ($method === 'GET') {
            header('Content-Type: application/json; charset=UTF-8');
            board_json_response(['error' => '다운로드 비밀번호가 필요합니다.'], 403);
        }
        if ($password === '') {
            header('Content-Type: application/json; charset=UTF-8');
            board_json_response(['error' => '다운로드 비밀번호를 입력해 주세요.'], 403);
        }
        if (!board_verify_attachment_password($password, $stored_hash, $pdo)) {
            header('Content-Type: application/json; charset=UTF-8');
            board_json_response(['error' => '비밀번호가 올바르지 않습니다.'], 403);
        }
    }

    board_stream_attachment_file($pdo, $bo_table, $wr_id, $bf_no);
} catch (RuntimeException $e) {
    error_log('download_file runtime error: ' . $e->getMessage());
    header('Content-Type: application/json; charset=UTF-8');
    // 디스크 파일 부재·메타 불일치 등 — Gone (404 Soft/Not Found 리포트 억제)
    board_json_response(['error' => $e->getMessage()], 410);
} catch (Throwable $e) {
    error_log('download_file error: ' . $e->getMessage());
    header('Content-Type: application/json; charset=UTF-8');
    board_json_response(['error' => '파일 다운로드에 실패했습니다.'], 500);
}
