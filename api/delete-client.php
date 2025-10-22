<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'])) {
    jsonResponse(['success' => false, 'message' => 'Client ID is required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    $clientId = intval($input['id']);
    
    // Delete client (invoices will have client_id set to NULL due to ON DELETE SET NULL)
    $stmt = $db->prepare('DELETE FROM clients WHERE id = ? AND user_id = ?');
    $stmt->execute([$clientId, $userId]);
    
    if ($stmt->rowCount() > 0) {
        jsonResponse(['success' => true, 'message' => 'Client deleted successfully']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Client not found'], 404);
    }
    
} catch (PDOException $e) {
    error_log('Delete client error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

