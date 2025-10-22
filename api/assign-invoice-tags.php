<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['invoice_id'])) {
    jsonResponse(['success' => false, 'message' => 'Invoice ID is required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    $invoiceId = intval($input['invoice_id']);
    $tagIds = isset($input['tag_ids']) && is_array($input['tag_ids']) ? $input['tag_ids'] : [];
    
    // Verify invoice belongs to user
    $stmt = $db->prepare('SELECT id FROM invoices WHERE id = ? AND user_id = ?');
    $stmt->execute([$invoiceId, $userId]);
    if (!$stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Invoice not found'], 404);
    }
    
    $db->beginTransaction();
    
    // Remove all existing tags for this invoice
    $stmt = $db->prepare('DELETE FROM invoice_tags WHERE invoice_id = ?');
    $stmt->execute([$invoiceId]);
    
    // Add new tags
    if (!empty($tagIds)) {
        $stmt = $db->prepare('
            INSERT INTO invoice_tags (invoice_id, tag_id)
            SELECT ?, t.id FROM tags t 
            WHERE t.id = ? AND t.user_id = ?
        ');
        
        foreach ($tagIds as $tagId) {
            $stmt->execute([$invoiceId, intval($tagId), $userId]);
        }
    }
    
    $db->commit();
    
    jsonResponse([
        'success' => true,
        'message' => 'Tags updated successfully'
    ]);
    
} catch (PDOException $e) {
    $db->rollBack();
    error_log('Assign tags error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

