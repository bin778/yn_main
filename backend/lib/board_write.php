<?php

const BOARD_FILE_URL_BASE_DEFAULT = 'https://yeoon.co.kr/board/data/file';

function board_file_url_base(): string
{
    global $BOARD_FILE_URL_BASE;

    if (!empty($BOARD_FILE_URL_BASE) && is_string($BOARD_FILE_URL_BASE)) {
        return rtrim($BOARD_FILE_URL_BASE, '/');
    }

    return BOARD_FILE_URL_BASE_DEFAULT;
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

    $wr_2 = trim((string) ($body['wr_seo_slug'] ?? $body['wr_2'] ?? ''));
    if ($wr_2 === '' && $wr_subject !== '') {
        $wr_2 = board_slugify($wr_subject);
    }

    return [
        'wr_subject'  => $wr_subject,
        'wr_content'  => $wr_content,
        'wr_datetime' => $wr_datetime,
        'wr_option'   => board_build_wr_option($notice),
        'wr_1'        => $wr_1,
        'wr_2'        => $wr_2,
        'wr_3'        => $wr_3,
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
        'wr_seo_slug'   => (string) ($row['wr_2'] ?? ''),
        'wr_seo_title'  => (string) ($row['wr_3'] ?? ''),
        'bo_table'      => $bo_table,
    ];
}
