<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Debug logging
error_log('Save invoice input: ' . print_r($input, true));

if (!$input) {
    jsonResponse(['success' => false, 'message' => 'Invalid request'], 400);
}

$userId = getCurrentUserId();
$invoiceId = isset($input['id']) ? intval($input['id']) : null;

// Debug logging
error_log('Invoice ID from input: ' . ($invoiceId ? $invoiceId : 'NULL') . ' (User: ' . $userId . ')');

try {
    $db = getDBConnection();
    $db->beginTransaction();
    
    // Prepare invoice data
    $clientId = isset($input['client_id']) ? intval($input['client_id']) : null;
    $invoiceNumber = isset($input['invoice_number']) ? trim($input['invoice_number']) : 'INV-' . time();
    $clientName = isset($input['client_name']) ? trim($input['client_name']) : '';
    $clientAddress = isset($input['client_address']) ? trim($input['client_address']) : '';
    $clientEmail = isset($input['client_email']) ? trim($input['client_email']) : '';
    $issueDate = isset($input['issue_date']) ? $input['issue_date'] : date('Y-m-d');
    $dueDate = isset($input['due_date']) ? $input['due_date'] : date('Y-m-d', strtotime('+30 days'));
    $status = isset($input['status']) ? $input['status'] : 'draft';
    $notes = isset($input['notes']) ? trim($input['notes']) : '';
    $subtotal = isset($input['subtotal']) ? floatval($input['subtotal']) : 0;
    $taxRate = isset($input['tax_rate']) ? floatval($input['tax_rate']) : 0;
    $taxAmount = isset($input['tax_amount']) ? floatval($input['tax_amount']) : 0;
    $total = isset($input['total']) ? floatval($input['total']) : 0;
    
    if ($invoiceId) {
        // Update existing invoice
        error_log('UPDATING existing invoice ID: ' . $invoiceId);
        $stmt = $db->prepare('
            UPDATE invoices SET 
                client_id = ?, invoice_number = ?, client_name = ?, client_address = ?, 
                client_email = ?, issue_date = ?, due_date = ?, status = ?, 
                notes = ?, subtotal = ?, tax_rate = ?, tax_amount = ?, total = ?
            WHERE id = ? AND user_id = ?
        ');
        $stmt->execute([
            $clientId, $invoiceNumber, $clientName, $clientAddress, $clientEmail,
            $issueDate, $dueDate, $status, $notes,
            $subtotal, $taxRate, $taxAmount, $total,
            $invoiceId, $userId
        ]);
        
        error_log('Rows affected by UPDATE: ' . $stmt->rowCount());
        
        // Delete existing items
        $stmt = $db->prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
        $stmt->execute([$invoiceId]);
        
    } else {
        // Create new invoice
        error_log('CREATING new invoice');
        $stmt = $db->prepare('
            INSERT INTO invoices (
                user_id, client_id, invoice_number, client_name, client_address, client_email,
                issue_date, due_date, status, notes, subtotal, tax_rate, tax_amount, total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $userId, $clientId, $invoiceNumber, $clientName, $clientAddress, $clientEmail,
            $issueDate, $dueDate, $status, $notes,
            $subtotal, $taxRate, $taxAmount, $total
        ]);
        
        $invoiceId = $db->lastInsertId();
        
        // Increment next_invoice_number for the user
        $stmt = $db->prepare('UPDATE users SET next_invoice_number = next_invoice_number + 1 WHERE id = ?');
        $stmt->execute([$userId]);
    }
    
    // Insert invoice items
    if (isset($input['items']) && is_array($input['items'])) {
        $stmt = $db->prepare('
            INSERT INTO invoice_items (
                invoice_id, description, quantity, unit, unit_price, amount, item_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        
        foreach ($input['items'] as $item) {
            $description = isset($item['description']) ? trim($item['description']) : '';
            $quantity = isset($item['quantity']) ? floatval($item['quantity']) : 0;
            $unit = isset($item['unit']) ? trim($item['unit']) : 'items';
            $unitPrice = isset($item['unit_price']) ? floatval($item['unit_price']) : 0;
            $amount = $quantity * $unitPrice;
            $itemOrder = isset($item['item_order']) ? intval($item['item_order']) : 0;
            
            $stmt->execute([
                $invoiceId, $description, $quantity, $unit, $unitPrice, $amount, $itemOrder
            ]);
        }
    }
    
    $db->commit();
    
    jsonResponse([
        'success' => true,
        'message' => 'Invoice saved successfully',
        'invoice_id' => $invoiceId
    ]);
    
} catch (PDOException $e) {
    $db->rollBack();
    error_log('Save invoice error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred while saving'], 500);
}
?>

