<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Get all invoices for user
    $stmt = $db->prepare('
        SELECT id, invoice_number, client_name, issue_date, due_date, 
               status, total, created_at
        FROM invoices 
        WHERE user_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$userId]);
    $invoices = $stmt->fetchAll();
    
    // Get tags for each invoice
    foreach ($invoices as &$invoice) {
        $stmt = $db->prepare('
            SELECT t.* FROM tags t
            INNER JOIN invoice_tags it ON t.id = it.tag_id
            WHERE it.invoice_id = ?
        ');
        $stmt->execute([$invoice['id']]);
        $invoice['tags'] = $stmt->fetchAll();
    }
    
    jsonResponse([
        'success' => true,
        'invoices' => $invoices
    ]);
    
} catch (PDOException $e) {
    error_log('Get invoices error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

