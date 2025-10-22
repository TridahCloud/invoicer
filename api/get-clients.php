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
    
    // Get all clients with statistics
    $stmt = $db->prepare('
        SELECT 
            c.*,
            COUNT(DISTINCT i.id) as invoice_count,
            COALESCE(SUM(CASE WHEN i.status != "cancelled" THEN i.total ELSE 0 END), 0) as total_invoiced,
            COALESCE(SUM(CASE WHEN i.status = "paid" THEN i.total ELSE 0 END), 0) as total_paid,
            COALESCE(SUM(CASE WHEN i.status = "overdue" THEN i.total ELSE 0 END), 0) as total_overdue
        FROM clients c
        LEFT JOIN invoices i ON c.id = i.client_id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.name ASC
    ');
    $stmt->execute([$userId]);
    $clients = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'clients' => $clients
    ]);
    
} catch (PDOException $e) {
    error_log('Get clients error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

