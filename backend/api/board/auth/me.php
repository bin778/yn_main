<?php

require_once __DIR__ . '/../../../lib/cors.php';
require_once __DIR__ . '/../../../lib/bootstrap.php';
require_once __DIR__ . '/../../../lib/board_auth.php';

board_handle_options('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
}

$raw_table = trim((string) ($_GET['bo_table'] ?? ''));
$bo_table = $raw_table;
if ($bo_table !== '' && !in_array($bo_table, BOARD_ALLOWED_TABLES, true)) {
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

$wr_id = (int) ($_GET['wr_id'] ?? 0);

function board_empty_me_response(): void
{
    board_json_response([
        'is_admin'    => '',
        'mb_name'     => null,
        'write_href'  => null,
        'update_href' => null,
        'delete_href' => null,
        'actions'     => null,
    ]);
}

if ($JWT_SECRET === '') {
    board_empty_me_response();
}

$claims = board_read_jwt_claims($JWT_SECRET, $JWT_COOKIE_NAME);
if ($claims === null || empty($claims['sub'])) {
    board_empty_me_response();
}

$member = board_load_member($pdo, (string) $claims['sub']);
if ($member === null || !board_member_is_active($member)) {
    board_empty_me_response();
}

$role = $bo_table !== '' ? board_resolve_admin_role($pdo, $member, $bo_table) : '';
if ($role === '' && $bo_table === '') {
    $role = board_resolve_admin_role($pdo, $member, 'news') !== '' ? 'super' : '';
    if (board_load_cf_admin($pdo) === (string) $member['mb_id']) {
        $role = 'super';
    }
}

if ($bo_table !== '' && $role === '') {
    board_empty_me_response();
}

if ($role === '' && $bo_table === '') {
    board_empty_me_response();
}

$mb_name = board_display_name($member);
$path_slug_map = [
    'review'  => 'review',
    'success' => 'success-story',
    'column'  => 'column',
    'news'    => 'news',
];

$write_href = null;
$update_href = null;
$delete_href = null;
$actions = null;

if ($bo_table !== '' && $role !== '') {
    $slug = $path_slug_map[$bo_table] ?? $bo_table;
    $write_href = '/admin/' . $slug . '/write';
    $actions = [
        'write_url'  => $write_href,
        'edit_url'   => null,
        'can_delete' => false,
    ];

    if ($wr_id > 0) {
        $table = 'g5_write_' . $bo_table;
        $stmt = $pdo->prepare(
            "SELECT wr_id FROM `{$table}` WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1"
        );
        $stmt->execute(['wr_id' => $wr_id]);
        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            $update_href = '/admin/' . $slug . '/' . $wr_id . '/edit';
            $actions['edit_url'] = $update_href;
            $actions['can_delete'] = true;
            $delete_href = 'api:delete';
        }
    }
}

board_json_response([
    'is_admin'    => $role,
    'mb_name'     => $mb_name,
    'write_href'  => $write_href,
    'update_href' => $update_href,
    'delete_href' => $delete_href,
    'actions'     => $actions,
]);
