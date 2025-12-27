<?php
// backend/add_game.php (GELİŞMİŞ VERSİYON)

// 1. CORS İzinleri
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

// React'ten 'developer_id' olarak aslında 'user_id' geliyor. Bunu biliyoruz.
if(isset($data->title) && isset($data->price) && isset($data->developer_id)) {
    try {
        // A. Önce bu kullanıcının ADINI öğrenelim (UserID'den Username bulma)
        $stmtUser = $pdo->prepare("SELECT Username FROM Users WHERE UserID = ?");
        $stmtUser->execute([$data->developer_id]); 
        $username = $stmtUser->fetchColumn();

        if(!$username) {
            echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı!"]);
            exit;
        }

        // B. Bu isimde bir 'Developer' (Şirket) var mı bakalım?
        // Kullanıcı adını Şirket Adı gibi kullanacağız.
        $stmtDev = $pdo->prepare("SELECT DeveloperID FROM Developers WHERE CompanyName = ?");
        $stmtDev->execute([$username]);
        $realDeveloperID = $stmtDev->fetchColumn();

        // C. Eğer yoksa, bu kullanıcı için yeni bir Developer kaydı oluşturalım
        if(!$realDeveloperID) {
            $stmtInsertDev = $pdo->prepare("INSERT INTO Developers (CompanyName, Website, FoundationYear) VALUES (?, '', YEAR(CURDATE()))");
            $stmtInsertDev->execute([$username]);
            $realDeveloperID = $pdo->lastInsertId();
        }

        // D. Artık elimizde gerçek bir DeveloperID var! Oyunu ekleyebiliriz.
        $stmtGame = $pdo->prepare("INSERT INTO Games (DeveloperID, Title, Description, Price, IsApproved) VALUES (?, ?, ?, ?, 0)");
        
        $stmtGame->execute([
            $realDeveloperID, 
            $data->title, 
            isset($data->description) ? $data->description : '', 
            $data->price
        ]);
        
        echo json_encode(["status" => "success", "message" => "Oyun yüklendi! Admin onayı bekleniyor."]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Veritabanı hatası: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Eksik veri gönderildi."]);
}
?>