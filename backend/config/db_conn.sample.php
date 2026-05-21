<?php

$host = 'localhost';
$user = '유저';
$password = '비밀번호';
$dbname = 'DB이름';

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $password, $options);
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['result' => '0', 'msg' => '일시적인 서버 오류가 발생했습니다.']);
    exit;
}
