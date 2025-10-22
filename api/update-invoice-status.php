<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);
$invoiceId = isset($input['id']) ? intval($input['id']) : 0;
$status = isset($input['status']) ? $input['status'] : '';

if (!$invoiceId || !$status) {
    jsonResponse(['success' => false, 'message' => 'Invoice ID and status required'], 400);
}

$validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
if (!in_array($status, $validStatuses)) {
    jsonResponse(['success' => false, 'message' => 'Invalid status'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Update invoice status
    $stmt = $db->prepare('UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?');
    $stmt->execute([$status, $invoiceId, $userId]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['success' => false, 'message' => 'Invoice not found'], 404);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Status updated successfully'
    ]);
    
} catch (PDOException $e) {
    error_log('Update status error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

