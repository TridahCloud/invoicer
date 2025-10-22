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
    
    // Get date filter parameters
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    
    // Build the query with optional date filtering
    $query = '
        SELECT id, invoice_number, client_name, issue_date, due_date, 
               status, total, created_at
        FROM invoices 
        WHERE user_id = ?
    ';
    $params = [$userId];
    
    if ($startDate && $endDate) {
        $query .= ' AND DATE(issue_date) BETWEEN ? AND ?';
        $params[] = $startDate;
        $params[] = $endDate;
    } elseif ($startDate) {
        $query .= ' AND DATE(issue_date) >= ?';
        $params[] = $startDate;
    } elseif ($endDate) {
        $query .= ' AND DATE(issue_date) <= ?';
        $params[] = $endDate;
    }
    
    $query .= ' ORDER BY created_at DESC';
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
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

