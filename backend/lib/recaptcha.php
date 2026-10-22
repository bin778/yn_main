<?php

require_once __DIR__ . '/http.php';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_DEFAULT_HOSTNAMES = ['yeoon.co.kr', 'www.yeoon.co.kr', 'new.yeoon.co.kr'];
const RECAPTCHA_DEFAULT_ACTION = 'submit_consult';
const RECAPTCHA_MINIMUM_SCORE = 0.5;

/** @return array{verified: bool, is_bot: bool, reason: string} */
function recaptcha_assess_response($response, array $allowed_hostnames, string $expected_action): array
{
    $rejected = ['verified' => false, 'is_bot' => true, 'reason' => 'invalid'];
    if (!is_array($response) || ($response['success'] ?? false) !== true) {
        return $rejected;
    }

    $score = $response['score'] ?? null;
    if ((!is_float($score) && !is_int($score)) || !is_finite((float) $score)
        || $score < 0 || $score > 1) {
        return $rejected;
    }
    if (!is_string($response['hostname'] ?? null) || !is_string($response['action'] ?? null)) {
        return $rejected;
    }

    $hostname = strtolower(rtrim($response['hostname'], '.'));
    if ($expected_action === '' || $response['action'] !== $expected_action
        || !in_array($hostname, $allowed_hostnames, true)) {
        return $rejected;
    }

    return ['verified' => true, 'is_bot' => $score < RECAPTCHA_MINIMUM_SCORE, 'reason' => ''];
}

/** @return array{verified: bool, is_bot: bool, reason: string} */
function recaptcha_verify_token(
    string $token,
    string $remote_ip,
    string $secret,
    array $allowed_hostnames,
    string $expected_action,
    ?callable $post_form = null
): array {
    if ($secret === '' || $allowed_hostnames === [] || $expected_action === '') {
        return ['verified' => false, 'is_bot' => true, 'reason' => 'configuration'];
    }
    if (trim($token) === '') {
        return ['verified' => false, 'is_bot' => true, 'reason' => 'invalid'];
    }

    $request = $post_form ?? 'app_post_form';
    $result = $request(RECAPTCHA_VERIFY_URL, ['secret' => $secret, 'response' => $token, 'remoteip' => $remote_ip]);
    if ($result['body'] === false || $result['status'] !== 200) {
        return ['verified' => false, 'is_bot' => true, 'reason' => 'unavailable'];
    }

    return recaptcha_assess_response(json_decode($result['body'], true), $allowed_hostnames, $expected_action);
}
