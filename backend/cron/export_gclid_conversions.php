<?php
/**
 * Google Ads Data Manager HTTPS용 오프라인 전환 CSV 생성
 *
 * cron 예:
 *   0 3 * * * /usr/local/php/bin/php /path/to/www/api/../cron/export_gclid_conversions.php
 *
 * Conversion Name(계약성사)은 Google Ads 오프라인 전환 액션명과 동일해야 함.
 */
require_once __DIR__ . '/../config/db_conn.php';

$conversionName = '계약성사';
$exportDir = __DIR__ . '/../api/exports';
$exportFile = $exportDir . '/conversions.csv';

if (!is_dir($exportDir)) {
    mkdir($exportDir, 0755, true);
}

$sql = "
    SELECT idx, gclid, gclid_converted_at, c_money
    FROM user_inquiry
    WHERE gclid IS NOT NULL AND gclid != ''
    AND c_state = '계약성사'
    AND gclid_converted_at IS NOT NULL
    AND gclid_converted_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    ORDER BY gclid_converted_at ASC
";

try {
    $stmt = $pdo->query($sql);
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
} catch (PDOException $e) {
    error_log('[GCLID export] query failed: ' . $e->getMessage());
    exit(1);
}

$fp = fopen($exportFile, 'w');
if ($fp === false) {
    error_log('[GCLID export] cannot write: ' . $exportFile);
    exit(1);
}

fwrite($fp, "\xEF\xBB\xBF");
fputcsv($fp, ['Parameters:TimeZone=+0900']);
fputcsv($fp, [
    'Google Click ID',
    'Conversion Name',
    'Conversion Time',
    'Conversion Value',
    'Conversion Currency',
    'Order ID',
]);

foreach ($rows as $row) {
    try {
        $dt = new DateTime($row['gclid_converted_at'], new DateTimeZone('Asia/Seoul'));
        $conversionTime = $dt->format('Y-m-d H:i:s') . '+0900';
    } catch (Exception $e) {
        error_log('[GCLID export] bad datetime idx=' . $row['idx']);
        continue;
    }

    $value = is_numeric($row['c_money']) ? (float) $row['c_money'] : 0;

    fputcsv($fp, [
        $row['gclid'],
        $conversionName,
        $conversionTime,
        $value,
        'KRW',
        (string) $row['idx'],
    ]);
}

fclose($fp);
error_log('[GCLID export] wrote ' . count($rows) . ' rows to ' . $exportFile);
