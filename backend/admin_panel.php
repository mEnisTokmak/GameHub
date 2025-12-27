<?php
// backend/admin_panel.php (GÜNCEL - ONAYLA ve REDDET)

// 1. CORS İzinleri (Bağlantı Sorununu Çözer)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight kontrolü
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

try {
    // GET İSTEĞİ: Bekleyen oyunları listele
    if ($method == 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM Games WHERE IsApproved = 0");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // POST İSTEĞİ: İşlem Yap (Onayla veya Reddet)
    if ($method == 'POST' && isset($data->game_id) && isset($data->action)) {
        
        if ($data->action === 'approve') {
            // ONAYLA: IsApproved'ı 1 yap
            $stmt = $pdo->prepare("UPDATE Games SET IsApproved = 1 WHERE GameID = ?");
            $stmt->execute([$data->game_id]);
            echo json_encode(["status" => "success", "message" => "Oyun onaylandı ve mağazaya eklendi!"]);
        } 
        
        elseif ($data->action === 'reject') {
            // REDDET: Oyunu veritabanından sil (Gereksiz yer kaplamasın)
            $stmt = $pdo->prepare("DELETE FROM Games WHERE GameID = ?");
            $stmt->execute([$data->game_id]);
            echo json_encode(["status" => "success", "message" => "Oyun reddedildi ve silindi."]);
        }
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Veritabanı hatası: " . $e->getMessage()]);
}
?>