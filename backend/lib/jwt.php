<?php

/**
 * Minimal HS256 JWT (PHP 7.3+, no Composer).
 */

function jwt_base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwt_base64url_decode(string $data): string
{
    $remainder = strlen($data) % 4;
    if ($remainder > 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }

    $decoded = base64_decode(strtr($data, '-_', '+/'), true);

    return $decoded === false ? '' : $decoded;
}

/**
 * @param array<string, mixed> $claims
 */
function jwt_issue(array $claims, string $secret, int $ttl_seconds): string
{
    $now = time();
    $payload = array_merge($claims, [
        'iat' => $now,
        'exp' => $now + $ttl_seconds,
    ]);

    $header = jwt_base64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $body = jwt_base64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
    $signature = jwt_base64url_encode(hash_hmac('sha256', $header . '.' . $body, $secret, true));

    return $header . '.' . $body . '.' . $signature;
}

/**
 * @return array<string, mixed>|null
 */
function jwt_verify(string $token, string $secret): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$headerB64, $payloadB64, $signatureB64] = $parts;
    $expected = jwt_base64url_encode(
        hash_hmac('sha256', $headerB64 . '.' . $payloadB64, $secret, true)
    );

    if (!hash_equals($expected, $signatureB64)) {
        return null;
    }

    $payloadJson = jwt_base64url_decode($payloadB64);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }

    if (!isset($payload['exp']) || (int) $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}
