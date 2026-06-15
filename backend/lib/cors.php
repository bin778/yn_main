<?php

const BOARD_ALLOWED_ORIGINS = [
    'https://yeoon.co.kr',
    'https://www.yeoon.co.kr',
    'https://new.yeoon.co.kr',
    'http://localhost:3000',
    'http://localhost:4173',
];

function board_apply_cors(string $methods = 'GET, POST, OPTIONS'): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '' && in_array($origin, BOARD_ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: ' . $methods);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
}

function board_handle_options(string $methods = 'GET, POST, OPTIONS'): void
{
    board_apply_cors($methods);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}
