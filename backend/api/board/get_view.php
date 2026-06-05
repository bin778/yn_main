<?php

/**
 * 게시물 상세 API
 *
 * GET /backend/api/board/get_view.php
 *
 * Query Parameters:
 *   bo_table  string  대상 게시판 (review|success|column|news)
 *   wr_id     int     게시물 번호
 *
 * Response:
 *   {
 *     wr_id, wr_subject, wr_content, wr_name, wr_datetime, wr_hit,
 *     prev: { wr_id, wr_subject } | null,
 *     next: { wr_id, wr_subject } | null,
 *     files: [{ no, source, url, size, is_image, width, height }]
 *   }
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://yeoon.co.kr',
    'https://www.yeoon.co.kr',
    'https://yn-main-orcin.vercel.app',
    'http://localhost:3000',
    'http://localhost:4173',
];

if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => '허용되지 않은 요청입니다.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../../config/db_conn.php';
require_once __DIR__ . '/../../lib/board_files.php';

const ALLOWED_TABLES  = ['review', 'success', 'column', 'news'];
const BOARD_FILE_BASE = 'https://yeoon.co.kr/board/data/file';
const SITE_BASE_URL   = 'https://yeoon.co.kr';

/**
 * @param array<string, mixed> $payload
 */
function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function normalize_image_url(string $src): string
{
    if (preg_match('/^https?:\/\//i', $src)) {
        return $src;
    }

    if (strpos($src, '//') === 0) {
        return 'https:' . $src;
    }

    if (strpos($src, '/') === 0) {
        return SITE_BASE_URL . $src;
    }

    return SITE_BASE_URL . '/' . ltrim($src, '/');
}

function normalize_legacy_thumb_url(string $src): string
{
    if (
        preg_match(
            '~^(https?://[^/]+)?(/.+/)thumb-([^/]+)_\d+x\d+\.(jpe?g|png|gif|webp)(\?.*)?$~i',
            $src,
            $matches
        ) !== 1
    ) {
        return $src;
    }

    $host = $matches[1] ?? '';
    $dir = $matches[2];
    $filename = $matches[3];
    $ext = $matches[4];

    return $host . $dir . $filename . '.' . $ext;
}

function normalize_content_image_sources(string $html): string
{
    return preg_replace_callback(
        '/(<img[^>]*\ssrc=["\'])([^"\']+)(["\'][^>]*>)/i',
        static function (array $matches): string {
            $src = html_entity_decode(trim($matches[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $absolute = normalize_image_url($src);
            $normalized = normalize_legacy_thumb_url($absolute);
            return $matches[1] . $normalized . $matches[3];
        },
        $html
    ) ?? $html;
}

// ── 입력 검증 ─────────────────────────────────────────────────────────────

$raw_table = trim((string) ($_GET['bo_table'] ?? ''));

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $raw_table) ||
    !in_array($raw_table, ALLOWED_TABLES, true)
) {
    json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

$bo_table = $raw_table;
$table    = 'g5_write_' . $bo_table;
$wr_id    = (int) ($_GET['wr_id'] ?? 0);

if ($wr_id <= 0) {
    json_response(['error' => '유효하지 않은 게시물 번호입니다.'], 400);
}

// ── 게시물 조회 ────────────────────────────────────────────────────────────

try {
    $view_sql = "
        SELECT wr_id, wr_num, wr_subject, wr_content, wr_name, wr_datetime, wr_hit, wr_file, wr_4
        FROM   `{$table}`
        WHERE  wr_id = :wr_id
        AND    wr_is_comment = 0
        AND    wr_datetime <= NOW()
        LIMIT  1
    ";

    $stmt = $pdo->prepare($view_sql);
    $stmt->bindValue(':wr_id', $wr_id, PDO::PARAM_INT);
    $stmt->execute();
    $post = $stmt->fetch();

    if (!$post) {
        json_response(['error' => '게시물을 찾을 수 없습니다.'], 404);
    }

    // ── 조회수 증가 (실패해도 응답에 영향 없음) ───────────────────────────

    try {
        $hit_sql  = "UPDATE `{$table}` SET wr_hit = wr_hit + 1 WHERE wr_id = :wr_id";
        $hit_stmt = $pdo->prepare($hit_sql);
        $hit_stmt->bindValue(':wr_id', $wr_id, PDO::PARAM_INT);
        $hit_stmt->execute();
    } catch (PDOException $e) {
        error_log('[board/get_view] hit count update failed: ' . $e->getMessage());
    }

    // ── 이전 글 (같은 게시판에서 현재보다 wr_num이 큰 것 중 가장 작은 것) ──
    // wr_num은 음수: -1(가장 오래된), -n(가장 최신). 이전 글 = wr_num이 크다 = 더 오래된 글.
    $prev_sql = "
        SELECT wr_id, wr_subject
        FROM   `{$table}`
        WHERE  wr_is_comment = 0
        AND    wr_num > :wr_num
        ORDER  BY wr_num ASC
        LIMIT  1
    ";
    $prev_stmt = $pdo->prepare($prev_sql);
    $prev_stmt->bindValue(':wr_num', (int) $post['wr_num'], PDO::PARAM_INT);
    $prev_stmt->execute();
    $prev_row = $prev_stmt->fetch() ?: null;

    // ── 다음 글 (wr_num이 작은 것 중 가장 큰 것 = 바로 다음으로 최신 글) ──
    $next_sql = "
        SELECT wr_id, wr_subject
        FROM   `{$table}`
        WHERE  wr_is_comment = 0
        AND    wr_num < :wr_num
        ORDER  BY wr_num DESC
        LIMIT  1
    ";
    $next_stmt = $pdo->prepare($next_sql);
    $next_stmt->bindValue(':wr_num', (int) $post['wr_num'], PDO::PARAM_INT);
    $next_stmt->execute();
    $next_row = $next_stmt->fetch() ?: null;

    // ── 첨부파일 조회 ─────────────────────────────────────────────────────

    $files_sql = "
        SELECT bf_no, bf_source, bf_file, bf_filesize, bf_width, bf_height, bf_content
        FROM   g5_board_file
        WHERE  bo_table = :bo_table
        AND    wr_id    = :wr_id
        ORDER  BY bf_no ASC
    ";
    $files_stmt = $pdo->prepare($files_sql);
    $files_stmt->bindValue(':bo_table', $bo_table, PDO::PARAM_STR);
    $files_stmt->bindValue(':wr_id',    $wr_id,    PDO::PARAM_INT);
    $files_stmt->execute();
    $file_rows = $files_stmt->fetchAll();

    $files = array_map(function (array $file) use ($bo_table, $wr_id): array {
        return board_format_attachment_meta($file, $bo_table, $wr_id);
    }, $file_rows);

    // ── 응답 조립 ──────────────────────────────────────────────────────────

    $format_nav = function (?array $row): ?array {
        if ($row === null) return null;
        return [
            'wr_id'      => (int) $row['wr_id'],
            'wr_subject' => $row['wr_subject'],
        ];
    };

    json_response([
        'wr_id'                => (int) $post['wr_id'],
        'wr_subject'           => $post['wr_subject'],
        'wr_content'           => normalize_content_image_sources((string) $post['wr_content']),
        'wr_name'              => $post['wr_name'],
        'wr_datetime'          => $post['wr_datetime'],
        'wr_hit'               => (int) $post['wr_hit'] + 1,
        'wr_seo_description'   => (string) ($post['wr_4'] ?? ''),
        'prev'                 => $format_nav($prev_row),
        'next'                 => $format_nav($next_row),
        'files'                => $files,
    ]);
} catch (PDOException $e) {
    error_log('[board/get_view] DB error: ' . $e->getMessage());
    json_response(['error' => '일시적인 서버 오류가 발생했습니다.'], 500);
}
