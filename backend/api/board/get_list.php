<?php

/**
 * 게시판 목록 API
 *
 * GET /backend/api/board/get_list.php
 *
 * Query Parameters:
 *   bo_table  string  대상 게시판 (review|success|column|news)
 *   page      int     페이지 번호 (기본 1)
 *   per_page  int     페이지당 항목 수 (기본 12, 최대 50)
 *   q         string  검색어
 *   sfl       string  검색 구분(subject|content|subject_content|name)
 *   sort      string  정렬(datetime_desc|datetime_asc|hit_desc|hit_asc|subject_asc|subject_desc)
 *
 * Response:
 *   { total, page, per_page, total_pages, items: [...] }
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

const ALLOWED_TABLES   = ['review', 'success', 'column', 'news'];
const BOARD_FILE_BASE  = 'https://yeoon.co.kr/board/data/file';
const SITE_BASE_URL    = 'https://yeoon.co.kr';
const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE     = 50;
const DEFAULT_SORT     = 'datetime_desc';
const ALLOWED_SORTS    = [
    'datetime_desc' => 'w.wr_datetime DESC, w.wr_id DESC',
    'datetime_asc'  => 'w.wr_datetime ASC, w.wr_id ASC',
    'hit_desc'      => 'w.wr_hit DESC, w.wr_id DESC',
    'hit_asc'       => 'w.wr_hit ASC, w.wr_id ASC',
    'subject_asc'   => 'w.wr_subject ASC, w.wr_id ASC',
    'subject_desc'  => 'w.wr_subject DESC, w.wr_id DESC',
];

/**
 * @param array<string, mixed> $payload
 */
function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function extract_first_image_src(string $html): ?string
{
    if (!preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $html, $matches)) {
        return null;
    }

    $src = trim(html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if ($src === '') {
        return null;
    }

    return $src;
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

$page     = max(1, (int) ($_GET['page']     ?? 1));
$per_page = min(MAX_PER_PAGE, max(1, (int) ($_GET['per_page'] ?? DEFAULT_PER_PAGE)));
$offset   = ($page - 1) * $per_page;
$raw_q    = trim((string) ($_GET['q'] ?? ''));
$q        = mb_substr($raw_q, 0, 100, 'UTF-8');
$has_q    = $q !== '';
$raw_sfl  = trim((string) ($_GET['sfl'] ?? 'subject_content'));
$sfl      = in_array($raw_sfl, ['subject', 'content', 'subject_content', 'name'], true)
    ? $raw_sfl
    : 'subject_content';
$raw_sort = trim((string) ($_GET['sort'] ?? DEFAULT_SORT));
$sort     = array_key_exists($raw_sort, ALLOWED_SORTS) ? $raw_sort : DEFAULT_SORT;
$order_by = ALLOWED_SORTS[$sort];

// ── 총 게시물 수 조회 ─────────────────────────────────────────────────────

try {
    $where_sql = "WHERE wr_is_comment = 0 AND wr_datetime <= NOW()";
    if ($has_q) {
        if ($sfl === 'subject') {
            $where_sql .= " AND wr_subject LIKE :q_subject";
        } elseif ($sfl === 'content') {
            $where_sql .= " AND wr_content LIKE :q_content";
        } elseif ($sfl === 'name') {
            $where_sql .= " AND wr_name LIKE :q_name";
        } else {
            $where_sql .= " AND (wr_subject LIKE :q_subject OR wr_content LIKE :q_content)";
        }
    }

    $count_sql = "SELECT COUNT(*) FROM `{$table}` {$where_sql}";
    $count_stmt = $pdo->prepare($count_sql);
    if ($has_q) {
        if ($sfl === 'subject') {
            $count_stmt->bindValue(':q_subject', '%' . $q . '%', PDO::PARAM_STR);
        } elseif ($sfl === 'content') {
            $count_stmt->bindValue(':q_content', '%' . $q . '%', PDO::PARAM_STR);
        } elseif ($sfl === 'name') {
            $count_stmt->bindValue(':q_name', '%' . $q . '%', PDO::PARAM_STR);
        } else {
            $count_stmt->bindValue(':q_subject', '%' . $q . '%', PDO::PARAM_STR);
            $count_stmt->bindValue(':q_content', '%' . $q . '%', PDO::PARAM_STR);
        }
    }
    $count_stmt->execute();
    $total = (int) $count_stmt->fetchColumn();
    $total_pages = (int) ceil($total / $per_page);

    // ── 목록 조회 (코루레이티드 서브쿼리로 대표 이미지 URL 포함) ──────────

    $list_sql = "
        SELECT
            w.wr_id,
            w.wr_subject,
            w.wr_name,
            w.wr_datetime,
            w.wr_hit,
            w.wr_file,
            w.wr_content,
            w.wr_1,
            w.wr_option,
            (
                SELECT bf_file
                FROM   g5_board_file
                WHERE  bo_table    = :bo_table_sub
                AND    wr_id       = w.wr_id
                AND    bf_width > 0
                ORDER  BY bf_no ASC
                LIMIT  1
            ) AS thumbnail_file
        FROM `{$table}` w
        {$where_sql}
        ORDER BY (CASE WHEN w.wr_option LIKE '%notice%' THEN 0 ELSE 1 END), {$order_by}
        LIMIT :offset, :per_page
    ";

    $stmt = $pdo->prepare($list_sql);
    $stmt->bindValue(':bo_table_sub', $bo_table, PDO::PARAM_STR);
    if ($has_q) {
        if ($sfl === 'subject') {
            $stmt->bindValue(':q_subject', '%' . $q . '%', PDO::PARAM_STR);
        } elseif ($sfl === 'content') {
            $stmt->bindValue(':q_content', '%' . $q . '%', PDO::PARAM_STR);
        } elseif ($sfl === 'name') {
            $stmt->bindValue(':q_name', '%' . $q . '%', PDO::PARAM_STR);
        } else {
            $stmt->bindValue(':q_subject', '%' . $q . '%', PDO::PARAM_STR);
            $stmt->bindValue(':q_content', '%' . $q . '%', PDO::PARAM_STR);
        }
    }
    $stmt->bindValue(':offset',       $offset,   PDO::PARAM_INT);
    $stmt->bindValue(':per_page',     $per_page, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll();

    $items = array_map(function (array $row) use ($bo_table): array {
        $thumbnail_url = null;
        $wr1 = trim((string) ($row['wr_1'] ?? ''));
        if ($wr1 !== '') {
            $thumbnail_url = normalize_legacy_thumb_url(normalize_image_url($wr1));
        } elseif ($row['thumbnail_file'] !== null) {
            $thumbnail_url = BOARD_FILE_BASE . '/' . $bo_table . '/' . $row['thumbnail_file'];
        } else {
            $first_image_src = extract_first_image_src((string) $row['wr_content']);
            if ($first_image_src !== null) {
                $thumbnail_url = normalize_legacy_thumb_url(normalize_image_url($first_image_src));
            }
        }

        return [
            'wr_id'         => (int) $row['wr_id'],
            'wr_subject'    => $row['wr_subject'],
            'wr_name'       => $row['wr_name'],
            'wr_datetime'   => $row['wr_datetime'],
            'wr_hit'        => (int) $row['wr_hit'],
            'has_file'      => (int) $row['wr_file'] > 0,
            'thumbnail_url' => $thumbnail_url,
        ];
    }, $rows);

    json_response([
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $per_page,
        'total_pages' => $total_pages,
        'q'           => $q,
        'sfl'         => $sfl,
        'sort'        => $sort,
        'items'       => $items,
    ]);
} catch (PDOException $e) {
    error_log('[board/get_list] DB error: ' . $e->getMessage());
    json_response(['error' => '일시적인 서버 오류가 발생했습니다.'], 500);
}
