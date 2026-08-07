<?php

/**
 * Copy to app_config.php and fill in. Leave empty strings to skip Alimtalk on submit.
 */
$ALIGO_API_KEY = '';
$ALIGO_USER_ID = '';
$ALIGO_SENDER_KEY = '';
$ALIGO_TPL_CODE = '';
$ALIGO_SENDER = '';
$ALIGO_RECEIVERS = [];

/**
 * Google reCAPTCHA v3 secret (상담 폼). 비우면 서버 검증을 건너뜀.
 * 프론트 NEXT_PUBLIC_RECAPTCHA_SITE_KEY 와 한 쌍으로 발급.
 */
$RECAPTCHA_SECRET_KEY = '';

/** Board JWT admin (required for /api/board/auth/* and write_post.php) */
$JWT_SECRET = '';
$JWT_TTL_SECONDS = 28800;
$JWT_COOKIE_NAME = 'yn_board_token';
/** Production: '.yeoon.co.kr' or leave empty for host-only cookie */
$JWT_COOKIE_DOMAIN = '';

/**
 * Gnuboard 첨부 디렉터리 절대 경로 (카페24 public_html 기준)
 * 예: /home/hosting_users/xxx/www/board/data/file
 */
$BOARD_FILE_DIR = '';
/** 공개 URL prefix (끝에 /file 까지) */
$BOARD_FILE_URL_BASE = 'https://www.yeoon.co.kr/board/data/file';
