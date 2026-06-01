<?php

/**
 * 게시판 관리자 세션 API
 *
 * GET /api/board/get_session.php
 *
 * Query Parameters:
 *   bo_table  string  대상 게시판 (review|success|column|news)
 *   wr_id     int     게시물 번호 (선택, 상세 페이지 수정/삭제 링크용)
 *
 * Response:
 *   {
 *     is_admin: '' | 'super' | 'group' | 'board',
 *     mb_name: string | null,
 *     write_href: string | null,
 *     update_href: string | null,
 *     delete_href: string | null
 *   }
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://yeoon.co.kr',
    'https://www.yeoon.co.kr',
    'http://localhost:3000',
    'http://localhost:4173',
];

if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => '허용되지 않은 요청입니다.'], JSON_UNESCAPED_UNICODE);
    exit;
}

const ALLOWED_TABLES = ['review', 'success', 'column', 'news'];
const GNUBOARD_PATH  = '/lawfirmonly1/www/board';

/**
 * @param array<string, mixed> $payload
 */
function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function empty_session_response(): void
{
    json_response([
        'is_admin'    => '',
        'mb_name'     => null,
        'write_href'  => null,
        'update_href' => null,
        'delete_href' => null,
    ]);
}

$raw_table = trim((string) ($_GET['bo_table'] ?? ''));

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $raw_table) ||
    !in_array($raw_table, ALLOWED_TABLES, true)
) {
    json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

$wr_id = (int) ($_GET['wr_id'] ?? 0);

if (!is_dir(GNUBOARD_PATH)) {
    json_response(['error' => '그누보드를 불러올 수 없습니다.'], 500);
}

if (!function_exists('set_session')) {
    /**
     * @param string $session_name
     * @param mixed  $value
     */
    function set_session(string $session_name, $value): void
    {
    }
}

chdir(GNUBOARD_PATH);
require_once './bbs/_common.php';

/** @var ''|'super'|'group'|'board' $is_admin */
/** @var string $bo_table */
/** @var array<string, mixed> $member */
/** @var array<string, mixed> $write */

if (!$is_admin) {
    empty_session_response();
}

$write_href = '/board/bbs/write.php?bo_table=' . $bo_table;
$update_href = null;
$delete_href = null;

if ($wr_id > 0 && isset($write['wr_id']) && (int) $write['wr_id'] === $wr_id) {
    $can_modify = ($member['mb_id'] && ($member['mb_id'] === $write['mb_id'])) || $is_admin;

    if ($can_modify) {
        $update_href = '/board/bbs/write.php?w=u&bo_table=' . $bo_table . '&wr_id=' . $wr_id;
        set_session('ss_delete_token', $token = uniqid((string) time(), true));
        $delete_href = '/board/bbs/delete.php?bo_table=' . $bo_table . '&wr_id=' . $wr_id . '&token=' . $token;
    }
}

json_response([
    'is_admin'    => $is_admin,
    'mb_name'     => $member['mb_name'] ?? null,
    'write_href'  => $write_href,
    'update_href' => $update_href,
    'delete_href' => $delete_href,
]);
