<?php
// backend/api/users/profile.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing user id."]);
    exit();
}

try {
    $db = getDBConnection();
    
    // Get user details
    $stmt = $db->prepare("
        SELECT id, name, email, department, role, created_at, status 
        FROM users 
        WHERE id = :id
    ");
    $stmt->execute(['id' => $_GET['id']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit();
    }

    // Get stats
    $stmtPosts = $db->prepare("SELECT COUNT(*) FROM posts WHERE user_id = :id");
    $stmtPosts->execute(['id' => $_GET['id']]);
    $postsCount = $stmtPosts->fetchColumn();

    $stmtComments = $db->prepare("SELECT COUNT(*) FROM comments WHERE user_id = :id");
    $stmtComments->execute(['id' => $_GET['id']]);
    $commentsCount = $stmtComments->fetchColumn();

    $user['stats'] = [
        'posts' => (int)$postsCount,
        'comments' => (int)$commentsCount
    ];

    http_response_code(200);
    echo json_encode(["success" => true, "user" => $user]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
