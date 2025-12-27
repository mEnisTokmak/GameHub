<?php
// backend/search_games.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db_connect.php';

$term = isset($_GET['q']) ? $_GET['q'] : '';

if(strlen($term) > 0) {
    // Oyun başlığında arama yap (LIMIT 5: Çok yer kaplamasın)
    $stmt = $pdo->prepare("SELECT GameID, Title, Price FROM Games WHERE Title LIKE ? AND IsApproved = 1 LIMIT 5");
    $stmt->execute(["%$term%"]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    echo json_encode([]);
}
?>