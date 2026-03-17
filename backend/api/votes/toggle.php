<?php
// backend/api/votes/toggle.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->post_id) || !isset($data->vote_type)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit();
}

// vote_type should be 1 (upvote) or -1 (downvote)
$vote_type = ($data->vote_type == 1) ? 1 : -1;

try {
    $db = getDBConnection();
    
    // Check if user has already voted
    $stmt = $db->prepare("SELECT id, vote_type FROM votes WHERE post_id = :post_id AND user_id = :user_id");
    $stmt->execute(['post_id' => $data->post_id, 'user_id' => $data->user_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['vote_type'] == $vote_type) {
            // Un-vote if clicking same button
            $stmt = $db->prepare("DELETE FROM votes WHERE id = :id");
            $stmt->execute(['id' => $existing['id']]);
            $action = 'removed';
        } else {
            // Change vote
            $stmt = $db->prepare("UPDATE votes SET vote_type = :vote_type WHERE id = :id");
            $stmt->execute(['vote_type' => $vote_type, 'id' => $existing['id']]);
            $action = 'updated';
        }
    } else {
        // New vote
        $stmt = $db->prepare("INSERT INTO votes (post_id, user_id, vote_type) VALUES (:post_id, :user_id, :vote_type)");
        $stmt->execute(['post_id' => $data->post_id, 'user_id' => $data->user_id, 'vote_type' => $vote_type]);
        $action = 'added';
    }

    // Get new total
    $stmt = $db->prepare("SELECT COALESCE(SUM(vote_type), 0) as total FROM votes WHERE post_id = :post_id");
    $stmt->execute(['post_id' => $data->post_id]);
    $total = $stmt->fetchColumn();

    http_response_code(200);
    echo json_encode(["success" => true, "action" => $action, "total_votes" => (int)$total]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
