<?php

/**
 * @deprecated Use /api/board/auth/me.php (JWT). Kept for backward compatibility.
 */
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

require_once __DIR__ . '/auth/me.php';
