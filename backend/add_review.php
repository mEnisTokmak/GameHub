<?php
// backend/add_review.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->game_id) && isset($data->rating) && isset($data->comment)) {
    try {
        $stmt = $pdo->prepare("INSERT INTO Reviews (UserID, GameID, Rating, Comment) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->user_id, $data->game_id, $data->rating, $data->comment]);
        echo json_encode(["status" => "success", "message" => "Yorumunuz eklendi!"]);
    } catch (PDOException $e) {
        // Bir kişi aynı oyuna 2 kere yorum yapamaz (Tablodaki kısıtlamadan dolayı)
        echo json_encode(["status" => "error", "message" => "Bu oyuna zaten yorum yaptınız."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Eksik bilgi."]);
}
?>