<?php
// backend/api/comments/read.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

if (!isset($_GET['post_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing post_id."]);
    exit();
}

try {
    $db = getDBConnection();
    
    $stmt = $db->prepare("
        SELECT 
            c.id, 
            c.content, 
            c.created_at, 
            u.name as author, 
            u.department as dept,
            u.id as author_id
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = :post_id
        ORDER BY c.created_at ASC
    ");
    $stmt->execute(['post_id' => $_GET['post_id']]);
    $comments = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["success" => true, "comments" => $comments]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
