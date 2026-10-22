<?php

const APP_FORWARDED_IP_MAX_BYTES = 4096;
const APP_FORWARDED_IP_MAX_HOPS = 32;

function app_normalize_ip(string $address): string
{
    $packed = @inet_pton(trim($address));
    if ($packed === false) {
        return '';
    }

    return (string) inet_ntop($packed);
}

function app_ip_matches_cidr(string $address, string $network): bool
{
    $parts = explode('/', trim($network), 2);
    $packed_address = @inet_pton($address);
    $packed_network = @inet_pton($parts[0]);
    if ($packed_address === false || $packed_network === false
        || strlen($packed_address) !== strlen($packed_network)) {
        return false;
    }

    $total_bits = strlen($packed_address) * 8;
    if (isset($parts[1]) && !preg_match('/^\d{1,3}$/D', $parts[1])) {
        return false;
    }
    $prefix_bits = isset($parts[1]) ? (int) $parts[1] : $total_bits;
    if ($prefix_bits > $total_bits) {
        return false;
    }

    $full_bytes = (int) floor($prefix_bits / 8);
    if (substr($packed_address, 0, $full_bytes) !== substr($packed_network, 0, $full_bytes)) {
        return false;
    }

    $remaining_bits = $prefix_bits % 8;
    if ($remaining_bits === 0) {
        return true;
    }

    $mask = (0xff << (8 - $remaining_bits)) & 0xff;

    return (ord($packed_address[$full_bytes]) & $mask) === (ord($packed_network[$full_bytes]) & $mask);
}

function app_ip_is_trusted_proxy(string $address, array $trusted_networks): bool
{
    foreach ($trusted_networks as $network) {
        if (is_string($network) && app_ip_matches_cidr($address, $network)) {
            return true;
        }
    }

    return false;
}

function app_client_ip(): string
{
    global $TRUSTED_PROXY_CIDRS;

    $remote_address = app_normalize_ip((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    if ($remote_address === '') {
        return '0.0.0.0';
    }

    $trusted_networks = isset($TRUSTED_PROXY_CIDRS) && is_array($TRUSTED_PROXY_CIDRS)
        ? $TRUSTED_PROXY_CIDRS
        : array_filter(array_map('trim', explode(',', getenv('TRUSTED_PROXY_CIDRS') ?: '')));
    if (!app_ip_is_trusted_proxy($remote_address, $trusted_networks)) {
        return $remote_address;
    }

    $forwarded = (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
    if ($forwarded === '' || strlen($forwarded) > APP_FORWARDED_IP_MAX_BYTES) {
        return $remote_address;
    }

    // Walk from the trusted peer towards the client; a client-controlled prefix is never authoritative.
    $addresses = explode(',', $forwarded);
    if (count($addresses) > APP_FORWARDED_IP_MAX_HOPS) {
        return $remote_address;
    }
    $client_address = $remote_address;
    foreach (array_reverse($addresses) as $address) {
        if (!app_ip_is_trusted_proxy($client_address, $trusted_networks)) {
            return $client_address;
        }
        $client_address = app_normalize_ip($address);
        if ($client_address === '') {
            return $remote_address;
        }
    }

    return $client_address;
}

function board_client_ip(): string
{
    return app_client_ip();
}
