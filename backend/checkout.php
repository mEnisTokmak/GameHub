<?php
// backend/checkout.php (GÜNCELLENMİŞ - MANUEL İŞLEM)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->cart) && count($data->cart) > 0) {
    try {
        $pdo->beginTransaction(); // İşlemi başlat

        // 1. Toplam Tutarı Hesapla
        $totalAmount = 0;
        foreach($data->cart as $game) {
            $totalAmount += $game->Price;
        }

        // 2. Kullanıcının Bakiyesini Kontrol Et
        $stmt = $pdo->prepare("SELECT Balance FROM Users WHERE UserID = ?");
        $stmt->execute([$data->user_id]);
        $userBalance = $stmt->fetchColumn();

        if($userBalance < $totalAmount) {
            echo json_encode(["status" => "error", "message" => "Yetersiz bakiye! Lütfen cüzdanınıza para yükleyin."]);
            $pdo->rollBack();
            exit;
        }

        // 3. Siparişi Oluştur
        $stmt = $pdo->prepare("INSERT INTO Orders (UserID, MethodID, TotalAmount) VALUES (?, 3, ?)");
        $stmt->execute([$data->user_id, $totalAmount]);
        $orderID = $pdo->lastInsertId();

        // 4. Detayları Ekle
        $stmtDetail = $pdo->prepare("INSERT INTO OrderDetails (OrderID, GameID, UnitPrice) VALUES (?, ?, ?)");
        
        // 5. Kütüphaneye Ekleme Hazırlığı (SQL Trigger yerine PHP ile yapıyoruz)
        $stmtLibrary = $pdo->prepare("INSERT IGNORE INTO Library (UserID, GameID) VALUES (?, ?)");

        foreach($data->cart as $game) {
            // Detay ekle
            $stmtDetail->execute([$orderID, $game->GameID, $game->Price]);
            
            // Kütüphaneye ekle (MANUEL)
            $stmtLibrary->execute([$data->user_id, $game->GameID]);
        }

        // 6. Bakiyeyi Düş (SQL Trigger yerine PHP ile yapıyoruz)
        $newBalance = $userBalance - $totalAmount;
        $stmtUpdate = $pdo->prepare("UPDATE Users SET Balance = ? WHERE UserID = ?");
        $stmtUpdate->execute([$newBalance, $data->user_id]);
        
        $pdo->commit(); // İşlemi onayla
        
        $stmtBalance = $pdo->prepare("SELECT Balance FROM Users WHERE UserID = ?");
        $stmtBalance->execute([$data->user_id]);
        $finalBalance = $stmtBalance->fetchColumn();
        
        echo json_encode([
            "status" => "success", 
            "message" => "Satın alma başarılı! İyi oyunlar.",
            "new_balance" => $finalBalance // Yeni bakiyeyi gönderiyoruz
        ]);

    } catch (Exception $e) {
        $pdo->rollBack(); // Hata varsa iptal et
        echo json_encode(["status" => "error", "message" => "İşlem hatası: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Sepet boş!"]);
}
?>