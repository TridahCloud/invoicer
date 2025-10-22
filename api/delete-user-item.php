<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);
$itemId = isset($input['id']) ? intval($input['id']) : 0;

if (!$itemId) {
    jsonResponse(['success' => false, 'message' => 'Item ID required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Delete item
    $stmt = $db->prepare('DELETE FROM user_items WHERE id = ? AND user_id = ?');
    $stmt->execute([$itemId, $userId]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['success' => false, 'message' => 'Item not found'], 404);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Item deleted successfully'
    ]);
    
} catch (PDOException $e) {
    error_log('Delete item error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

