<?php

/**
 * 레거시 게시글 마이그레이션 CLI
 *
 * wr_content 내 JSON-LD script → wr_5, 레거시 HTML 감지 시 wr_6 = legacy_html
 *
 * 사용법:
 *   php backend/scripts/migrate_board_legacy.php --bo_table=column --dry-run
 *   php backend/scripts/migrate_board_legacy.php --bo_table=column --wr_id=87
 *   php backend/scripts/migrate_board_legacy.php --bo_table=column --all
 */

if (php_sapi_name() !== 'cli') {
    fwrite(STDERR, "CLI에서만 실행할 수 있습니다.\n");
    exit(1);
}

$projectRoot = dirname(__DIR__, 2);
require_once $projectRoot . '/backend/config/db_conn.php';
require_once $projectRoot . '/backend/lib/board_schema.php';

$allowedTables = ['review', 'success', 'column', 'news'];
$options = getopt('', ['bo_table:', 'wr_id::', 'all', 'dry-run']);

$boTable = trim((string) ($options['bo_table'] ?? ''));
$wrId = isset($options['wr_id']) ? (int) $options['wr_id'] : 0;
$runAll = array_key_exists('all', $options);
$dryRun = array_key_exists('dry-run', $options);

if (!in_array($boTable, $allowedTables, true)) {
    fwrite(STDERR, "--bo_table=review|success|column|news 가 필요합니다.\n");
    exit(1);
}

if ($wrId <= 0 && !$runAll) {
    fwrite(STDERR, "--wr_id=N 또는 --all 중 하나를 지정하세요.\n");
    exit(1);
}

$writeTable = 'g5_write_' . $boTable;

if ($wrId > 0) {
    $sql = "SELECT wr_id, wr_subject, wr_content, wr_5, wr_6 FROM `{$writeTable}`
            WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['wr_id' => $wrId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    $sql = "SELECT wr_id, wr_subject, wr_content, wr_5, wr_6 FROM `{$writeTable}`
            WHERE wr_is_comment = 0 ORDER BY wr_id ASC";
    $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

$updateStmt = $pdo->prepare(
    "UPDATE `{$writeTable}` SET wr_content = :wr_content, wr_5 = :wr_5, wr_6 = :wr_6
     WHERE wr_id = :wr_id AND wr_is_comment = 0"
);

$migrated = 0;
$skipped = 0;

foreach ($rows as $row) {
    $id = (int) $row['wr_id'];
    $content = (string) $row['wr_content'];
    $currentSchema = trim((string) ($row['wr_5'] ?? ''));
    $currentMode = board_normalize_content_mode($row['wr_6'] ?? 'rich');

    $extracted = board_extract_schema_from_content($content);
    $newContent = $extracted['content'];
    $newSchema = $extracted['schema'];

    if ($newSchema === '' && $currentSchema !== '') {
        $newSchema = $currentSchema;
    } elseif ($newSchema !== '') {
        $schemaError = board_validate_schema_json($newSchema);
        if ($schemaError !== null) {
            fwrite(STDERR, "[wr_id={$id}] 스키마 검증 실패: {$schemaError}\n");
            $skipped++;
            continue;
        }
    }

    $newMode = $currentMode;
    if (board_detect_legacy_html_content($newContent !== '' ? $newContent : $content)) {
        $newMode = 'legacy_html';
    }

    $contentChanged = $newContent !== $content;
    $schemaChanged = $newSchema !== $currentSchema;
    $modeChanged = $newMode !== $currentMode;

    if (!$contentChanged && !$schemaChanged && !$modeChanged) {
        $skipped++;
        continue;
    }

    echo "wr_id={$id} \"{$row['wr_subject']}\"\n";
    if ($contentChanged) {
        echo "  - wr_content: script 제거 또는 본문 정리\n";
    }
    if ($schemaChanged) {
        echo '  - wr_5: 스키마 ' . ($newSchema === '' ? '비움' : '저장 (' . strlen($newSchema) . ' bytes)') . "\n";
    }
    if ($modeChanged) {
        echo "  - wr_6: {$currentMode} → {$newMode}\n";
    }

    if (!$dryRun) {
        $updateStmt->execute([
            'wr_content' => $contentChanged ? $newContent : $content,
            'wr_5'       => $newSchema,
            'wr_6'       => $newMode,
            'wr_id'      => $id,
        ]);
    }

    $migrated++;
}

$modeLabel = $dryRun ? 'dry-run' : 'applied';
echo "\n{$modeLabel}: migrated={$migrated}, skipped={$skipped}\n";
