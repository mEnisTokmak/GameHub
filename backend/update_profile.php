<?php
// backend/update_profile.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id)) {
    try {
        // Dinamik sorgu oluşturacağız (Şifre boşsa güncellemesin diye)
        $query = "UPDATE Users SET Avatar = ?, About = ?";
        $params = [$data->avatar, $data->about];

        if(!empty($data->password)) {
            $query .= ", Password = ?"; // Not: Gerçekte hashlenmeli ama şu an düz metin gidiyoruz
            $params[] = $data->password;
        }

        $query .= " WHERE UserID = ?";
        $params[] = $data->user_id;

        $stmt = $pdo->prepare($query);
        
        if($stmt->execute($params)) {
            // Güncel kullanıcı bilgisini geri döndürelim ki React hafızayı güncellesin
            $stmtUser = $pdo->prepare("SELECT * FROM Users WHERE UserID = ?");
            $stmtUser->execute([$data->user_id]);
            $updatedUser = $stmtUser->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "message" => "Profil güncellendi!", "user" => $updatedUser]);
        } else {
            echo json_encode(["status" => "error", "message" => "Güncelleme başarısız."]);
        }

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "SQL Hatası: " . $e->getMessage()]);
    }
}
?>