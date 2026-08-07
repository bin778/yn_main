<?php

require_once __DIR__ . '/../config/db_conn.php';

$app_config_path = __DIR__ . '/../config/app_config.php';
if (is_file($app_config_path)) {
    require_once $app_config_path;
}

if (!isset($JWT_SECRET) || $JWT_SECRET === '') {
    $JWT_SECRET = getenv('JWT_SECRET') ?: '';
}
if (!isset($JWT_TTL_SECONDS) || (int) $JWT_TTL_SECONDS <= 0) {
    $JWT_TTL_SECONDS = 28800;
}
if (!isset($JWT_COOKIE_NAME) || $JWT_COOKIE_NAME === '') {
    $JWT_COOKIE_NAME = 'yn_board_token';
}
if (!isset($JWT_COOKIE_DOMAIN)) {
    $JWT_COOKIE_DOMAIN = '';
}
if (!isset($BOARD_FILE_DIR) || trim((string) $BOARD_FILE_DIR) === '') {
    $BOARD_FILE_DIR = getenv('BOARD_FILE_DIR') ?: '';
}
if (!isset($BOARD_FILE_URL_BASE) || trim((string) $BOARD_FILE_URL_BASE) === '') {
    $BOARD_FILE_URL_BASE = getenv('BOARD_FILE_URL_BASE') ?: 'https://www.yeoon.co.kr/board/data/file';
}

const BOARD_ALLOWED_TABLES = ['review', 'success', 'column', 'news'];

/**
 * @param array<string, mixed> $payload
 */
function board_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function board_client_ip(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);

        return trim($parts[0]);
    }

    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function board_rate_limit_exceeded(string $action, int $max_per_minute = 10): bool
{
    $dir = sys_get_temp_dir() . '/yn_board_rate';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }

    $key = md5($action . '|' . board_client_ip());
    $file = $dir . '/' . $key;
    $now = time();
    $window = (int) floor($now / 60);
    $data = ['window' => $window, 'count' => 0];

    if (is_file($file)) {
        $raw = @file_get_contents($file);
        if ($raw !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }
    }

    if ((int) ($data['window'] ?? 0) !== $window) {
        $data = ['window' => $window, 'count' => 0];
    }

    $data['count'] = (int) ($data['count'] ?? 0) + 1;
    @file_put_contents($file, json_encode($data), LOCK_EX);

    return $data['count'] > $max_per_minute;
}
