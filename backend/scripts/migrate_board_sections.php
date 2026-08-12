<?php

/**
 * 성공사례·칼럼 분류 이관
 *
 * wr_7=real-estate → wr_7=civil, wr_8=real-estate
 *
 * 사용법:
 *   php backend/scripts/migrate_board_sections.php --dry-run
 *   php backend/scripts/migrate_board_sections.php
 */

if (php_sapi_name() !== 'cli') {
    fwrite(STDERR, "CLI에서만 실행할 수 있습니다.\n");
    exit(1);
}

$projectRoot = dirname(__DIR__, 2);
require_once $projectRoot . '/backend/config/db_conn.php';

$options = getopt('', ['dry-run']);
$dryRun = array_key_exists('dry-run', $options);
$tables = ['g5_write_success', 'g5_write_column'];

foreach ($tables as $table) {
    $count_sql = "SELECT COUNT(*) FROM `{$table}` WHERE wr_is_comment = 0 AND wr_7 = 'real-estate'";
    $count = (int) $pdo->query($count_sql)->fetchColumn();
    fwrite(STDOUT, "{$table}: {$count}건\n");

    if ($dryRun || $count === 0) {
        continue;
    }

    $update = $pdo->prepare(
        "UPDATE `{$table}`
         SET wr_7 = 'civil', wr_8 = 'real-estate'
         WHERE wr_is_comment = 0 AND wr_7 = 'real-estate'"
    );
    $update->execute();
    fwrite(STDOUT, "  → {$update->rowCount()}건 이관\n");
}

fwrite(STDOUT, $dryRun ? "dry-run 완료 (DB 변경 없음)\n" : "이관 완료\n");
