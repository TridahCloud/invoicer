<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    jsonResponse(['success' => false, 'message' => 'Email and password are required'], 400);
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$password = $input['password'];
$companyName = isset($input['company_name']) ? trim($input['company_name']) : '';

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email format'], 400);
}

// Validate password
if (strlen($password) < 8) {
    jsonResponse(['success' => false, 'message' => 'Password must be at least 8 characters long'], 400);
}

try {
    $db = getDBConnection();
    
    // Check if email already exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Email already registered'], 409);
    }
    
    // Hash password
    $passwordHash = password_hash($password, HASH_ALGO, ['cost' => HASH_COST]);
    
    // Insert user
    $stmt = $db->prepare('
        INSERT INTO users (email, password_hash, company_name) 
        VALUES (?, ?, ?)
    ');
    $stmt->execute([$email, $passwordHash, $companyName]);
    
    $userId = $db->lastInsertId();
    
    // Set session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['company_name'] = $companyName;
    $_SESSION['last_activity'] = time();
    
    jsonResponse([
        'success' => true,
        'message' => 'Account created successfully',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'company_name' => $companyName
        ]
    ]);
    
} catch (PDOException $e) {
    error_log('Signup error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred during registration'], 500);
}
?>

