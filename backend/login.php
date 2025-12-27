<?php
// backend/login.php (GÜNCEL)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->password)) {
    // Kullanıcıyı bul
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE Username = :username");
    $stmt->bindParam(":username", $data->username);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Şifre kontrolü: Hem yeni (hashli) hem eski (düz metin) şifreleri destekler
        if(password_verify($data->password, $user['Password']) || $data->password == $user['Password']) {
            unset($user['Password']); // Şifreyi güvenlik gereği gizle
            echo json_encode(["status" => "success", "user" => $user]);
        } else {
            echo json_encode(["status" => "error", "message" => "Hatalı şifre!"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı!"]);
    }
}
?>