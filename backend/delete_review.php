<?php
// backend/delete_review.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->game_id)) {
    // Admin yetkisi kontrolü burada yapılabilir ama frontend'de gizledik zaten.
    $stmt = $pdo->prepare("DELETE FROM Reviews WHERE UserID = ? AND GameID = ?");
    if($stmt->execute([$data->user_id, $data->game_id])) {
        echo json_encode(["status" => "success", "message" => "Yorum silindi."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Silinemedi."]);
    }
}
?>