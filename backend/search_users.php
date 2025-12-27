<?php
// backend/search_users.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db_connect.php';

$term = isset($_GET['q']) ? $_GET['q'] : '';
$myID = isset($_GET['my_id']) ? $_GET['my_id'] : 0;

if(strlen($term) > 0) {
    // Kendisi hariç, isminde aranan kelime geçenleri bul
    $stmt = $pdo->prepare("SELECT UserID, Username FROM Users WHERE Username LIKE ? AND UserID != ? LIMIT 10");
    $stmt->execute(["%$term%", $myID]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    echo json_encode([]);
}
?>