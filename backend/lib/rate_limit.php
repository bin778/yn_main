<?php

const APP_RATE_LIMIT_WINDOW_SECONDS = 60;
const APP_RATE_LIMIT_COUNTER_MAX_BYTES = 1024;

function app_rate_limit_exceeded(
    string $key,
    int $maximum,
    int $window_seconds = APP_RATE_LIMIT_WINDOW_SECONDS
): bool
{
    if ($maximum < 1 || $window_seconds < 1) {
        return true;
    }

    $directory = sys_get_temp_dir() . '/yn_board_rate';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        error_log('[rate_limit] cannot create counter directory');
        return true;
    }

    $handle = @fopen($directory . '/' . hash('sha256', $key), 'c+');
    if ($handle === false) {
        error_log('[rate_limit] cannot open counter');
        return true;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            error_log('[rate_limit] cannot lock counter');
            return true;
        }

        $window = (int) floor(time() / $window_seconds);
        $data = json_decode((string) stream_get_contents($handle, APP_RATE_LIMIT_COUNTER_MAX_BYTES), true);
        $count = is_array($data) && (int) ($data['window'] ?? -1) === $window
            ? (int) ($data['count'] ?? 0) : 0;
        $count = min($maximum + 1, $count + 1);
        $encoded = json_encode(['window' => $window, 'count' => $count]);
        if ($encoded === false || !rewind($handle) || !ftruncate($handle, 0)
            || fwrite($handle, $encoded) !== strlen($encoded) || !fflush($handle)) {
            error_log('[rate_limit] cannot persist counter');
            return true;
        }

        return $count > $maximum;
    } finally {
        fclose($handle);
    }
}

function board_rate_limit_exceeded(string $action, int $max_per_minute = 10): bool
{
    return app_rate_limit_exceeded($action . '|' . app_client_ip(), $max_per_minute);
}
