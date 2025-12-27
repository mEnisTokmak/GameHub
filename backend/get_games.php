<?php
// backend/get_games.php (GÜNCEL - FİLTRELİ)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db_connect.php';

$category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;

try {
    if ($category_id) {
        // Eğer kategori seçildiyse SADECE o kategorideki oyunları getir
        // Game_Category tablosunu kullanarak filtreliyoruz
        $query = "
            SELECT g.* FROM Games g
            JOIN Game_Category gc ON g.GameID = gc.GameID
            WHERE g.IsApproved = 1 AND gc.CategoryID = ?
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$category_id]);
    } else {
        // Kategori seçilmediyse HEPSİNİ getir
        $query = "SELECT * FROM Games WHERE IsApproved = 1";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
    }
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>