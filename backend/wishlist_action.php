<?php
// backend/wishlist_action.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->game_id) && isset($data->action)) {
    try {
        if($data->action === 'add') {
            // Ekle (Varsa hata vermez, IGNORE kullanırız)
            $stmt = $pdo->prepare("INSERT IGNORE INTO Wishlist (UserID, GameID, AddedDate) VALUES (?, ?, NOW())");
            $stmt->execute([$data->user_id, $data->game_id]);
            echo json_encode(["status" => "success", "message" => "İstek listesine eklendi."]);
        } 
        elseif($data->action === 'remove') {
            // Çıkar
            $stmt = $pdo->prepare("DELETE FROM Wishlist WHERE UserID = ? AND GameID = ?");
            $stmt->execute([$data->user_id, $data->game_id]);
            echo json_encode(["status" => "success", "message" => "İstek listesinden çıkarıldı."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>