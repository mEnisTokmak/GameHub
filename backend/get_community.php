<?php
// backend/get_community.php (MEVCUT TABLOYA UYGUN)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db_connect.php';

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();
$response = ["friends" => [], "requests" => []];

try {
    // 1. GELEN İSTEKLER (Ben User2 isem ve Durum 'Pending' ise)
    // İstek gönderen (User1) bilgisini çekiyoruz
    $stmt = $pdo->prepare("
        SELECT u.UserID, u.Username 
        FROM friends f 
        JOIN Users u ON f.User1_ID = u.UserID 
        WHERE f.User2_ID = ? AND f.Status = 'Pending'
    ");
    $stmt->execute([$user_id]);
    $response['requests'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. ARKADAŞLARIM (Ben User1 veya User2 olabilirim, Durum 'Accepted' olmalı)
    $stmt = $pdo->prepare("
        SELECT u.UserID, u.Username 
        FROM friends f 
        JOIN Users u ON (CASE WHEN f.User1_ID = ? THEN f.User2_ID ELSE f.User1_ID END) = u.UserID
        WHERE (f.User1_ID = ? OR f.User2_ID = ?) AND f.Status = 'Accepted'
    ");
    $stmt->execute([$user_id, $user_id, $user_id]);
    $response['friends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>