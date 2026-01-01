<?php
// backend/get_categories.php
require_once 'db_connect.php'; // include yerine require_once daha güvenlidir

try {
    $stmt = $pdo->prepare("SELECT * FROM Categories ORDER BY CategoryName ASC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>