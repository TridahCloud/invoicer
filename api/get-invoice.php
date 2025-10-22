<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$invoiceId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$invoiceId) {
    jsonResponse(['success' => false, 'message' => 'Invoice ID required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Get invoice
    $stmt = $db->prepare('
        SELECT * FROM invoices 
        WHERE id = ? AND user_id = ?
    ');
    $stmt->execute([$invoiceId, $userId]);
    $invoice = $stmt->fetch();
    
    if (!$invoice) {
        jsonResponse(['success' => false, 'message' => 'Invoice not found'], 404);
    }
    
    // Get invoice items
    $stmt = $db->prepare('
        SELECT * FROM invoice_items 
        WHERE invoice_id = ? 
        ORDER BY item_order ASC
    ');
    $stmt->execute([$invoiceId]);
    $items = $stmt->fetchAll();
    
    $invoice['items'] = $items;
    
    jsonResponse([
        'success' => true,
        'invoice' => $invoice
    ]);
    
} catch (PDOException $e) {
    error_log('Get invoice error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

