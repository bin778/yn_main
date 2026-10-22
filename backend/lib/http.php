<?php

const APP_HTTP_CONNECT_TIMEOUT_SECONDS = 5;
const APP_HTTP_TIMEOUT_SECONDS = 10;

/** @return array{body: string|false, status: int} */
function app_post_form(string $url, array $fields): array
{
    $failed = ['body' => false, 'status' => 0];
    if (parse_url($url, PHP_URL_SCHEME) !== 'https' || !function_exists('curl_init')) {
        return $failed;
    }

    $handle = curl_init($url);
    if ($handle === false) {
        return $failed;
    }

    try {
        $configured = curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($fields),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_CONNECTTIMEOUT => APP_HTTP_CONNECT_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => APP_HTTP_TIMEOUT_SECONDS,
        ]);
        if (!$configured) {
            return $failed;
        }

        $body = curl_exec($handle);

        return ['body' => $body, 'status' => (int) curl_getinfo($handle, CURLINFO_HTTP_CODE)];
    } finally {
        curl_close($handle);
    }
}
