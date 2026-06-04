<?php

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/bootstrap.php';
require_once __DIR__ . '/../../lib/board_auth.php';
require_once __DIR__ . '/../../lib/board_write.php';
require_once __DIR__ . '/../../lib/board_files.php';

board_handle_options('GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($JWT_SECRET === '') {
    board_json_response(['error' => '서버 인증 설정이 완료되지 않았습니다.'], 500);
}

$method = strtoupper((string) $_SERVER['REQUEST_METHOD']);
$raw = file_get_contents('php://input');
$body = json_decode($raw === false ? '' : $raw, true);
if (!is_array($body)) {
    $body = $_POST;
}

$bo_table = trim((string) ($body['bo_table'] ?? $_GET['bo_table'] ?? ''));
$wr_id = (int) ($body['wr_id'] ?? $_GET['wr_id'] ?? 0);

if (
    !preg_match('/^[a-z0-9_]{1,20}$/', $bo_table) ||
    !in_array($bo_table, BOARD_ALLOWED_TABLES, true)
) {
    board_json_response(['error' => '유효하지 않은 게시판입니다.'], 400);
}

$auth = board_require_admin($pdo, $JWT_SECRET, $JWT_COOKIE_NAME, $bo_table);
if ($auth === null) {
    board_json_response(['error' => '인증이 필요합니다.'], 401);
}

/** @var array<string, mixed> $member */
$member = $auth['member'];
$write_table = 'g5_write_' . $bo_table;
$now = date('Y-m-d H:i:s');
$client_ip = board_client_ip();
$display_name = board_display_name($member);

if ($method === 'POST') {
    $parsed = board_parse_post_body($body, $now);

    if ($parsed['wr_subject'] === '' || $parsed['wr_content'] === '') {
        board_json_response(['error' => '제목과 내용을 입력해 주세요.'], 400);
    }

    if (mb_strlen($parsed['wr_subject'], 'UTF-8') > 255) {
        board_json_response(['error' => '제목이 너무 깁니다.'], 400);
    }

    try {
        $pdo->beginTransaction();

        $num_sql = "SELECT IFNULL(MIN(wr_num) - 1, -1) AS next_num FROM `{$write_table}`";
        $next_num = (int) $pdo->query($num_sql)->fetchColumn();

        $insert_sql = "INSERT INTO `{$write_table}` SET
            wr_num = :wr_num,
            wr_reply = '',
            wr_comment = 0,
            wr_parent = 0,
            wr_is_comment = 0,
            wr_subject = :wr_subject,
            wr_content = :wr_content,
            wr_hit = 0,
            wr_good = 0,
            wr_nogood = 0,
            mb_id = :mb_id,
            wr_password = '',
            wr_name = :wr_name,
            wr_email = :wr_email,
            wr_homepage = :wr_homepage,
            wr_datetime = :wr_datetime,
            wr_last = :wr_last,
            wr_ip = :wr_ip,
            wr_option = :wr_option,
            wr_1 = :wr_1,
            wr_2 = :wr_2,
            wr_3 = :wr_3,
            wr_4 = :wr_4";

        $stmt = $pdo->prepare($insert_sql);
        $stmt->execute([
            'wr_num'      => $next_num,
            'wr_subject'  => $parsed['wr_subject'],
            'wr_content'  => $parsed['wr_content'],
            'mb_id'       => (string) $member['mb_id'],
            'wr_name'     => $display_name,
            'wr_email'    => (string) ($member['mb_email'] ?? ''),
            'wr_homepage' => (string) ($member['mb_homepage'] ?? ''),
            'wr_datetime' => $parsed['wr_datetime'],
            'wr_last'     => $now,
            'wr_ip'       => $client_ip,
            'wr_option'   => $parsed['wr_option'],
            'wr_1'        => $parsed['wr_1'],
            'wr_2'        => $parsed['wr_2'],
            'wr_3'        => $parsed['wr_3'],
            'wr_4'        => $parsed['wr_4'],
        ]);

        $new_wr_id = (int) $pdo->lastInsertId();

        $parent_stmt = $pdo->prepare("UPDATE `{$write_table}` SET wr_parent = :wr_parent WHERE wr_id = :wr_id");
        $parent_stmt->execute(['wr_parent' => $new_wr_id, 'wr_id' => $new_wr_id]);

        $new_stmt = $pdo->prepare(
            'INSERT INTO g5_board_new (bo_table, wr_id, wr_parent, bn_datetime, mb_id)
             VALUES (:bo_table, :wr_id, :wr_parent, :bn_datetime, :mb_id)'
        );
        $new_stmt->execute([
            'bo_table'    => $bo_table,
            'wr_id'       => $new_wr_id,
            'wr_parent'   => $new_wr_id,
            'bn_datetime' => $parsed['wr_datetime'],
            'mb_id'       => (string) $member['mb_id'],
        ]);

        $count_stmt = $pdo->prepare(
            'UPDATE g5_board SET bo_count_write = bo_count_write + 1 WHERE bo_table = :bo_table'
        );
        $count_stmt->execute(['bo_table' => $bo_table]);

        $pdo->commit();

        board_json_response([
            'ok'       => true,
            'wr_id'    => $new_wr_id,
            'bo_table' => $bo_table,
        ], 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('write_post create failed: ' . $e->getMessage());
        board_json_response(['error' => '글을 저장하지 못했습니다.'], 500);
    }
}

if ($method === 'PUT' || $method === 'PATCH') {
    if ($wr_id <= 0) {
        board_json_response(['error' => '게시물 번호가 필요합니다.'], 400);
    }

    $parsed = board_parse_post_body($body, $now);

    if ($parsed['wr_subject'] === '' || $parsed['wr_content'] === '') {
        board_json_response(['error' => '제목과 내용을 입력해 주세요.'], 400);
    }

    $check = $pdo->prepare(
        "SELECT wr_id FROM `{$write_table}` WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1"
    );
    $check->execute(['wr_id' => $wr_id]);
    if (!$check->fetch(PDO::FETCH_ASSOC)) {
        board_json_response(['error' => '게시물을 찾을 수 없습니다.'], 404);
    }

    if (!empty($body['remove_attachment'])) {
        board_remove_attachment($pdo, $bo_table, $wr_id);
    }

    $update = $pdo->prepare(
        "UPDATE `{$write_table}` SET
            wr_subject = :wr_subject,
            wr_content = :wr_content,
            wr_datetime = :wr_datetime,
            wr_last = :wr_last,
            wr_option = :wr_option,
            wr_1 = :wr_1,
            wr_2 = :wr_2,
            wr_3 = :wr_3,
            wr_4 = :wr_4
         WHERE wr_id = :wr_id AND wr_is_comment = 0"
    );
    $update->execute([
        'wr_subject'  => $parsed['wr_subject'],
        'wr_content'  => $parsed['wr_content'],
        'wr_datetime' => $parsed['wr_datetime'],
        'wr_last'     => $now,
        'wr_option'   => $parsed['wr_option'],
        'wr_1'        => $parsed['wr_1'],
        'wr_2'        => $parsed['wr_2'],
        'wr_3'        => $parsed['wr_3'],
        'wr_4'        => $parsed['wr_4'],
        'wr_id'       => $wr_id,
    ]);

    board_json_response(['ok' => true, 'wr_id' => $wr_id, 'bo_table' => $bo_table]);
}

if ($method === 'DELETE') {
    if ($wr_id <= 0) {
        board_json_response(['error' => '게시물 번호가 필요합니다.'], 400);
    }

    $check = $pdo->prepare(
        "SELECT wr_id, wr_parent FROM `{$write_table}`
         WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1"
    );
    $check->execute(['wr_id' => $wr_id]);
    $post = $check->fetch(PDO::FETCH_ASSOC);
    if (!$post) {
        board_json_response(['error' => '게시물을 찾을 수 없습니다.'], 404);
    }

    $parent_id = (int) $post['wr_parent'];

    try {
        $pdo->beginTransaction();

        $file_del = $pdo->prepare(
            'DELETE FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id'
        );

        $children = $pdo->prepare(
            "SELECT wr_id FROM `{$write_table}` WHERE wr_parent = :wr_parent"
        );
        $children->execute(['wr_parent' => $parent_id]);
        $ids = $children->fetchAll(PDO::FETCH_COLUMN);

        foreach ($ids as $child_id) {
            $file_del->execute(['bo_table' => $bo_table, 'wr_id' => (int) $child_id]);
        }

        $pdo->prepare("DELETE FROM `{$write_table}` WHERE wr_parent = :wr_parent")
            ->execute(['wr_parent' => $parent_id]);

        $pdo->prepare(
            'DELETE FROM g5_board_new WHERE bo_table = :bo_table AND wr_parent = :wr_parent'
        )->execute(['bo_table' => $bo_table, 'wr_parent' => $parent_id]);

        $comment_count = count($ids) > 1 ? count($ids) - 1 : 0;
        $write_delta = 1;

        $pdo->prepare(
            'UPDATE g5_board SET
                bo_count_write = GREATEST(0, CAST(bo_count_write AS SIGNED) - :write_delta),
                bo_count_comment = GREATEST(0, CAST(bo_count_comment AS SIGNED) - :comment_delta)
             WHERE bo_table = :bo_table'
        )->execute([
            'write_delta'   => $write_delta,
            'comment_delta' => $comment_count,
            'bo_table'      => $bo_table,
        ]);

        $pdo->commit();

        board_json_response(['ok' => true, 'wr_id' => $wr_id, 'bo_table' => $bo_table]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('write_post delete failed: ' . $e->getMessage());
        board_json_response(['error' => '글을 삭제하지 못했습니다.'], 500);
    }
}

board_json_response(['error' => '허용되지 않은 요청입니다.'], 405);
