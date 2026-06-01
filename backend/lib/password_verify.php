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

function board_verify_legacy_mysql_password(string $password, string $stored_hash, PDO $pdo): bool
{
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
