<?php
// backend/api/admin/users.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

// Secure this endpoint (In a real app, validate JWT here)
// For prototype, we'll verify via a passed admin_id payload
if (!isset($_GET['admin_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit();
}

try {
    $db = getDBConnection();
    
    // Verify admin_id is actually an admin
    $stmt = $db->prepare("SELECT role FROM users WHERE id = :id AND role = 'admin'");
    $stmt->execute(['id' => $_GET['admin_id']]);
    if ($stmt->rowCount() == 0) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden. Admin access required."]);
        exit();
    }

    $stmt = $db->query("
        SELECT id, name, email, department, role, status, created_at 
        FROM users 
        ORDER BY created_at DESC
    ");
    $users = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode(["success" => true, "users" => $users]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
