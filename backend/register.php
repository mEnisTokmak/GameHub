<?php
// backend/register.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->email) && isset($data->password)) {
    // 1. Bu kullanıcı zaten var mı?
    $check = $pdo->prepare("SELECT UserID FROM Users WHERE Username=? OR Email=?");
    $check->execute([$data->username, $data->email]);
    
    if($check->rowCount() > 0){
        echo json_encode(["status" => "error", "message" => "Bu kullanıcı adı veya e-posta zaten kullanımda!"]);
        exit;
    }

    // 2. Şifreyi Hashle (Güvenlik)
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
    
    // 3. Kaydet (Varsayılan Rol: 2 -> Gamer)
    $stmt = $pdo->prepare("INSERT INTO Users (Username, Email, Password, RoleID, Balance) VALUES (?, ?, ?, 2, 0)");
    
    if($stmt->execute([$data->username, $data->email, $hashed_password])) {
        echo json_encode(["status" => "success", "message" => "Kayıt başarılı! Şimdi giriş yapabilirsin."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Kayıt sırasında hata oluştu."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Eksik bilgi gönderildi!"]);
}
?>