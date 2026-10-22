<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/client_ip.php';
require_once __DIR__ . '/../../lib/rate_limit.php';
require_once __DIR__ . '/../../lib/board_files.php';
require_once __DIR__ . '/../../lib/board_editor_images.php';

const BOARD_ALLOWED_TABLES = ['review', 'success', 'column', 'news'];

function board_json_response(array $payload, int $status = 200): void
{
    echo json_encode(['status' => $status, 'payload' => $payload]);
    exit;
}

$scenario = $argv[1];
$pdo_factory = [PDO::class, 'connect'];
$pdo = is_callable($pdo_factory) ? call_user_func($pdo_factory, 'sqlite::memory:') : new PDO('sqlite::memory:');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$register_function = method_exists($pdo, 'createFunction') ? 'createFunction' : 'sqliteCreateFunction';
$pdo->$register_function('NOW', function () { return '2026-10-22 12:00:00'; });
$pdo->exec('CREATE TABLE g5_write_news (
    wr_id INTEGER, wr_num INTEGER, wr_is_comment INTEGER DEFAULT 0,
    wr_subject TEXT, wr_content TEXT DEFAULT "<p>Fixture</p>", wr_name TEXT DEFAULT "Fixture",
    wr_datetime TEXT, wr_hit INTEGER DEFAULT 0, wr_file INTEGER DEFAULT 1,
    wr_1 TEXT DEFAULT "", wr_2 TEXT DEFAULT "", wr_4 TEXT DEFAULT "", wr_5 TEXT DEFAULT ""
)');
$pdo->exec("INSERT INTO g5_write_news (wr_id, wr_num, wr_subject, wr_datetime) VALUES
    (10, -10, 'Published older', '2026-10-01 00:00:00'),
    (15, -15, 'Scheduled older', '2100-01-01 00:00:00'),
    (20, -20, 'Published current', '2026-10-01 00:00:00'),
    (30, -30, 'Scheduled newer', '2100-01-01 00:00:00'),
    (40, -40, 'Published newer', '2026-10-01 00:00:00')");
$pdo->exec('CREATE TABLE g5_board_file (
    bo_table TEXT, wr_id INTEGER, bf_no INTEGER, bf_source TEXT, bf_file TEXT,
    bf_content TEXT, bf_filesize INTEGER, bf_width INTEGER DEFAULT 0,
    bf_height INTEGER DEFAULT 0, bf_download INTEGER DEFAULT 0
)');

$temporary_directory = sys_get_temp_dir() . '/yn_security_fixture_' . bin2hex(random_bytes(8));
mkdir($temporary_directory . '/news', 0700, true);
$fixture_file = $temporary_directory . '/news/fixture.txt';
file_put_contents($fixture_file, 'local-security-fixture');
register_shutdown_function(function () use ($temporary_directory, $fixture_file): void {
    unlink($fixture_file);
    rmdir($temporary_directory . '/news');
    rmdir($temporary_directory);
});
$BOARD_FILE_DIR = $temporary_directory;
$BOARD_FILE_URL_BASE = 'https://example.invalid/board/data/file';
$TRUSTED_PROXY_CIDRS = [];
$_SERVER = ['REQUEST_METHOD' => 'GET', 'REMOTE_ADDR' => '2001:db8::' . dechex((int) getmypid())];
$_GET = ['bo_table' => 'news', 'wr_id' => $scenario === 'scheduled' ? 30 : 20, 'bf_no' => 0];
$_POST = [];
$_COOKIE = [];
register_shutdown_function(function (): void {
    $counter_key = 'download|news|20|0|' . app_client_ip();
    $counter_file = sys_get_temp_dir() . '/yn_board_rate/' . hash('sha256', $counter_key);
    if (is_file($counter_file)) {
        unlink($counter_file);
    }
});

$stored_hash = board_hash_attachment_password('fixture-password');
if ($scenario === 'uppercase') {
    $stored_hash = preg_replace('/^sha256:/', 'SHA256:', $stored_hash);
} elseif ($scenario === 'malformed') {
    $stored_hash = 'sha256:invalid';
} elseif ($scenario === 'public' || $scenario === 'scheduled') {
    $stored_hash = '';
}
if ($scenario === 'correct' || $scenario === 'incorrect') {
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST = $_GET + ['password' => $scenario === 'correct' ? 'fixture-password' : 'incorrect'];
}
$statement = $pdo->prepare('INSERT INTO g5_board_file
    (bo_table, wr_id, bf_no, bf_source, bf_file, bf_content, bf_filesize)
    VALUES ("news", :wr_id, 0, "fixture.txt", "fixture.txt", :password, 22)');
$statement->execute(['wr_id' => $_GET['wr_id'], 'password' => $stored_hash]);

// Inject an isolated DB while retaining the real endpoint, helpers, exits and file streaming.
$endpoint = $scenario === 'view' ? 'get_view.php' : 'download_file.php';
$source = file_get_contents(__DIR__ . '/../../api/board/' . $endpoint);
$source = preg_replace('/^require_once[^\n]+\n/m', '', substr($source, 5));
eval($source);
