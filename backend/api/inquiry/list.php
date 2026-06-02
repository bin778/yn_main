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

$page = max(1, (int) ($_GET['page'] ?? 1));
$per_page = (int) ($_GET['per_page'] ?? 20);
if ($per_page < 1) {
    $per_page = 20;
}
if ($per_page > 100) {
    $per_page = 100;
}

$offset = ($page - 1) * $per_page;

try {
    $count_stmt = $pdo->query('SELECT COUNT(*) AS cnt FROM user_inquiry');
    $total = (int) $count_stmt->fetchColumn();

    $list_sql = 'SELECT idx, c_date, c_name, c_tel, c_content, c_inflow, c_inflowurl, c_state, c_state2,
                        block, userip, utm_source, utm_campaign, c_email
                 FROM user_inquiry
                 ORDER BY idx DESC
                 LIMIT :limit OFFSET :offset';
    $stmt = $pdo->prepare($list_sql);
    $stmt->bindValue(':limit', $per_page, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $items = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $items[] = inquiry_format_list_row($row);
    }

    board_json_response([
        'ok'       => true,
        'page'     => $page,
        'per_page' => $per_page,
        'total'    => $total,
        'items'    => $items,
    ]);
} catch (PDOException $e) {
    error_log('inquiry list error: ' . $e->getMessage());
    board_json_response(['error' => '목록을 불러오지 못했습니다.'], 500);
}
