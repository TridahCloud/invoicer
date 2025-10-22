<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    // Get total users
    $stmt = $db->query('SELECT COUNT(*) as count FROM users');
    $totalUsers = $stmt->fetch()['count'];
    
    // Get total invoices in database
    $stmt = $db->query('SELECT COUNT(*) as count FROM invoices');
    $totalInvoices = $stmt->fetch()['count'];
    
    // Get anonymous invoice counter (stored in a simple counter table)
    $stmt = $db->query('SELECT counter_value FROM counters WHERE counter_name = "anonymous_invoices"');
    $result = $stmt->fetch();
    $anonymousInvoices = $result ? intval($result['counter_value']) : 0;
    
    // Total invoices = database invoices + anonymous counter
    $totalInvoicesGenerated = $totalInvoices + $anonymousInvoices;
    
    // Get total amount from paid invoices
    $stmt = $db->query('SELECT COALESCE(SUM(total), 0) as total_paid FROM invoices WHERE status = "paid"');
    $totalPaid = $stmt->fetch()['total_paid'];
    
    jsonResponse([
        'success' => true,
        'stats' => [
            'users' => intval($totalUsers),
            'invoices' => intval($totalInvoicesGenerated),
            'amount_paid' => floatval($totalPaid)
        ]
    ]);
    
} catch (PDOException $e) {
    error_log('Get stats error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

