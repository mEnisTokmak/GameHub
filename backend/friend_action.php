<?php
// backend/friend_action.php (CORS FIX + TABLO YAPINA UYGUN)

// 1. ÖNCE HATA GÖSTERİMİNİ KAPAT (CORS'u bozan en büyük sebep budur)
error_reporting(E_ALL);
ini_set('display_errors', 0); 

// 2. CORS BAŞLIKLARI (En üstte olmalı)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 3. Preflight (Ön Kontrol) İsteğini Yakala ve Tamam De
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->action) && isset($data->sender_id) && isset($data->receiver_id)) {
    try {
        if($data->action == 'send') {
            // Çift kayıt kontrolü
            $check = $pdo->prepare("SELECT FriendshipID FROM friends WHERE (User1_ID = ? AND User2_ID = ?) OR (User1_ID = ? AND User2_ID = ?)");
            $check->execute([$data->sender_id, $data->receiver_id, $data->receiver_id, $data->sender_id]);
            
            if($check->rowCount() > 0) {
                echo json_encode(["message" => "Zaten bir istek veya arkadaşlık mevcut."]);
            } else {
                // Senin tablo yapın: User1_ID, User2_ID, Status='Pending'
                $stmt = $pdo->prepare("INSERT INTO friends (User1_ID, User2_ID, Status, FriendDate) VALUES (?, ?, 'Pending', NOW())");
                if($stmt->execute([$data->sender_id, $data->receiver_id])) {
                    echo json_encode(["message" => "İstek gönderildi!"]);
                } else {
                    echo json_encode(["error" => "Veritabanı hatası: Kayıt eklenemedi."]);
                }
            }
        }
        elseif($data->action == 'accept') {
            // Kabul Et: Status -> 'Accepted'
            $stmt = $pdo->prepare("UPDATE friends SET Status = 'Accepted' WHERE User1_ID = ? AND User2_ID = ?");
            $stmt->execute([$data->sender_id, $data->receiver_id]); 
            echo json_encode(["message" => "Arkadaşlık kabul edildi!"]);
        }
        elseif($data->action == 'reject') {
            // Reddet: Status -> 'Rejected'
            $stmt = $pdo->prepare("UPDATE friends SET Status = 'Rejected' WHERE User1_ID = ? AND User2_ID = ?");
            $stmt->execute([$data->sender_id, $data->receiver_id]);
            echo json_encode(["message" => "İstek reddedildi."]);
        }
    } catch (Exception $e) {
        // SQL hatası olsa bile JSON formatında döndür
        echo json_encode(["error" => "SQL Hatası: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Eksik veri gönderildi."]);
}
?>