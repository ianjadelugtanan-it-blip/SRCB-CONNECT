<?php
// backend/api/posts/read.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

try {
    $db = getDBConnection();
    
    $whereClause = "";
    $params = [];

    // Optional filtering by department
    if (isset($_GET['department']) && $_GET['department'] !== 'All' && !empty($_GET['department'])) {
        $whereClause = "WHERE p.department = :dept";
        $params['dept'] = $_GET['department'];
    }

    // Optional single post read
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $whereClause = "WHERE p.id = :id";
        $params['id'] = $_GET['id'];
    }

    $query = "
        SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.department, 
            p.created_at,
            u.name as author,
            u.id as author_id,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
            (SELECT COALESCE(SUM(vote_type), 0) FROM votes v WHERE v.post_id = p.id) as votes
        FROM posts p
        JOIN users u ON p.user_id = u.id
        $whereClause
        ORDER BY p.created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $posts = $stmt->fetchAll();

    http_response_code(200);
    
    if (isset($_GET['id'])) {
        // Return single post or 404
        if (count($posts) > 0) {
            echo json_encode(["success" => true, "post" => $posts[0]]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Post not found."]);
        }
    } else {
        // Return array of posts
        echo json_encode(["success" => true, "posts" => $posts]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
