<?php

const BOARD_SCHEMA_MAX_BYTES = 65536;

const BOARD_CONTENT_MODES = ['rich', 'legacy_html'];

/**
 * @return string|null 오류 메시지 또는 null
 */
function board_validate_schema_json(string $raw): ?string
{
    $trimmed = trim($raw);
    if ($trimmed === '') {
        return null;
    }

    if (strlen($trimmed) > BOARD_SCHEMA_MAX_BYTES) {
        return '구조화 데이터(JSON-LD)가 너무 깁니다.';
    }

    json_decode($trimmed, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return '구조화 데이터(JSON-LD) 형식이 올바르지 않습니다.';
    }

    return null;
}

function board_normalize_content_mode(?string $value): string
{
    $mode = trim((string) $value);
    if ($mode === 'legacy_html') {
        return 'legacy_html';
    }

    return 'rich';
}

/**
 * 레거시 에디터가 JSON 안 URL을 <a> 태그로 감싼 경우 정제한다.
 */
function board_normalize_legacy_schema_json(string $raw): string
{
    $trimmed = trim($raw);
    if ($trimmed === '') {
        return '';
    }

    $normalized = preg_replace_callback(
        '/<a\s+[^>]*href\s*=\s*["\']([^"\']+)["\'][^>]*>.*?<\/a>/is',
        function (array $matches): string {
            return $matches[1];
        },
        $trimmed
    );

    return is_string($normalized) ? $normalized : $trimmed;
}

/**
 * @return array{schema: string, content: string}
 */
function board_extract_schema_from_content(string $html): array
{
    $schema = '';
    $content = $html;

    if (preg_match(
        '/<script[^>]*type\s*=\s*["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is',
        $html,
        $matches
    )) {
        $schema = board_normalize_legacy_schema_json(trim($matches[1]));
        $content = preg_replace(
            '/<script[^>]*type\s*=\s*["\']application\/ld\+json["\'][^>]*>.*?<\/script>/is',
            '',
            $html
        );
        if (!is_string($content)) {
            $content = $html;
        }
        $content = trim($content);
    }

    return [
        'schema'  => $schema,
        'content' => $content,
    ];
}

function board_detect_legacy_html_content(string $html): bool
{
    if (preg_match('/border-radius\s*:/i', $html)) {
        return true;
    }

    if (preg_match('/\salign\s*=\s*["\']?center/i', $html)) {
        return true;
    }

    if (preg_match('/style\s*=\s*["\'][^"\']*(?:margin|padding|font-size|line-height|border-left)/i', $html)) {
        return true;
    }

    if (preg_match('/style\s*=\s*["\'][^"\']*(?:background-color|background)/i', $html)) {
        return true;
    }

    if (preg_match('/style\s*=\s*["\'][^"\']*display\s*:\s*flex/i', $html)) {
        return true;
    }

    if (preg_match('/<a\b[^>]*\sstyle\s*=\s*["\'][^"\']*(?:background|border-radius)/i', $html)) {
        return true;
    }

    if (preg_match('/\bclass\s*=\s*["\'][^"\']*\byn-(?:cta|btn)\b/i', $html)) {
        return true;
    }

    return false;
}
