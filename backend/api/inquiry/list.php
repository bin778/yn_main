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

$page     = max(1, (int) ($_GET['page'] ?? 1));
$per_page = (int) ($_GET['per_page'] ?? 15);
if ($per_page < 1)   $per_page = 15;
if ($per_page > 100) $per_page = 100;

$offset = ($page - 1) * $per_page;

/** @noinspection PhpUndefinedFunctionInspection */
[$where_sql, $where_params] = inquiry_build_where($_GET);

try {
    $count_sql  = "SELECT COUNT(*) AS cnt FROM user_inquiry" . $where_sql;
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($where_params);
    $total = (int) $count_stmt->fetchColumn();

    $list_sql = "SELECT idx, c_date, c_name, c_tel,
                        c_inflowurl, c_inflow, c_state, c_state2,
                        block, userip, utm_source, utm_campaign
                FROM user_inquiry"
                . $where_sql
                . " ORDER BY idx DESC
                LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($list_sql);
    foreach ($where_params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $per_page, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
    $stmt->execute();

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
