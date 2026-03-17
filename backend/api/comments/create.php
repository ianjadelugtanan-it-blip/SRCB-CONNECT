<?php
// backend/api/comments/create.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->post_id) || !isset($data->content)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit();
}

try {
    $db = getDBConnection();
    
    // Verify user isn't banned
    $stmt = $db->prepare("SELECT status FROM users WHERE id = :id");
    $stmt->execute(['id' => $data->user_id]);
    $user = $stmt->fetch();
    
    if (!$user || $user['status'] === 'banned') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized or banned."]);
        exit();
    }

    $stmt = $db->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (:post_id, :user_id, :content)");
    if ($stmt->execute([
        'post_id' => $data->post_id,
        'user_id' => $data->user_id,
        'content' => trim($data->content)
    ])) {
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Comment added", "comment_id" => $db->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to add comment."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
