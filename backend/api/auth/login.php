<?php
// backend/api/auth/login.php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit();
}

$email = trim($data->email);
$password = $data->password;

try {
    $db = getDBConnection();
    
    $stmt = $db->prepare("SELECT id, name, department, role, password, status FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    
    if ($stmt->rowCount() == 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        exit();
    }
    
    $user = $stmt->fetch();
    
    if ($user['status'] === 'banned') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "This account has been banned from SRCB Connect."]);
        exit();
    }
    
    if (password_verify($password, $user['password'])) {
        // Since we aren't using a full JWT library yet, we'll return a simple verifiable structure,
        // In a true secure environment, this should be a JWT token.
        // For prototype purposes, returning user data to be stored securely.
        
        // Pseudo-token generation for basic client side tracking
        $token = base64_encode(json_encode(['id' => $user['id'], 'role' => $user['role'], 'time' => time()]));
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "token" => $token,
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $email,
                "department" => $user['department'],
                "role" => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
