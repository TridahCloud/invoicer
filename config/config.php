<?php
// Global configuration
session_start();

// Paths
define('BASE_PATH', dirname(__DIR__));
define('BASE_URL', '/invoicer');

// Security
define('HASH_ALGO', PASSWORD_BCRYPT);
define('HASH_COST', 12);

// Session timeout (in seconds)
define('SESSION_TIMEOUT', 3600 * 24); // 24 hours

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['last_activity']) 
           && (time() - $_SESSION['last_activity'] < SESSION_TIMEOUT);
}

// Get current user ID
function getCurrentUserId() {
    return isLoggedIn() ? $_SESSION['user_id'] : null;
}

// Update session activity
function updateSessionActivity() {
    $_SESSION['last_activity'] = time();
}

// JSON response helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>

