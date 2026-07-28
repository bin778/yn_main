<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/inquiry_admin.php';

board_handle_options('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$auth = board_require_super($pdo, $JWT_SECRET, $JWT_COOKIE_NAME);
if ($auth === null) {
    board_json_response(['error' => '최고관리자 권한이 필요합니다.'], 403);
}

[$where_sql, $where_params] = inquiry_build_where($_GET);

try {
    $sql = "SELECT idx, c_date, c_name, c_tel,
                c_inflowurl, c_inflow, c_state, c_state2,
                block, userip, utm_source, utm_campaign, gclid
            FROM user_inquiry"
        . $where_sql
        . " ORDER BY idx DESC
            LIMIT 10000";

    $stmt = $pdo->prepare($sql);
    foreach ($where_params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $filename = '여온_상담내역_' . date('Y-m-d') . '.csv';

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store, no-cache');
    header('Pragma: no-cache');

    $output = fopen('php://output', 'w');

    // BOM: 엑셀 한글 깨짐 방지
    fwrite($output, "\xEF\xBB\xBF");

    fputcsv($output, ['NO', '접수일', '이름', '연락처', '상태', '경로', '진행상태', '유입채널', '유입광고', 'GCLID', 'IP', '차단여부']);

    foreach ($rows as $row) {
        fputcsv($output, [
            $row['idx'],
            $row['c_date'],
            $row['c_name'],
            $row['c_tel'],
            $row['c_state'],
            $row['c_inflowurl'] !== null && $row['c_inflowurl'] !== ''
                ? $row['c_inflowurl']
                : ($row['c_inflow'] ?? ''),
            $row['c_state2'],
            $row['utm_source'],
            $row['utm_campaign'],
            $row['gclid'],
            $row['userip'],
            ($row['block'] === '1' || $row['block'] === 1) ? 'Y' : 'N',
        ]);
    }

    fclose($output);
    exit;
} catch (PDOException $e) {
    error_log('inquiry export error: ' . $e->getMessage());
    board_json_response(['error' => '엑셀 내보내기에 실패했습니다.'], 500);
}
