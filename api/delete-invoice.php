<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);
$invoiceId = isset($input['id']) ? intval($input['id']) : 0;

if (!$invoiceId) {
    jsonResponse(['success' => false, 'message' => 'Invoice ID required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Delete invoice (cascade will delete items and tags)
    $stmt = $db->prepare('DELETE FROM invoices WHERE id = ? AND user_id = ?');
    $stmt->execute([$invoiceId, $userId]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['success' => false, 'message' => 'Invoice not found'], 404);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Invoice deleted successfully'
    ]);
    
} catch (PDOException $e) {
    error_log('Delete invoice error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

