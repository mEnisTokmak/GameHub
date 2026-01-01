<?php
// backend/get_wishlist.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db_connect.php';

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

$stmt = $pdo->prepare("
    SELECT g.GameID, g.Title, g.Price, g.Description, w.AddedDate, g.ImageUrl, g.HeaderUrl 
    FROM Wishlist w
    JOIN Games g ON w.GameID = g.GameID
    WHERE w.UserID = ?
");
$stmt->execute([$user_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>