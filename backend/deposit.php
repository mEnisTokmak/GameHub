<?php
// backend/deposit.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->amount)) {
    // SQL dosyasındaki 'DepositBalance' prosedürünü çağırıyoruz
    try {
        $stmt = $pdo->prepare("CALL DepositBalance(?, ?)");
        $stmt->execute([$data->user_id, $data->amount]);
        
        // Güncel bakiyeyi geri döndürelim ki ekranı güncelleyebilelim
        $stmt->closeCursor();
        $balanceQuery = $pdo->prepare("SELECT Balance FROM Users WHERE UserID = ?");
        $balanceQuery->execute([$data->user_id]);
        $newBalance = $balanceQuery->fetchColumn();
        
        echo json_encode(["status" => "success", "message" => "Bakiye başarıyla yüklendi!", "new_balance" => $newBalance]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Hata oluştu: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Eksik bilgi."]);
}
?>