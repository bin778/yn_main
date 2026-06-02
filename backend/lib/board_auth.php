<?php

require_once __DIR__ . '/password_verify.php';
require_once __DIR__ . '/jwt.php';

/**
 * @return array<string, mixed>|null
 */
function board_load_member(PDO $pdo, string $mb_id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT mb_id, mb_password, mb_name, mb_nick, mb_level, mb_email, mb_homepage,
                mb_intercept_date, mb_leave_date
        FROM g5_member
        WHERE mb_id = :mb_id
        LIMIT 1'
    );
    $stmt->execute(['mb_id' => $mb_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function board_member_is_active(array $member): bool
{
    $today = date('Ymd');

    if (!empty($member['mb_intercept_date']) && $member['mb_intercept_date'] <= $today) {
        return false;
    }

    if (!empty($member['mb_leave_date']) && $member['mb_leave_date'] <= $today) {
        return false;
    }

    return true;
}

/**
 * @return array<string, mixed>|null
 */
function board_verify_login(PDO $pdo, string $mb_id, string $password): ?array
{
    $member = board_load_member($pdo, $mb_id);
    if ($member === null || !board_member_is_active($member)) {
        return null;
    }

    if (!board_verify_password($password, (string) $member['mb_password'], $pdo)) {
        return null;
    }

    return $member;
}

function board_load_cf_admin(PDO $pdo): string
{
    $stmt = $pdo->query('SELECT cf_admin FROM g5_config LIMIT 1');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ? (string) $row['cf_admin'] : '';
}

/**
 * @return ''|'super'|'board'
 */
function board_resolve_admin_role(PDO $pdo, array $member, string $bo_table): string
{
    if ($bo_table !== '' && !in_array($bo_table, BOARD_ALLOWED_TABLES, true)) {
        return '';
    }

    $mb_id = (string) $member['mb_id'];
    $cf_admin = board_load_cf_admin($pdo);

    if ($cf_admin !== '' && $mb_id === $cf_admin) {
        return 'super';
    }

    if ($bo_table === '') {
        return '';
    }

    $stmt = $pdo->prepare('SELECT bo_admin FROM g5_board WHERE bo_table = :bo_table LIMIT 1');
    $stmt->execute(['bo_table' => $bo_table]);
    $board = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$board) {
        return '';
    }

    $bo_admin = trim((string) ($board['bo_admin'] ?? ''));
    if ($bo_admin === '') {
        return '';
    }

    $admins = array_map('trim', explode(',', $bo_admin));
    if (in_array($mb_id, $admins, true)) {
        return 'board';
    }

    return '';
}

function board_set_auth_cookie(string $token, int $ttl_seconds, string $cookie_name, string $cookie_domain): void
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    $options = [
        'expires'  => time() + $ttl_seconds,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];

    if ($cookie_domain !== '') {
        $options['domain'] = $cookie_domain;
    }

    setcookie($cookie_name, $token, $options);
}

function board_clear_auth_cookie(string $cookie_name, string $cookie_domain): void
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    $options = [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];

    if ($cookie_domain !== '') {
        $options['domain'] = $cookie_domain;
    }

    setcookie($cookie_name, '', $options);
}

/**
 * @return array<string, mixed>|null
 */
function board_read_jwt_claims(
    string $secret,
    string $cookie_name
): ?array {
    if ($secret === '') {
        return null;
    }

    $token = '';
    if (!empty($_COOKIE[$cookie_name])) {
        $token = (string) $_COOKIE[$cookie_name];
    } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = (string) $_SERVER['HTTP_AUTHORIZATION'];
        if (stripos($auth, 'Bearer ') === 0) {
            $token = trim(substr($auth, 7));
        }
    }

    if ($token === '') {
        return null;
    }

    $claims = jwt_verify($token, $secret);

    return is_array($claims) ? $claims : null;
}

/**
 * @return array{member: array<string, mixed>, role: string}|null
 */
function board_require_admin(
    PDO $pdo,
    string $secret,
    string $cookie_name,
    string $bo_table
): ?array {
    $claims = board_read_jwt_claims($secret, $cookie_name);
    if ($claims === null || empty($claims['sub'])) {
        return null;
    }

    $member = board_load_member($pdo, (string) $claims['sub']);
    if ($member === null || !board_member_is_active($member)) {
        return null;
    }

    $role = board_resolve_admin_role($pdo, $member, $bo_table);
    if ($role === '') {
        return null;
    }

    return ['member' => $member, 'role' => $role];
}

/**
 * 최고관리자(cf_admin)만 허용.
 *
 * @return array{member: array<string, mixed>}|null
 */
function board_require_super(
    PDO $pdo,
    string $secret,
    string $cookie_name
): ?array {
    if ($secret === '') {
        return null;
    }

    $claims = board_read_jwt_claims($secret, $cookie_name);
    if ($claims === null || empty($claims['sub'])) {
        return null;
    }

    $member = board_load_member($pdo, (string) $claims['sub']);
    if ($member === null || !board_member_is_active($member)) {
        return null;
    }

    $cf_admin = board_load_cf_admin($pdo);
    if ($cf_admin === '' || (string) $member['mb_id'] !== $cf_admin) {
        return null;
    }

    return ['member' => $member];
}

function board_display_name(array $member): string
{
    $name = trim((string) ($member['mb_name'] ?? ''));
    if ($name !== '') {
        return $name;
    }

    return trim((string) ($member['mb_nick'] ?? ''));
}
