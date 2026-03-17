<?php
// backend/api/admin/ban.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->admin_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit();
}

try {
    $db = getDBConnection();
    
    // Verify admin
    $stmt = $db->prepare("SELECT role FROM users WHERE id = :id AND role = 'admin'");
    $stmt->execute(['id' => $data->admin_id]);
    if ($stmt->rowCount() == 0) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden. Admin access required."]);
        exit();
    }

    // Toggle ban status
    $stmt = $db->prepare("SELECT status FROM users WHERE id = :id");
    $stmt->execute(['id' => $data->user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit();
    }

    $new_status = ($user['status'] === 'active') ? 'banned' : 'active';
    
    $stmt = $db->prepare("UPDATE users SET status = :status WHERE id = :id");
    if ($stmt->execute(['status' => $new_status, 'id' => $data->user_id])) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "User status updated to " . $new_status, "new_status" => $new_status]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update user status."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
