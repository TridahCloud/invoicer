<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    jsonResponse(['success' => false, 'message' => 'Invalid request'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    $companyName = isset($input['company_name']) ? trim($input['company_name']) : '';
    $companyAddress = isset($input['company_address']) ? trim($input['company_address']) : '';
    $companyPhone = isset($input['company_phone']) ? trim($input['company_phone']) : '';
    $companyEmail = isset($input['company_email']) ? trim($input['company_email']) : '';
    $companyWebsite = isset($input['company_website']) ? trim($input['company_website']) : '';
    $invoicePrefix = isset($input['invoice_prefix']) ? trim($input['invoice_prefix']) : 'INV';
    $nextInvoiceNumber = isset($input['next_invoice_number']) ? intval($input['next_invoice_number']) : 1;
    $bankName = isset($input['bank_name']) ? trim($input['bank_name']) : '';
    $bankAccountName = isset($input['bank_account_name']) ? trim($input['bank_account_name']) : '';
    $bankRoutingLabel = isset($input['bank_routing_label']) ? trim($input['bank_routing_label']) : 'Routing Number';
    $bankRoutingNumber = isset($input['bank_routing_number']) ? trim($input['bank_routing_number']) : '';
    $bankAccountNumber = isset($input['bank_account_number']) ? trim($input['bank_account_number']) : '';
    
    $stmt = $db->prepare('
        UPDATE users SET 
            company_name = ?, 
            company_address = ?, 
            company_phone = ?, 
            company_email = ?, 
            company_website = ?,
            invoice_prefix = ?,
            next_invoice_number = ?,
            bank_name = ?,
            bank_account_name = ?,
            bank_routing_label = ?,
            bank_routing_number = ?,
            bank_account_number = ?
        WHERE id = ?
    ');
    $stmt->execute([
        $companyName, $companyAddress, $companyPhone, 
        $companyEmail, $companyWebsite, $invoicePrefix, $nextInvoiceNumber,
        $bankName, $bankAccountName, $bankRoutingLabel, $bankRoutingNumber, $bankAccountNumber,
        $userId
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Profile updated successfully'
    ]);
    
} catch (PDOException $e) {
    error_log('Update profile error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

