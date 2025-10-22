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
    
    if (!$userId) {
        jsonResponse(['success' => false, 'message' => 'User not authenticated'], 401);
    }
    
    // Get date filter parameters
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    
    // Get user info for report header
    $stmt = $db->prepare('
        SELECT company_name, company_address, company_email, company_phone
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    // Build the query for paid invoices only (for tax purposes)
    $query = '
        SELECT i.id, i.invoice_number, i.client_name, i.issue_date, i.due_date, 
               i.status, i.total, i.created_at
        FROM invoices i
        WHERE i.user_id = ? AND i.status = "paid"
    ';
    $params = [$userId];
    
    if ($startDate && $endDate) {
        $query .= ' AND DATE(i.issue_date) BETWEEN ? AND ?';
        $params[] = $startDate;
        $params[] = $endDate;
    } elseif ($startDate) {
        $query .= ' AND DATE(i.issue_date) >= ?';
        $params[] = $startDate;
    } elseif ($endDate) {
        $query .= ' AND DATE(i.issue_date) <= ?';
        $params[] = $endDate;
    }
    
    $query .= ' ORDER BY i.issue_date ASC';
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $invoices = $stmt->fetchAll();
    
    // Calculate totals
    $totalIncome = 0;
    $invoiceCount = count($invoices);
    
    foreach ($invoices as $invoice) {
        $totalIncome += floatval($invoice['total']);
    }
    
    // Get client summary
    $clientSummary = [];
    foreach ($invoices as $invoice) {
        $clientName = $invoice['client_name'];
        if (!isset($clientSummary[$clientName])) {
            $clientSummary[$clientName] = [
                'name' => $clientName,
                'invoice_count' => 0,
                'total_amount' => 0
            ];
        }
        $clientSummary[$clientName]['invoice_count']++;
        $clientSummary[$clientName]['total_amount'] += floatval($invoice['total']);
    }
    
    jsonResponse([
        'success' => true,
        'report' => [
            'user' => $user,
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'invoice_count' => $invoiceCount,
                'client_count' => count($clientSummary)
            ],
            'invoices' => $invoices,
            'client_summary' => array_values($clientSummary),
            'generated_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (PDOException $e) {
    error_log('Tax report PDO error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'Database connection failed. Please check your database configuration.'], 500);
} catch (Exception $e) {
    error_log('Tax report general error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()], 500);
}
?>
