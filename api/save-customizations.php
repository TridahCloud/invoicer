<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['customizations'])) {
    jsonResponse(['success' => false, 'message' => 'Invalid request'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    $customizations = json_encode($input['customizations']);
    
    $stmt = $db->prepare('UPDATE users SET invoice_customizations = ? WHERE id = ?');
    $stmt->execute([$customizations, $userId]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Customizations saved successfully'
    ]);
    
} catch (PDOException $e) {
    error_log('Save customizations error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

