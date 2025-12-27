<?php
// backend/db_connect.php

$host = 'localhost';
$dbname = 'GameHub';
// Ampps varsayılan şifresi genellikle 'mysql'dir. Wamp'ta boştur.
// Eğer hata alırsan password kısmını '' (boş) yap.
$username = 'root';
$password = 'mysql'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Bağlantı başarılıysa ekrana bir şey basmasın, sessiz kalsın.
} catch (PDOException $e) {
    // Hata varsa JSON formatında hatayı göstersin
    die(json_encode(["error" => "Veritabanı hatası: " . $e->getMessage()]));
}
?>