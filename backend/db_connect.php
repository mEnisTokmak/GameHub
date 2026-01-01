<?php
// backend/db_connect.php

// Hataları ekrana bastırarak 500 hatasının sebebini görmemizi sağlar (Canlıda kapatılır)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS Ayarları (Sadece burada durması yeterli)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Preflight isteği gelirse işlemi burada bitir
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$dbname = 'GameHub';
$username = 'root';
$password = ''; // XAMPP için boş, MAMP kullanıyorsan 'root' olabilir.

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veritabanı bağlantı hatası: " . $e->getMessage()]);
    exit(); // Hata varsa diğer dosyalardaki kodların çalışmasını engelle
}
?>