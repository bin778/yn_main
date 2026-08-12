<?php

require_once __DIR__ . '/board_categories.php';
require_once __DIR__ . '/board_files.php';
require_once __DIR__ . '/board_write.php';

const BOARD_BULK_MAX_IDS = 50;

/**
 * @param mixed $raw
 * @return array{ids: int[], error: string|null}
 */
function board_parse_wr_ids($raw)
{
    if (!is_array($raw)) {
        return array('ids' => array(), 'error' => '게시물을 선택해 주세요.');
    }

    $ids = array();
    foreach ($raw as $value) {
        $id = (int) $value;
        if ($id > 0) {
            $ids[$id] = $id;
        }
    }

    $ids = array_values($ids);
    if (count($ids) === 0) {
        return array('ids' => array(), 'error' => '게시물을 선택해 주세요.');
    }

    if (count($ids) > BOARD_BULK_MAX_IDS) {
        return array(
            'ids'   => array(),
            'error' => '한 번에 최대 ' . BOARD_BULK_MAX_IDS . '건까지 처리할 수 있습니다.',
        );
    }

    return array('ids' => $ids, 'error' => null);
}

/**
 * @param array<string, mixed> $row
 * @param string[] $exclude
 */
function board_insert_assoc_row(PDO $pdo, $table, array $row, array $exclude = array())
{
    $columns = array();
    $placeholders = array();
    $params = array();

    foreach ($row as $column => $value) {
        if (!preg_match('/^[a-z0-9_]+$/', $column)) {
            continue;
        }
        if (in_array($column, $exclude, true)) {
            continue;
        }
        $columns[] = '`' . $column . '`';
        $placeholders[] = ':' . $column;
        $params[$column] = $value;
    }

    if (count($columns) === 0) {
        throw new RuntimeException('저장할 컬럼이 없습니다.');
    }

    $sql = 'INSERT INTO `' . $table . '` (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
}

function board_next_wr_num(PDO $pdo, $write_table)
{
    $sql = "SELECT IFNULL(MIN(wr_num) - 1, -1) FROM `{$write_table}`";

    return (int) $pdo->query($sql)->fetchColumn();
}

function board_rewrite_board_file_urls($value, $src_table, $dst_table)
{
    if (!is_string($value) || $value === '' || $src_table === $dst_table) {
        return $value;
    }

    return str_replace(
        array('/board/data/file/' . $src_table . '/', '/data/file/' . $src_table . '/'),
        array('/board/data/file/' . $dst_table . '/', '/data/file/' . $dst_table . '/'),
        $value
    );
}

/**
 * @return array<string, string> old stored name => new stored name
 */
function board_copy_post_files(PDO $pdo, $src_table, $src_wr_id, $dst_table, $dst_wr_id)
{
    $stmt = $pdo->prepare(
        'SELECT * FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id ORDER BY bf_no ASC'
    );
    $stmt->execute(array('bo_table' => $src_table, 'wr_id' => $src_wr_id));
    $renames = array();

    while ($file = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (!is_array($file)) {
            continue;
        }

        $old_name = trim((string) ($file['bf_file'] ?? ''));
        $new_name = $old_name;
        $source = (string) ($file['bf_source'] ?? 'file');

        if ($old_name !== '' && !preg_match('/[^a-zA-Z0-9._-]/', $old_name)) {
            $src_path = board_file_storage_dir($src_table) . '/' . $old_name;
            if (is_file($src_path)) {
                $dst_dir = board_file_storage_dir($dst_table);
                $dst_path = $dst_dir . '/' . $new_name;
                if (is_file($dst_path)) {
                    $new_name = board_generate_stored_filename($source);
                    $dst_path = $dst_dir . '/' . $new_name;
                }
                if (!@copy($src_path, $dst_path)) {
                    throw new RuntimeException('첨부 파일을 복사하지 못했습니다.');
                }
                $renames[$old_name] = $new_name;
            }
        }

        $file['bo_table'] = $dst_table;
        $file['wr_id'] = $dst_wr_id;
        $file['bf_file'] = $new_name;
        board_insert_assoc_row($pdo, 'g5_board_file', $file);
    }

    return $renames;
}

function board_apply_file_renames($value, array $renames)
{
    if (!is_string($value) || $value === '' || count($renames) === 0) {
        return $value;
    }

    foreach ($renames as $old_name => $new_name) {
        if ($old_name !== $new_name) {
            $value = str_replace($old_name, $new_name, $value);
        }
    }

    return $value;
}

/**
 * @return array{new_wr_id: int, old_slug: string}
 */
function board_move_single_post(PDO $pdo, $src_table, $src_wr_id, $dst_table, $wr_7, $wr_8)
{
    $src_write = 'g5_write_' . $src_table;
    $dst_write = 'g5_write_' . $dst_table;

    $post_stmt = $pdo->prepare(
        "SELECT * FROM `{$src_write}` WHERE wr_id = :wr_id AND wr_is_comment = 0 LIMIT 1"
    );
    $post_stmt->execute(array('wr_id' => $src_wr_id));
    $post = $post_stmt->fetch(PDO::FETCH_ASSOC);
    if (!$post) {
        throw new RuntimeException('게시물을 찾을 수 없습니다.');
    }

    $slug = trim((string) ($post['wr_2'] ?? ''));
    if ($slug !== '') {
        $slug_error = board_validate_seo_slug($slug, $pdo, $dst_write, 0);
        if ($slug_error !== null) {
            $slug = $slug . '-' . $src_wr_id;
            if (board_validate_seo_slug($slug, $pdo, $dst_write, 0) !== null) {
                $slug = '';
            }
        }
    }

    $next_num = board_next_wr_num($pdo, $dst_write);
    $post['wr_num'] = $next_num;
    $post['wr_2'] = $slug;
    $post['wr_7'] = $wr_7;
    $post['wr_8'] = $wr_8;
    $post['wr_1'] = board_rewrite_board_file_urls((string) ($post['wr_1'] ?? ''), $src_table, $dst_table);

    board_insert_assoc_row($pdo, $dst_write, $post, array('wr_id'));
    $new_wr_id = (int) $pdo->lastInsertId();
    if ($new_wr_id <= 0) {
        throw new RuntimeException('글을 이동하지 못했습니다.');
    }

    $pdo->prepare("UPDATE `{$dst_write}` SET wr_parent = :wr_parent WHERE wr_id = :wr_id")
        ->execute(array('wr_parent' => $new_wr_id, 'wr_id' => $new_wr_id));

    $renames = board_copy_post_files($pdo, $src_table, $src_wr_id, $dst_table, $new_wr_id);
    if (count($renames) > 0) {
        $thumb = board_apply_file_renames((string) ($post['wr_1'] ?? ''), $renames);
        $pdo->prepare("UPDATE `{$dst_write}` SET wr_1 = :wr_1 WHERE wr_id = :wr_id")
            ->execute(array('wr_1' => $thumb, 'wr_id' => $new_wr_id));
    }

    $comment_stmt = $pdo->prepare(
        "SELECT * FROM `{$src_write}` WHERE wr_parent = :wr_parent AND wr_is_comment = 1"
    );
    $comment_stmt->execute(array('wr_parent' => $src_wr_id));
    $comments = $comment_stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($comments as $comment) {
        if (!is_array($comment)) {
            continue;
        }
        $old_comment_id = (int) $comment['wr_id'];
        $comment['wr_num'] = $next_num;
        $comment['wr_parent'] = $new_wr_id;
        board_insert_assoc_row($pdo, $dst_write, $comment, array('wr_id'));
        $new_comment_id = (int) $pdo->lastInsertId();
        if ($new_comment_id > 0) {
            board_copy_post_files($pdo, $src_table, $old_comment_id, $dst_table, $new_comment_id);
        }
    }

    $pdo->prepare(
        'INSERT INTO g5_board_new (bo_table, wr_id, wr_parent, bn_datetime, mb_id)
         VALUES (:bo_table, :wr_id, :wr_parent, :bn_datetime, :mb_id)'
    )->execute(array(
        'bo_table'    => $dst_table,
        'wr_id'       => $new_wr_id,
        'wr_parent'   => $new_wr_id,
        'bn_datetime' => (string) ($post['wr_datetime'] ?? date('Y-m-d H:i:s')),
        'mb_id'       => (string) ($post['mb_id'] ?? ''),
    ));

    return array('new_wr_id' => $new_wr_id, 'old_slug' => (string) ($post['wr_2'] ?? $slug));
}

function board_delete_moved_source(PDO $pdo, $src_table, $src_wr_id)
{
    $src_write = 'g5_write_' . $src_table;

    $file_rows = $pdo->prepare(
        'SELECT bf_file FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id'
    );
    $children = $pdo->prepare("SELECT wr_id FROM `{$src_write}` WHERE wr_parent = :wr_parent");
    $children->execute(array('wr_parent' => $src_wr_id));
    $ids = $children->fetchAll(PDO::FETCH_COLUMN);
    if (!is_array($ids) || count($ids) === 0) {
        $ids = array($src_wr_id);
    }

    $stored_files = array();
    foreach ($ids as $child_id) {
        $file_rows->execute(array('bo_table' => $src_table, 'wr_id' => (int) $child_id));
        while ($file = $file_rows->fetch(PDO::FETCH_ASSOC)) {
            if (!empty($file['bf_file'])) {
                $stored_files[] = (string) $file['bf_file'];
            }
        }
        $pdo->prepare('DELETE FROM g5_board_file WHERE bo_table = :bo_table AND wr_id = :wr_id')
            ->execute(array('bo_table' => $src_table, 'wr_id' => (int) $child_id));
    }

    $pdo->prepare("DELETE FROM `{$src_write}` WHERE wr_parent = :wr_parent OR wr_id = :wr_id")
        ->execute(array('wr_parent' => $src_wr_id, 'wr_id' => $src_wr_id));
    $pdo->prepare('DELETE FROM g5_board_new WHERE bo_table = :bo_table AND wr_parent = :wr_parent')
        ->execute(array('bo_table' => $src_table, 'wr_parent' => $src_wr_id));

    return $stored_files;
}
