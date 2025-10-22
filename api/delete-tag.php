<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'])) {
    jsonResponse(['success' => false, 'message' => 'Tag ID is required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    $tagId = intval($input['id']);
    
    // Delete tag (will cascade delete invoice_tags due to foreign key)
    $stmt = $db->prepare('DELETE FROM tags WHERE id = ? AND user_id = ?');
    $stmt->execute([$tagId, $userId]);
    
    if ($stmt->rowCount() > 0) {
        jsonResponse(['success' => true, 'message' => 'Tag deleted successfully']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Tag not found'], 404);
    }
    
} catch (PDOException $e) {
    error_log('Delete tag error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

