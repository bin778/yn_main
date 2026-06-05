<?php

/**
 * PBKDF2 password hashing (Gnuboard-compatible, standalone).
 * @see www/board/lib/pbkdf2.compat.php
 */

const PBKDF2_COMPAT_HASH_ALGORITHM = 'SHA256';
const PBKDF2_COMPAT_ITERATIONS = 12000;
const PBKDF2_COMPAT_SALT_BYTES = 24;
const PBKDF2_COMPAT_HASH_BYTES = 24;
const G5_MYSQL_PASSWORD_LENGTH = 41;

function pbkdf2_create_hash(string $password): string
{
    $salt = random_bytes(PBKDF2_COMPAT_SALT_BYTES);
    $hash = pbkdf2_default(
        PBKDF2_COMPAT_HASH_ALGORITHM,
        $password,
        $salt,
        PBKDF2_COMPAT_ITERATIONS,
        PBKDF2_COMPAT_HASH_BYTES
    );

    return PBKDF2_COMPAT_HASH_ALGORITHM
        . ':' . PBKDF2_COMPAT_ITERATIONS
        . ':' . base64_encode($salt)
        . ':' . base64_encode($hash);
}

function pbkdf2_validate_password(string $password, string $hash): bool
{
    $params = explode(':', $hash);
    if (count($params) < 4) {
        return false;
    }

    $pbkdf2 = base64_decode($params[3], true);
    if ($pbkdf2 === false) {
        return false;
    }

    $pbkdf2_check = pbkdf2_default($params[0], $password, $params[2], (int) $params[1], strlen($pbkdf2));

    return pbkdf2_slow_equals($pbkdf2, $pbkdf2_check);
}

function pbkdf2_slow_equals(string $a, string $b): bool
{
    $diff = strlen($a) ^ strlen($b);
    $len = min(strlen($a), strlen($b));
    for ($i = 0; $i < $len; $i++) {
        $diff |= ord($a[$i]) ^ ord($b[$i]);
    }

    return $diff === 0;
}

function pbkdf2_default(string $algo, string $password, string $salt, int $count, int $key_length): string
{
    if ($count <= 0 || $key_length <= 0) {
        return '';
    }

    if (!$algo) {
        return pbkdf2_fallback($password, $salt, $count, $key_length);
    }

    $algo = strtolower((string) $algo);
    if (!function_exists('hash_algos') || !in_array($algo, hash_algos(), true)) {
        if ($algo === 'sha1') {
            return pbkdf2_fallback($password, $salt, $count, $key_length);
        }

        return '';
    }

    if (function_exists('hash_pbkdf2')) {
        return hash_pbkdf2($algo, $password, $salt, $count, $key_length, true);
    }

    $hash_length = strlen(hash($algo, '', true));
    $block_count = (int) ceil($key_length / $hash_length);
    $output = '';

    for ($i = 1; $i <= $block_count; $i++) {
        $last = $salt . pack('N', $i);
        $xorsum = $last = hash_hmac($algo, $last, $password, true);
        for ($j = 1; $j < $count; $j++) {
            $xorsum ^= ($last = hash_hmac($algo, $last, $password, true));
        }
        $output .= $xorsum;
    }

    return substr($output, 0, $key_length);
}

function pbkdf2_fallback(string $password, string $salt, int $count, int $key_length): string
{
    $hash_length = 20;
    $block_count = (int) ceil($key_length / $hash_length);

    if (strlen($password) > 64) {
        $password = str_pad(sha1($password, true), 64, chr(0));
    } else {
        $password = str_pad($password, 64, chr(0));
    }

    $opad = str_repeat(chr(0x5C), 64) ^ $password;
    $ipad = str_repeat(chr(0x36), 64) ^ $password;
    $output = '';

    for ($i = 1; $i <= $block_count; $i++) {
        $last = $salt . pack('N', $i);
        $xorsum = $last = pack('H*', sha1($opad . pack('H*', sha1($ipad . $last))));
        for ($j = 1; $j < $count; $j++) {
            $last = pack('H*', sha1($opad . pack('H*', sha1($ipad . $last))));
            $xorsum ^= $last;
        }
        $output .= $xorsum;
    }

    return substr($output, 0, $key_length);
}
