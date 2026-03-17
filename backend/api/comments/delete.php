<?php
// backend/api/comments/delete.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->comment_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing user_id or comment_id."]);
    exit();
}

try {
    $db = getDBConnection();
    
    // Check if user is the author or an admin
    $stmt = $db->prepare("
        SELECT c.user_id as author_id, u.role as role
        FROM comments c
        JOIN users u ON u.id = :user_id
        WHERE c.id = :comment_id
    ");
    $stmt->execute(['user_id' => $data->user_id, 'comment_id' => $data->comment_id]);
    $result = $stmt->fetch();
    
    if (!$result) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Comment not found or user invalid."]);
        exit();
    }
    
    if ($result['author_id'] != $data->user_id && $result['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized to delete this comment."]);
        exit();
    }

    $stmt = $db->prepare("DELETE FROM comments WHERE id = :id");
    if ($stmt->execute(['id' => $data->comment_id])) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Comment deleted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete comment."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
