<?php

require_once __DIR__ . '/pbkdf2.php';

/**
 * Gnuboard-compatible password verification (PBKDF2 + legacy mysql hash).
 */
function board_verify_password(string $password, string $stored_hash, PDO $pdo): bool
{
    if ($stored_hash === '') {
        return false;
    }

    if (strpos($stored_hash, ':') !== false) {
        return pbkdf2_validate_password($password, $stored_hash);
    }

    $len = strlen($stored_hash);
    if ($len === G5_MYSQL_PASSWORD_LENGTH || $len === 16) {
        return board_verify_legacy_mysql_password($password, $stored_hash, $pdo);
    }

    return pbkdf2_validate_password($password, $stored_hash);
}

function board_mysql41_password(string $password): string
{
    return '*' . strtoupper(hash('sha1', pack('H*', hash('sha1', $password))));
}

function board_mysql_old_password(string $password): string
{
    $add = 7;
    $nr = 1345345333;
    $nr2 = 0x12345671;

    foreach (str_split($password) as $char) {
        if ($char === ' ' || $char === "\t") {
            continue;
        }

        $tmp = ord($char);
        $nr ^= ((($nr & 0x3f) + $add) * $tmp) + ($nr << 8);
        $nr2 += ($nr2 << 8) ^ $nr;
        $nr2 &= 0xffffffff;
        $add += $tmp;
    }

    $nr &= 0x7fffffff;
    $nr2 &= 0x7fffffff;

    return sprintf('%08x%08x', $nr, $nr2);
}

function board_verify_legacy_mysql_password(string $password, string $stored_hash, PDO $pdo): bool
{
    $len = strlen($stored_hash);

    if ($len === G5_MYSQL_PASSWORD_LENGTH) {
        if (hash_equals($stored_hash, board_mysql41_password($password))) {
            return true;
        }
    }

    if ($len === 16) {
        if (hash_equals($stored_hash, board_mysql_old_password($password))) {
            return true;
        }
    }

    try {
        $stmt = $pdo->prepare('SELECT PASSWORD(?) AS hashed');
        $stmt->execute([$password]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && isset($row['hashed']) && hash_equals($stored_hash, (string) $row['hashed'])) {
            return true;
        }
    } catch (PDOException $e) {
        // PASSWORD() removed in MariaDB 10.4+
    }

    return false;
}
