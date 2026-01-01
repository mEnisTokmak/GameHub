<?php
// backend/get_library.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db_connect.php';

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

try {
    // Kullanıcının kütüphanesindeki oyunları getir
    $query = "
        SELECT g.GameID, g.Title, g.Price, g.ImageUrl, g.HeaderUrl 
        FROM Library l
        JOIN Games g ON l.GameID = g.GameID
        WHERE l.UserID = ?
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$user_id]);
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($games);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>