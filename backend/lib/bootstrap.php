<?php

require_once __DIR__ . '/../config/db_conn.php';
require_once __DIR__ . '/client_ip.php';
require_once __DIR__ . '/rate_limit.php';

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
