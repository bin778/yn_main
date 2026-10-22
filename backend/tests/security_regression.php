<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../lib/board_files.php';
require_once __DIR__ . '/../lib/client_ip.php';
require_once __DIR__ . '/../lib/rate_limit.php';
require_once __DIR__ . '/../lib/recaptcha.php';

$assertions = 0;
function security_assert(bool $condition, string $label): void
{
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $label);
    }
    $GLOBALS['assertions']++;
}

$pdo = new PDO('sqlite::memory:');
$hash = board_hash_attachment_password('fixture-password');
security_assert(board_attachment_has_password($hash), 'lowercase PBKDF2 is protected');
security_assert(board_attachment_has_password(preg_replace('/^sha256:/', 'SHA256:', $hash)), 'uppercase hash');
security_assert(board_attachment_has_password('sha256:invalid'), 'malformed hash stays protected');
security_assert(board_attachment_has_password('*' . str_repeat('A', 40)), 'legacy MySQL hash stays protected');
security_assert(!board_attachment_has_password(''), 'empty attachment remains public');
security_assert(!board_attachment_has_password('legacy description'), 'legacy description remains public');
security_assert(board_verify_attachment_password('fixture-password', $hash, $pdo), 'existing password verifies');
security_assert(board_verify_attachment_password('fixture-password',
    preg_replace('/^sha256:/', 'SHA256:', $hash), $pdo), 'uppercase PBKDF2 password verifies');
security_assert(board_verify_attachment_password('fixture-password', board_mysql41_password('fixture-password'), $pdo),
    'legacy MySQL password verifies');
security_assert(!board_verify_attachment_password('incorrect', $hash, $pdo), 'incorrect password rejected');
foreach (['sha256:0::', 'sha256:12000:salt:', 'sha256:invalid',
    'sha999:12000:salt:' . base64_encode(str_repeat('x', 24))] as $malformed_hash) {
    security_assert(!board_verify_attachment_password('anything', $malformed_hash, $pdo), 'malformed hash rejected');
}

$TRUSTED_PROXY_CIDRS = [];
$_SERVER = ['REMOTE_ADDR' => '198.51.100.20', 'HTTP_X_FORWARDED_FOR' => '203.0.113.10',
    'HTTP_CLIENT_IP' => '203.0.113.11'];
security_assert(app_client_ip() === '198.51.100.20', 'direct caller cannot spoof client IP');
$TRUSTED_PROXY_CIDRS = ['192.0.2.0/24', '2001:db8:100::/48'];
$_SERVER = ['REMOTE_ADDR' => '192.0.2.10', 'HTTP_X_FORWARDED_FOR' => '203.0.113.1, 198.51.100.20'];
security_assert(app_client_ip() === '198.51.100.20', 'ignore spoofed prefix before first untrusted hop');
$_SERVER['HTTP_X_FORWARDED_FOR'] = '198.51.100.20, 192.0.2.11';
security_assert(app_client_ip() === '198.51.100.20', 'multiple trusted proxy hops');
$_SERVER['HTTP_X_FORWARDED_FOR'] = 'invalid';
security_assert(app_client_ip() === '192.0.2.10', 'invalid forwarded IP falls back to peer');
$_SERVER = ['REMOTE_ADDR' => '2001:db8:100::1', 'HTTP_X_FORWARDED_FOR' => '2001:db8:200::8'];
security_assert(app_client_ip() === '2001:db8:200::8', 'IPv6 proxy CIDR');
security_assert(!app_ip_matches_cidr('198.51.100.1', '192.0.2.0/33'), 'invalid IPv4 prefix');
security_assert(!app_ip_matches_cidr('::1', '192.0.2.0/24'), 'reject mixed address families');

$rate_key = 'security-test|' . bin2hex(random_bytes(12));
security_assert(!app_rate_limit_exceeded($rate_key, 2), 'rate counter first request');
security_assert(!app_rate_limit_exceeded($rate_key, 2), 'rate counter second request');
security_assert(app_rate_limit_exceeded($rate_key, 2), 'rate counter rejects third request');
unlink(sys_get_temp_dir() . '/yn_board_rate/' . hash('sha256', $rate_key));

$valid_response = ['success' => true, 'score' => 0.9, 'hostname' => 'www.yeoon.co.kr',
    'action' => 'submit_consult'];
$valid = recaptcha_assess_response($valid_response, RECAPTCHA_DEFAULT_HOSTNAMES, RECAPTCHA_DEFAULT_ACTION);
security_assert($valid['verified'] && !$valid['is_bot'], 'valid token accepted');
foreach ([
    'invalid token' => ['success' => false],
    'invalid JSON' => null,
    'nonboolean success' => array_merge($valid_response, ['success' => 'true']),
    'missing score' => array_diff_key($valid_response, ['score' => true]),
    'nonnumeric score' => array_merge($valid_response, ['score' => '0.9']),
    'out of range score' => array_merge($valid_response, ['score' => 2]),
    'foreign hostname' => array_merge($valid_response, ['hostname' => 'attacker.invalid']),
    'wrong action' => array_merge($valid_response, ['action' => 'different_action']),
] as $label => $response) {
    $result = recaptcha_assess_response($response, RECAPTCHA_DEFAULT_HOSTNAMES, RECAPTCHA_DEFAULT_ACTION);
    security_assert(!$result['verified'] && $result['is_bot'], $label . ' rejected');
}
$low_score = recaptcha_assess_response(array_merge($valid_response, ['score' => 0.1]),
    RECAPTCHA_DEFAULT_HOSTNAMES, RECAPTCHA_DEFAULT_ACTION);
security_assert($low_score['verified'] && $low_score['is_bot'], 'low score keeps bot quarantine policy');
$transport = function ($url, $fields) use ($valid_response): array {
    security_assert($url === RECAPTCHA_VERIFY_URL, 'fixed verification endpoint');
    security_assert($fields['secret'] === 'fixture-secret', 'verification includes configured secret');
    return ['status' => 200, 'body' => json_encode($valid_response)];
};
$verified = recaptcha_verify_token('fixture-token', '198.51.100.20', 'fixture-secret',
    RECAPTCHA_DEFAULT_HOSTNAMES, RECAPTCHA_DEFAULT_ACTION, $transport);
security_assert($verified['verified'], 'token verification pipeline accepts valid response');
foreach ([['status' => 0, 'body' => false], ['status' => 503, 'body' => '{}'],
    ['status' => 200, 'body' => 'not-json'], ['status' => 200, 'body' => '{"success":false}']]
    as $response) {
    $result = recaptcha_verify_token('fixture-token', '198.51.100.20', 'fixture-secret',
        RECAPTCHA_DEFAULT_HOSTNAMES, RECAPTCHA_DEFAULT_ACTION, function () use ($response): array {
            return $response;
        });
    security_assert(!$result['verified'], 'failed HTTP or verification cannot pass');
}
$missing = recaptcha_verify_token('fixture-token', '198.51.100.20', '',
    RECAPTCHA_DEFAULT_HOSTNAMES, RECAPTCHA_DEFAULT_ACTION);
security_assert(!$missing['verified'] && $missing['reason'] === 'configuration', 'missing secret cannot bypass');

// Mock only cURL I/O and inspect the real transport's TLS and redirect configuration.
eval('namespace SecurityHttpFixture;
    function curl_init($url) { return new \\stdClass(); }
    function curl_setopt_array($handle, $options) { $GLOBALS["http_options"] = $options; return true; }
    function curl_exec($handle) { return "{}"; }
    function curl_getinfo($handle, $option) { return 200; }
    function curl_close($handle) {}
');
eval('namespace SecurityHttpFixture;' . substr(file_get_contents(__DIR__ . '/../lib/http.php'), 5));
\SecurityHttpFixture\app_post_form('https://example.invalid', []);
security_assert($http_options[CURLOPT_SSL_VERIFYPEER] === true, 'TLS peer verification enabled');
security_assert($http_options[CURLOPT_SSL_VERIFYHOST] === 2, 'TLS hostname verification enabled');
security_assert($http_options[CURLOPT_FOLLOWLOCATION] === false, 'credentials never follow redirects');
security_assert($http_options[CURLOPT_CONNECTTIMEOUT] > 0 && $http_options[CURLOPT_TIMEOUT] > 0, 'bounded timeouts');

function security_fixture(string $scenario, string $fixture = 'public_board_endpoint.php'): string
{
    $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__DIR__ . '/fixtures/' . $fixture)
        . ' ' . escapeshellarg($scenario);
    exec($command, $lines, $exit_code);
    security_assert($exit_code === 0, $scenario . ' endpoint exits normally');
    return implode("\n", $lines);
}
foreach (['protected', 'uppercase', 'malformed', 'incorrect'] as $scenario) {
    $response = json_decode(security_fixture($scenario), true);
    security_assert(is_array($response) && $response['status'] === 403, $scenario . ' attachment blocked');
}
foreach (['correct', 'public'] as $scenario) {
    security_assert(security_fixture($scenario) === 'local-security-fixture', $scenario . ' attachment streams');
}
$scheduled = json_decode(security_fixture('scheduled'), true);
security_assert($scheduled['status'] === 410, 'scheduled attachment unavailable');
$view = json_decode(security_fixture('view'), true);
security_assert($view['prev']['wr_id'] === 10 && $view['next']['wr_id'] === 40, 'navigation excludes scheduled posts');
security_assert($view['files'][0]['has_password'] && $view['files'][0]['url'] === null,
    'protected metadata has no public URL');

foreach (['invalid', 'invalid-json', 'foreign-host', 'wrong-action', 'missing-token',
    'transport-error', 'missing-secret'] as $scenario) {
    $response = json_decode(security_fixture($scenario, 'inquiry_endpoint.php'), true);
    $expected_status = in_array($scenario, ['transport-error', 'missing-secret'], true) ? 503 : 403;
    security_assert($response['result'] === '0' && $response['_fixture']['status'] === $expected_status,
        $scenario . ' inquiry rejected');
    security_assert($response['_fixture']['prepare_count'] === 0 && $response['_fixture']['insert_count'] === 0
        && $response['_fixture']['notification_count'] === 0, $scenario . ' performs no DB or notification work');
}
foreach (['valid', 'low-score'] as $scenario) {
    $response = json_decode(security_fixture($scenario, 'inquiry_endpoint.php'), true);
    security_assert($response['result'] === '1' && $response['_fixture']['insert_count'] === 1,
        $scenario . ' inquiry keeps intended storage policy');
    security_assert($response['_fixture']['notification_count'] === ($scenario === 'valid' ? 1 : 0),
        $scenario . ' inquiry keeps intended notification policy');
}

echo 'Passed ' . $assertions . " PHP security regression checks (no external network or production DB).\n";
