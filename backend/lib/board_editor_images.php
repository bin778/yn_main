<?php

const BOARD_EDITOR_SITE_BASE = 'https://yeoon.co.kr';

const BOARD_EDITOR_THUMB_PATTERN =
    '~^(https?://[^/]+)?(/board/data/editor/\d+/)thumb-([^/]+)_\d+x\d+\.(jpe?g|png|gif|webp)(\?.*)?$~i';

const BOARD_EDITOR_ORIGINAL_PATTERN =
    '~^(https?://[^/]+)?(/board/data/editor/\d+/)([^/]+)\.(jpe?g|png|gif|webp)(\?.*)?$~i';

function board_normalize_image_url(string $src): string
{
    $trimmed = trim($src);
    if ($trimmed === '') {
        return $trimmed;
    }

    if (preg_match('/^https?:\/\//i', $trimmed)) {
        return $trimmed;
    }

    if (strpos($trimmed, '//') === 0) {
        return 'https:' . $trimmed;
    }

    if (strpos($trimmed, '/') === 0) {
        return BOARD_EDITOR_SITE_BASE . $trimmed;
    }

    return BOARD_EDITOR_SITE_BASE . '/' . ltrim($trimmed, '/');
}

function board_editor_url_to_filesystem_path(string $url): ?string
{
    $path = parse_url($url, PHP_URL_PATH);
    if (!is_string($path) || strpos($path, '/board/data/editor/') !== 0) {
        return null;
    }

    $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($docRoot === '') {
        return null;
    }

    return $docRoot . $path;
}

function board_editor_image_is_reachable(string $url): bool
{
    $filePath = board_editor_url_to_filesystem_path($url);
    if ($filePath === null) {
        return true;
    }

    return is_file($filePath);
}

function board_build_editor_url(string $webPath, string $referenceUrl): string
{
    if (preg_match('~^https?://[^/]+~i', $referenceUrl, $hostMatch) === 1) {
        return $hostMatch[0] . $webPath;
    }

    return BOARD_EDITOR_SITE_BASE . $webPath;
}

function board_thumb_url_to_original(string $thumbUrl): ?string
{
    if (preg_match(BOARD_EDITOR_THUMB_PATTERN, $thumbUrl, $matches) !== 1) {
        return null;
    }

    $dir = $matches[2];
    $filename = $matches[3];
    $ext = $matches[4];

    return board_build_editor_url($dir . $filename . '.' . $ext, $thumbUrl);
}

function board_find_thumb_url_for_original(string $originalUrl): ?string
{
    if (preg_match(BOARD_EDITOR_ORIGINAL_PATTERN, $originalUrl, $matches) !== 1) {
        return null;
    }

    if (strpos($matches[3], 'thumb-') === 0) {
        return null;
    }

    $dir = $matches[2];
    $filename = $matches[3];
    $ext = $matches[4];

    $fsDir = board_editor_url_to_filesystem_path($dir);
    if ($fsDir === null || !is_dir($fsDir)) {
        return null;
    }

    $pattern = rtrim($fsDir, '/') . '/thumb-' . $filename . '_*.' . $ext;
    $candidates = glob($pattern);
    if ($candidates === false || $candidates === []) {
        return null;
    }

    $thumbWebPath = $dir . basename($candidates[0]);

    return board_build_editor_url($thumbWebPath, $originalUrl);
}

/**
 * 에디터 이미지 URL을 실제 접근 가능한 경로로 정규화한다.
 * 원본만 없고 thumb만 있는 레거시 파일은 thumb URL을 유지한다.
 */
function board_resolve_editor_image_url(string $src): string
{
    $absolute = board_normalize_image_url($src);

    if (preg_match(BOARD_EDITOR_THUMB_PATTERN, $absolute) === 1) {
        $original = board_thumb_url_to_original($absolute);
        if ($original !== null && board_editor_image_is_reachable($original)) {
            return $original;
        }

        return $absolute;
    }

    if (board_editor_image_is_reachable($absolute)) {
        return $absolute;
    }

    $thumb = board_find_thumb_url_for_original($absolute);
    if ($thumb !== null) {
        return $thumb;
    }

    return $absolute;
}

function board_normalize_content_image_sources(string $html): string
{
    return preg_replace_callback(
        '/(<img[^>]*\ssrc=["\'])([^"\']+)(["\'][^>]*>)/i',
        static function (array $matches): string {
            $src = html_entity_decode(trim($matches[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $resolved = board_resolve_editor_image_url($src);

            return $matches[1] . $resolved . $matches[3];
        },
        $html
    ) ?? $html;
}
