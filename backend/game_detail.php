<?php
// backend/game_detail.php (GÜNCEL - İNCELEME ÖZETİ EKLENDİ)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db_connect.php';

$id = isset($_GET['id']) ? $_GET['id'] : die();

$response = [];

try {
    // 1. Temel Oyun Bilgisi
    $stmt = $pdo->prepare("SELECT * FROM Games WHERE GameID = ?");
    $stmt->execute([$id]);
    $response['info'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Sistem Gereksinimleri
    $stmt = $pdo->prepare("CALL GetGameTechnicalDetails(?)");
    $stmt->execute([$id]);
    $response['requirements'] = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt->closeCursor(); 

    // 3. Etiketler
    $stmt = $pdo->prepare("CALL GetGameTagsAndCategories(?)");
    $stmt->execute([$id]);
    $response['tags'] = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    // 4. İncelemeler Listesi (u.UserID EKLENDİ)
    $stmt = $pdo->prepare("
        SELECT r.Rating, r.Comment, u.Username, u.UserID, r.ReviewDate 
        FROM Reviews r 
        JOIN Users u ON r.UserID = u.UserID 
        WHERE r.GameID = ? 
        ORDER BY r.ReviewDate DESC
    ");
    $stmt->execute([$id]);
    $response['reviews'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Kategoriler
    $stmt = $pdo->prepare("
        SELECT c.CategoryName 
        FROM Categories c 
        JOIN Game_Category gc ON c.CategoryID = gc.CategoryID 
        WHERE gc.GameID = ?
    ");
    $stmt->execute([$id]);
    $response['categories'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // 6. YENİ KISIM: İNCELEME İSTATİSTİKLERİ (ORTALAMA PUAN)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as TotalReviews, AVG(Rating) as AverageScore 
        FROM Reviews 
        WHERE GameID = ?
    ");
    $stmt->execute([$id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Eğer hiç yorum yoksa null döner, onu düzeltelim
    $response['rating_summary'] = [
        'total' => $stats['TotalReviews'] ? $stats['TotalReviews'] : 0,
        'average' => $stats['AverageScore'] ? round($stats['AverageScore'], 1) : 0
    ];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>