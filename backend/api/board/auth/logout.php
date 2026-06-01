<?php

require_once __DIR__ . '/../../../lib/cors.php';
require_once __DIR__ . '/../../../lib/bootstrap.php';
require_once __DIR__ . '/../../../lib/board_auth.php';

board_handle_options('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

board_clear_auth_cookie($JWT_COOKIE_NAME, $JWT_COOKIE_DOMAIN);

board_json_response(['ok' => true]);
