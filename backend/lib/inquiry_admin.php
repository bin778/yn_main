<?php

const INQUIRY_ALLOWED_STATES = ['상담접수', '연락완료', '상담종료'];

const INQUIRY_LIST_COLUMNS = [
    'idx',
    'c_date',
    'c_name',
    'c_tel',
    'c_content',
    'c_inflow',
    'c_inflowurl',
    'c_state',
    'c_state2',
    'block',
    'userip',
    'utm_source',
    'utm_campaign',
    'c_email',
];

const INQUIRY_DETAIL_COLUMNS = [
    'idx',
    'c_date',
    'c_name',
    'c_tel',
    'c_inflow',
    'c_age',
    'c_sex',
    'c_addr',
    'c_addr2',
    'c_title1',
    'c_title2',
    'c_state',
    'c_caldate',
    'c_inq1',
    'c_inq2',
    'c_lit',
    'c_state2',
    'c_money',
    'c_content',
    'c_inflowdate',
    'c_inflowurl',
    'c_option',
    'c_option2',
    'c_option3',
    'c_option4',
    'utm_source',
    'utm_campaign',
    'c_email',
    'userip',
    'block',
];

function inquiry_truncate_content(?string $content, int $max = 80): string
{
    $text = trim((string) $content);
    if ($text === '') {
        return '';
    }

    if (mb_strlen($text, 'UTF-8') <= $max) {
        return $text;
    }

    return mb_substr($text, 0, $max, 'UTF-8') . '…';
}

/**
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function inquiry_format_list_row(array $row): array
{
    $formatted = [];
    foreach (INQUIRY_LIST_COLUMNS as $column) {
        $value = $row[$column] ?? null;
        if ($column === 'c_content') {
            $formatted[$column] = inquiry_truncate_content(is_string($value) ? $value : null);
            continue;
        }
        $formatted[$column] = $value;
    }

    return $formatted;
}

/**
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function inquiry_format_detail_row(array $row): array
{
    $formatted = [];
    foreach (INQUIRY_DETAIL_COLUMNS as $column) {
        if (!array_key_exists($column, $row)) {
            continue;
        }
        $value = $row[$column];
        if ($value === null || $value === '') {
            continue;
        }
        $formatted[$column] = $value;
    }

    return $formatted;
}

function inquiry_state_is_valid(string $state): bool
{
    return in_array($state, INQUIRY_ALLOWED_STATES, true);
}

function inquiry_normalize_block($block): string
{
    if ($block === true || $block === 1 || $block === '1') {
        return '1';
    }

    return '0';
}
