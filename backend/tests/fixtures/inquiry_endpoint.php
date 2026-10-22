<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../../lib/client_ip.php';
require_once __DIR__ . '/../../lib/rate_limit.php';
// Keep the real verifier and endpoint while replacing only DB, configuration and outbound HTTP.
$verifier = file_get_contents(__DIR__ . '/../../lib/recaptcha.php');
eval(preg_replace('/^require_once[^\n]+\n/m', '', substr($verifier, 5)));

class InquiryFixtureStatement
{
    private $query;

    public function __construct(string $query) { $this->query = $query; }
    public function bindParam($name, &$value): void {}
    public function bindValue($name, $value, $type): void {}
    public function execute(): bool
    {
        if (strpos($this->query, 'INSERT INTO') !== false) {
            $GLOBALS['fixture_insert_count']++;
        }
        return true;
    }
    public function fetch(): array { return ['cnt' => 0]; }
}

class InquiryFixtureDatabase
{
    public function prepare(string $query): InquiryFixtureStatement
    {
        $GLOBALS['fixture_prepare_count']++;
        return new InquiryFixtureStatement($query);
    }
}

function app_post_form(string $url, array $fields): array
{
    if ($url === RECAPTCHA_VERIFY_URL) {
        $GLOBALS['fixture_verification_count']++;
        return $GLOBALS['fixture_google_result'];
    }
    $GLOBALS['fixture_notification_count']++;
    return ['status' => 200, 'body' => '{"code":0}'];
}

$scenario = $argv[1];
$google_response = ['success' => true, 'score' => 0.9, 'hostname' => 'www.yeoon.co.kr',
    'action' => 'submit_consult'];
if ($scenario === 'invalid') {
    $google_response = ['success' => false];
} elseif ($scenario === 'low-score') {
    $google_response['score'] = 0.1;
} elseif ($scenario === 'foreign-host') {
    $google_response['hostname'] = 'attacker.invalid';
} elseif ($scenario === 'wrong-action') {
    $google_response['action'] = 'different_action';
}
$fixture_google_result = ['status' => 200, 'body' => json_encode($google_response)];
if ($scenario === 'transport-error') {
    $fixture_google_result = ['status' => 0, 'body' => false];
} elseif ($scenario === 'invalid-json') {
    $fixture_google_result['body'] = 'invalid-json';
}
$fixture_prepare_count = 0;
$fixture_insert_count = 0;
$fixture_notification_count = 0;
$fixture_verification_count = 0;
$pdo = new InquiryFixtureDatabase();
$RECAPTCHA_SECRET_KEY = $scenario === 'missing-secret' ? '' : 'fixture-secret';
$TRUSTED_PROXY_CIDRS = [];
$ALIGO_API_KEY = $ALIGO_USER_ID = $ALIGO_SENDER_KEY = $ALIGO_TPL_CODE = $ALIGO_SENDER = 'fixture';
$ALIGO_RECEIVERS = ['01000000000'];
$_SERVER = ['REQUEST_METHOD' => 'POST', 'REMOTE_ADDR' => '2001:db8::' . dechex((int) getmypid())];
$fixture_rate_key = 'inquiry-submit|' . app_client_ip();
if (in_array($scenario, ['rate-limited', 'rate-limited-spoofed'], true)) {
    for ($i = 0; $i < 10; $i++) {
        app_rate_limit_exceeded($fixture_rate_key, 10);
    }
    if ($scenario === 'rate-limited-spoofed') {
        $_SERVER['HTTP_X_FORWARDED_FOR'] = '203.0.113.10';
        $_SERVER['HTTP_CLIENT_IP'] = '203.0.113.11';
    }
}
$_POST = ['c_name' => '홍길동', 'c_tel' => '01000000000', 'c_content' => '로컬 보안 회귀 검사',
    'recaptcha_token' => $scenario === 'missing-token' ? '' : 'fixture-token'];

ob_start();
register_shutdown_function(function (): void {
    $payload = json_decode(ob_get_clean(), true);
    $payload['_fixture'] = [
        'status' => http_response_code() ?: 200,
        'prepare_count' => $GLOBALS['fixture_prepare_count'],
        'insert_count' => $GLOBALS['fixture_insert_count'],
        'notification_count' => $GLOBALS['fixture_notification_count'],
        'verification_count' => $GLOBALS['fixture_verification_count'],
    ];
    $counter_file = sys_get_temp_dir() . '/yn_board_rate/' . hash('sha256', $GLOBALS['fixture_rate_key']);
    if (is_file($counter_file)) {
        unlink($counter_file);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
});
$source = substr(file_get_contents(__DIR__ . '/../../api/submit_inquiry.sample.php'), 5);
$source = preg_replace('/^require_once[^\n]+\n/m', '', $source);
$config_start = strpos($source, '$app_config_path =');
$config_end = strpos($source, 'const INQUIRY_CONTENT_MAX');
$source = substr($source, 0, $config_start) . substr($source, $config_end);
eval($source);
