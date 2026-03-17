<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

handleCors();
header("Content-Type: application/json");

// Get input (JSON or fallback)
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST;
}

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit();
}

$email = trim($data['email']);
$password = $data['password'];

// Validate domain only
if (!str_ends_with($email, "@srcb.edu.ph")) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Must use @srcb.edu.ph email"]);
    exit();
}

// Extract department
$parts = explode('@', $email);
$local_part = $parts[0];

$hyphen_pos = strrpos($local_part, '-');
if ($hyphen_pos === false) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

$raw_name = substr($local_part, 0, $hyphen_pos);
$department = strtoupper(substr($local_part, $hyphen_pos + 1));
$name = ucfirst($raw_name);

try {
    $db = getDBConnection();

    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "Email already registered"]);
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $db->query("SELECT COUNT(id) as count FROM users");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $role = ($row['count'] == 0) ? 'admin' : 'student';

    $insertStmt = $db->prepare("
        INSERT INTO users (name, email, department, password, role) 
        VALUES (:name, :email, :dept, :pass, :role)
    ");

    $insertStmt->execute([
        'name' => $name,
        'email' => $email,
        'dept' => $department,
        'pass' => $hashed_password,
        'role' => $role
    ]);

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful",
    ]);

}
catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}