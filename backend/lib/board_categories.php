<?php

/**
 * 게시판 분류(wr_7 대분류, wr_8 소분류)
 *
 * @return array<string, array<string, array{label: string, children: string[]}>>
 */
function board_section_definitions()
{
    $shared = array(
        'criminal' => array(
            'label'    => '형사',
            'children' => array(
                'drunk-driving',
                'drugs',
                'indecent-assault',
                'stalking',
                'property-crime',
                'other',
            ),
        ),
        'civil' => array(
            'label'    => '민사',
            'children' => array('real-estate', 'damages', 'uncollected', 'other'),
        ),
        'family' => array(
            'label'    => '가사',
            'children' => array(
                'divorce',
                'adultery-damages',
                'inheritance',
                'limited-acceptance',
                'gender-correction',
                'other',
            ),
        ),
        'admin-labor' => array(
            'label'    => '행정/노동',
            'children' => array('unfair-dismissal', 'administrative-suit', 'other'),
        ),
        'overseas-dispute' => array(
            'label'    => '해외분쟁',
            'children' => array(),
        ),
        'other' => array(
            'label'    => '기타',
            'children' => array(),
        ),
    );

    return array(
        'success' => $shared,
        'column'  => array(
            'criminal'          => $shared['criminal'],
            'civil'             => $shared['civil'],
            'family'            => $shared['family'],
            'admin-labor'       => $shared['admin-labor'],
            'overseas-dispute'  => $shared['overseas-dispute'],
            'advisor-an'        => array(
                'label'    => '안성포 고문 칼럼',
                'children' => array(),
            ),
            'other'             => $shared['other'],
        ),
        'news' => array(
            'newsletter'  => array('label' => '뉴스레터', 'children' => array()),
            'press'       => array('label' => '언론보도', 'children' => array()),
            'seminar'     => array('label' => '세미나', 'children' => array()),
            'mou'         => array('label' => 'MOU&협약', 'children' => array()),
            'appointment' => array('label' => '위촉', 'children' => array()),
            'other'       => array('label' => '기타', 'children' => array()),
        ),
    );
}

function board_has_sections($bo_table)
{
    $defs = board_section_definitions();

    return isset($defs[$bo_table]);
}

function board_is_section_slug($bo_table, $slug)
{
    if ($slug === '' || !board_has_sections($bo_table)) {
        return false;
    }

    $defs = board_section_definitions();

    return isset($defs[$bo_table][$slug]);
}

function board_is_subsection_slug($bo_table, $parent_slug, $child_slug)
{
    if ($parent_slug === '' || $child_slug === '' || !board_has_sections($bo_table)) {
        return false;
    }

    $defs = board_section_definitions();
    if (!isset($defs[$bo_table][$parent_slug])) {
        return false;
    }

    return in_array($child_slug, $defs[$bo_table][$parent_slug]['children'], true);
}

/**
 * @return array{wr_7: string, wr_8: string, error: string|null}
 */
function board_normalize_section_pair($bo_table, $category, $subcategory)
{
    $category = trim((string) $category);
    $subcategory = trim((string) $subcategory);

    if (!board_has_sections($bo_table)) {
        if ($category !== '' || $subcategory !== '') {
            return array('wr_7' => '', 'wr_8' => '', 'error' => '이 게시판은 분류를 사용하지 않습니다.');
        }

        return array('wr_7' => '', 'wr_8' => '', 'error' => null);
    }

    if ($category === '') {
        return array('wr_7' => '', 'wr_8' => '', 'error' => '분류를 선택해 주세요.');
    }

    $defs = board_section_definitions();
    if (!isset($defs[$bo_table][$category])) {
        return array('wr_7' => '', 'wr_8' => '', 'error' => '유효하지 않은 분류입니다.');
    }

    $children = $defs[$bo_table][$category]['children'];

    if (count($children) === 0) {
        if ($subcategory !== '') {
            return array('wr_7' => '', 'wr_8' => '', 'error' => '이 분류는 하위 분류가 없습니다.');
        }

        return array('wr_7' => $category, 'wr_8' => '', 'error' => null);
    }

    if ($subcategory === '') {
        return array('wr_7' => '', 'wr_8' => '', 'error' => '하위 분류를 선택해 주세요.');
    }

    if (!in_array($subcategory, $children, true)) {
        return array('wr_7' => '', 'wr_8' => '', 'error' => '유효하지 않은 하위 분류입니다.');
    }

    return array('wr_7' => $category, 'wr_8' => $subcategory, 'error' => null);
}

/**
 * 목록 필터 SQL. 구 wr_7=real-estate 글은 민사/부동산으로 취급한다.
 *
 * @return array{sql: string, params: array<string, string>}
 */
function board_section_list_filter_sql($bo_table, $category, $subcategory)
{
    if ($category === '') {
        return array('sql' => '', 'params' => array());
    }

    $is_practice = ($bo_table === 'success' || $bo_table === 'column');
    $legacy_real_estate = $is_practice
        && $category === 'civil'
        && ($subcategory === '' || $subcategory === 'real-estate');

    if ($legacy_real_estate && $subcategory === 'real-estate') {
        return array(
            'sql'    => ' AND ((wr_7 = :category AND wr_8 = :subcategory) OR wr_7 = :legacy_real_estate)',
            'params' => array(
                'category'           => $category,
                'subcategory'        => $subcategory,
                'legacy_real_estate' => 'real-estate',
            ),
        );
    }

    if ($legacy_real_estate) {
        return array(
            'sql'    => ' AND (wr_7 = :category OR wr_7 = :legacy_real_estate)',
            'params' => array(
                'category'           => $category,
                'legacy_real_estate' => 'real-estate',
            ),
        );
    }

    if ($subcategory !== '') {
        return array(
            'sql'    => ' AND wr_7 = :category AND wr_8 = :subcategory',
            'params' => array(
                'category'    => $category,
                'subcategory' => $subcategory,
            ),
        );
    }

    return array(
        'sql'    => ' AND wr_7 = :category',
        'params' => array('category' => $category),
    );
}
