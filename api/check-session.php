<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['loggedIn' => false]);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Get user data
    $stmt = $db->prepare('
        SELECT id, email, company_name, company_address, company_phone, 
               company_email, company_website, logo_url, invoice_customizations,
               invoice_prefix, next_invoice_number,
               bank_name, bank_account_name, bank_routing_label, 
               bank_routing_number, bank_account_number
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['loggedIn' => false]);
    }
    
    updateSessionActivity();
    
    jsonResponse([
        'loggedIn' => true,
        'user' => $user
    ]);
    
} catch (PDOException $e) {
    error_log('Session check error: ' . $e->getMessage());
    jsonResponse(['loggedIn' => false]);
}
?>

