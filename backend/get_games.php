<?php
// backend/get_games.php
require_once 'db_connect.php';

$category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;

try {
    if ($category_id) {
        // Kategoriye göre filtrele
        $query = "
            SELECT g.* FROM Games g
            JOIN Game_Category gc ON g.GameID = gc.GameID
            WHERE g.IsApproved = 1 AND gc.CategoryID = ?
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$category_id]);
    } else {
        // Hepsini getir
        $query = "SELECT * FROM Games WHERE IsApproved = 1";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
    }
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>