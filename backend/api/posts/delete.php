<?php
// backend/api/posts/delete.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->post_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing user_id or post_id."]);
    exit();
}

try {
    $db = getDBConnection();
    
    // Check if user is the author or an admin
    $stmt = $db->prepare("
        SELECT p.user_id as author_id, u.role as role
        FROM posts p
        JOIN users u ON u.id = :user_id
        WHERE p.id = :post_id
    ");
    $stmt->execute(['user_id' => $data->user_id, 'post_id' => $data->post_id]);
    $result = $stmt->fetch();
    
    if (!$result) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Post not found or user invalid."]);
        exit();
    }
    
    if ($result['author_id'] != $data->user_id && $result['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized to delete this post."]);
        exit();
    }

    $stmt = $db->prepare("DELETE FROM posts WHERE id = :id");
    if ($stmt->execute(['id' => $data->post_id])) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Post deleted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete post."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
