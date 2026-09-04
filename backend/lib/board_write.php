<?php

require_once __DIR__ . '/board_schema.php';
require_once __DIR__ . '/board_categories.php';

const BOARD_FILE_URL_BASE_DEFAULT = 'https://www.yeoon.co.kr/board/data/file';
const BOARD_FILE_NEW_IMG_SEGMENT = '/new_img';

function board_path_ends_with_new_img(string $path): bool
{
    $trimmed = rtrim($path, '/');

    return substr($trimmed, -strlen(BOARD_FILE_NEW_IMG_SEGMENT)) === BOARD_FILE_NEW_IMG_SEGMENT;
}

/**
 * DIR이 .../file/new_img 인데 URL_BASE에도 /new_img를 붙이면 공개 URL이 new_img/new_img 가 된다.
 */
function board_strip_trailing_new_img(string $path): string
{
    $trimmed = rtrim($path, '/');
    while (board_path_ends_with_new_img($trimmed)) {
        $trimmed = substr($trimmed, 0, -strlen(BOARD_FILE_NEW_IMG_SEGMENT));
        $trimmed = rtrim($trimmed, '/');
    }

    return $trimmed;
}

function board_collapse_leading_new_img(string $suffix): string
{
    $trimmed = ltrim($suffix, '/');
    $collapsed = preg_replace('#^(?:new_img/)+#', 'new_img/', $trimmed);

    return is_string($collapsed) ? $collapsed : $trimmed;
}

function board_file_url_base(): string
{
    global $BOARD_FILE_URL_BASE;

    $base = BOARD_FILE_URL_BASE_DEFAULT;
    if (!empty($BOARD_FILE_URL_BASE) && is_string($BOARD_FILE_URL_BASE)) {
        $base = rtrim($BOARD_FILE_URL_BASE, '/');
    }

    return board_strip_trailing_new_img($base);
}

function board_sanitize_stored_filename(string $stored_name): string
{
    return basename(str_replace('\\', '/', $stored_name));
}

/**
 * 첨부 디스크 경로와 공개 URL suffix (new_img 혼재)
 *
 * @return array<int, array{path: string, suffix: string}>
 */
function board_stored_file_disk_entries(string $bo_table, string $stored_name): array
{
    global $BOARD_FILE_DIR;

    $name = board_sanitize_stored_filename($stored_name);
    $encoded = rawurlencode($name);
    $main_suffix = $bo_table . '/' . $encoded;
    $legacy_suffix = 'new_img/' . $bo_table . '/' . $encoded;
    $entries = [];

    $base = rtrim((string) $BOARD_FILE_DIR, '/');
    if ($base !== '') {
        $base_is_new_img = board_path_ends_with_new_img($base);
        $entries[] = [
            'path' => $base . '/' . $bo_table . '/' . $name,
            'suffix' => $base_is_new_img ? $legacy_suffix : $main_suffix,
        ];
        if ($base_is_new_img) {
            $entries[] = [
                'path' => board_strip_trailing_new_img($base) . '/' . $bo_table . '/' . $name,
                'suffix' => $main_suffix,
            ];
        } else {
            $entries[] = [
                'path' => $base . '/new_img/' . $bo_table . '/' . $name,
                'suffix' => $legacy_suffix,
            ];
        }
    }

    $doc_root = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/') : '';
    if ($doc_root !== '') {
        $entries[] = [
            'path' => $doc_root . '/board/data/file/' . $bo_table . '/' . $name,
            'suffix' => $main_suffix,
        ];
        $entries[] = [
            'path' => $doc_root . '/board/data/file/new_img/' . $bo_table . '/' . $name,
            'suffix' => $legacy_suffix,
        ];
    }

    $unique = [];
    $seen = [];
    foreach ($entries as $entry) {
        if (isset($seen[$entry['path']])) {
            continue;
        }
        $seen[$entry['path']] = true;
        $unique[] = $entry;
    }

    return $unique;
}

function board_stored_file_public_suffix(string $bo_table, string $stored_name): string
{
    $name = board_sanitize_stored_filename($stored_name);
    $main_suffix = $bo_table . '/' . rawurlencode($name);

    foreach (board_stored_file_disk_entries($bo_table, $name) as $entry) {
        if (is_file($entry['path'])) {
            return $entry['suffix'];
        }
    }

    return $main_suffix;
}

/**
 * @return array{notice: bool, html1: bool}
 */
function board_parse_wr_option(?string $wr_option): array
{
    $parts = array_filter(array_map('trim', explode(',', (string) $wr_option)));

    return [
        'notice' => in_array('notice', $parts, true),
        'html1'  => in_array('html1', $parts, true),
    ];
}

function board_build_wr_option(bool $notice): string
{
    $opts = ['html1'];
    if ($notice) {
        $opts[] = 'notice';
    }

    return implode(',', $opts);
}

function board_normalize_datetime(?string $value): ?string
{
    if ($value === null || trim($value) === '') {
        return null;
    }

    $trimmed = trim($value);
    $formats = ['Y-m-d H:i:s', 'Y-m-d\TH:i', 'Y-m-d\TH:i:s'];

    foreach ($formats as $format) {
        $dt = DateTime::createFromFormat($format, $trimmed);
        if ($dt instanceof DateTime) {
            return $dt->format('Y-m-d H:i:s');
        }
    }

    $timestamp = strtotime($trimmed);
    if ($timestamp === false) {
        return null;
    }

    return date('Y-m-d H:i:s', $timestamp);
}

/**
 * 예약 발행 요청 시 wr_datetime이 현재보다 이후인지 검증한다.
 *
 * @return string|null 오류 메시지 또는 null
 */
function board_validate_scheduled_datetime(string $wr_datetime, string $now): ?string
{
    $scheduled = strtotime($wr_datetime);
    $current = strtotime($now);

    if ($scheduled === false || $current === false) {
        return '예약 발행 시각이 올바르지 않습니다.';
    }

    if ($scheduled <= $current) {
        return '예약 발행 시각은 현재보다 이후여야 합니다.';
    }

    return null;
}

function board_slugify(string $text): string
{
    $text = trim($text);
    if ($text === '') {
        return '';
    }

    if (function_exists('transliterator_transliterate')) {
        $latin = transliterator_transliterate('Any-Latin; Latin-ASCII', $text);
        if (is_string($latin) && $latin !== '') {
            $text = $latin;
        }
    }

    $slug = mb_strtolower($text, 'UTF-8');
    $slug = preg_replace('/[^a-z0-9가-힣]+/u', '-', $slug) ?? '';
    $slug = trim((string) $slug, '-');
    $slug = preg_replace('/-+/', '-', $slug) ?? '';

    if (mb_strlen($slug, 'UTF-8') > 120) {
        $slug = mb_substr($slug, 0, 120, 'UTF-8');
        $slug = rtrim($slug, '-');
    }

    return $slug;
}

const BOARD_SEO_SLUG_MAX_LENGTH = 120;

function board_normalize_seo_slug(string $raw): string
{
    $trimmed = trim($raw);
    if ($trimmed === '') {
        return '';
    }

    return board_slugify($trimmed);
}

/**
 * @return string|null 오류 메시지 또는 null
 */
function board_validate_seo_slug(string $slug, PDO $pdo, string $write_table, int $exclude_wr_id = 0): ?string
{
    if ($slug === '') {
        return null;
    }

    if (preg_match('/^\d+$/', $slug)) {
        return 'Slug는 숫자만으로 구성할 수 없습니다.';
    }

    if (mb_strlen($slug, 'UTF-8') > BOARD_SEO_SLUG_MAX_LENGTH) {
        return 'Slug는 ' . BOARD_SEO_SLUG_MAX_LENGTH . '자 이내로 입력해 주세요.';
    }

    $dup_sql = "SELECT wr_id FROM `{$write_table}`
                WHERE wr_2 = :slug AND wr_is_comment = 0 AND wr_id <> :exclude_wr_id
                LIMIT 1";
    $dup_stmt = $pdo->prepare($dup_sql);
    $dup_stmt->execute([
        'slug'          => $slug,
        'exclude_wr_id' => $exclude_wr_id,
    ]);
    if ($dup_stmt->fetch(PDO::FETCH_ASSOC)) {
        return '이미 사용 중인 Slug입니다.';
    }

    return null;
}

/**
 * @return array{mode: 'id'|'slug', value: string}
 */
function board_resolve_post_key(string $post_key): array
{
    $trimmed = trim($post_key);
    if ($trimmed === '') {
        return ['mode' => 'id', 'value' => '0'];
    }

    if (preg_match('/^\d+$/', $trimmed)) {
        return ['mode' => 'id', 'value' => $trimmed];
    }

    return ['mode' => 'slug', 'value' => $trimmed];
}

/**
 * @param array<string, mixed> $body
 * @return array{
 *   wr_subject: string,
 *   wr_content: string,
 *   wr_datetime: string,
 *   wr_option: string,
 *   wr_1: string,
 *   wr_2: string,
 *   wr_3: string,
 *   wr_4: string,
 *   wr_5: string,
 *   wr_6: string,
 *   wr_7: string,
 *   wr_8: string,
 *   notice: bool
 * }
 */
function board_parse_post_body(array $body, string $default_datetime): array
{
    $wr_subject = trim((string) ($body['wr_subject'] ?? ''));
    $wr_content = trim((string) ($body['wr_content'] ?? ''));
    $notice = !empty($body['notice']);
    $wr_datetime = board_normalize_datetime($body['wr_datetime'] ?? null) ?? $default_datetime;

    $wr_1 = trim((string) ($body['wr_1'] ?? ''));
    $wr_3 = trim((string) ($body['wr_seo_title'] ?? $body['wr_3'] ?? ''));
    if ($wr_3 === '' && $wr_subject !== '') {
        $wr_3 = $wr_subject;
    }

    $wr_2_raw = trim((string) ($body['wr_seo_slug'] ?? $body['wr_2'] ?? ''));
    $wr_2 = $wr_2_raw === '' ? '' : board_normalize_seo_slug($wr_2_raw);

    $wr_4 = trim((string) ($body['wr_seo_description'] ?? $body['wr_4'] ?? ''));
    if (mb_strlen($wr_4, 'UTF-8') > 500) {
        $wr_4 = mb_substr($wr_4, 0, 500, 'UTF-8');
    }

    $wr_5 = trim((string) ($body['wr_schema'] ?? $body['wr_5'] ?? ''));
    $wr_6 = 'legacy_html';
    $wr_7 = trim((string) ($body['wr_7'] ?? $body['category'] ?? ''));
    $wr_8 = trim((string) ($body['wr_8'] ?? $body['subcategory'] ?? ''));

    return [
        'wr_subject'  => $wr_subject,
        'wr_content'  => $wr_content,
        'wr_datetime' => $wr_datetime,
        'wr_option'   => board_build_wr_option($notice),
        'wr_1'        => $wr_1,
        'wr_2'        => $wr_2,
        'wr_3'        => $wr_3,
        'wr_4'        => $wr_4,
        'wr_5'        => $wr_5,
        'wr_6'        => $wr_6,
        'wr_7'        => $wr_7,
        'wr_8'        => $wr_8,
        'notice'      => $notice,
    ];
}

/**
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function board_format_admin_post(array $row, string $bo_table): array
{
    $option = board_parse_wr_option($row['wr_option'] ?? '');

    return [
        'wr_id'         => (int) $row['wr_id'],
        'wr_subject'    => $row['wr_subject'],
        'wr_content'    => $row['wr_content'],
        'wr_datetime'   => $row['wr_datetime'],
        'wr_hit'        => (int) ($row['wr_hit'] ?? 0),
        'wr_option'     => $row['wr_option'] ?? '',
        'notice'        => $option['notice'],
        'wr_1'          => (string) ($row['wr_1'] ?? ''),
        'wr_seo_slug'         => (string) ($row['wr_2'] ?? ''),
        'wr_seo_title'        => (string) ($row['wr_3'] ?? ''),
        'wr_seo_description'  => (string) ($row['wr_4'] ?? ''),
        'wr_schema'           => (string) ($row['wr_5'] ?? ''),
        'wr_7'                => (string) ($row['wr_7'] ?? ''),
        'wr_8'                => (string) ($row['wr_8'] ?? ''),
        'bo_table'            => $bo_table,
    ];
}
