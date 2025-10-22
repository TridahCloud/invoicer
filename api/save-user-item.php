<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['name'])) {
    jsonResponse(['success' => false, 'message' => 'Item name required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    $itemId = isset($input['id']) ? intval($input['id']) : 0;
    $name = trim($input['name']);
    $description = isset($input['description']) ? trim($input['description']) : '';
    $unit = isset($input['unit']) ? trim($input['unit']) : 'items';
    $defaultPrice = isset($input['default_price']) ? floatval($input['default_price']) : 0;
    
    if ($itemId) {
        // Update existing item
        $stmt = $db->prepare('
            UPDATE user_items 
            SET name = ?, description = ?, unit = ?, default_price = ?
            WHERE id = ? AND user_id = ?
        ');
        $stmt->execute([$name, $description, $unit, $defaultPrice, $itemId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(['success' => false, 'message' => 'Item not found'], 404);
        }
        
        jsonResponse([
            'success' => true,
            'message' => 'Item updated successfully',
            'item_id' => $itemId
        ]);
    } else {
        // Create new item
        $stmt = $db->prepare('
            INSERT INTO user_items (user_id, name, description, unit, default_price) 
            VALUES (?, ?, ?, ?, ?)
        ');
        $stmt->execute([$userId, $name, $description, $unit, $defaultPrice]);
        
        $itemId = $db->lastInsertId();
        
        jsonResponse([
            'success' => true,
            'message' => 'Item saved successfully',
            'item_id' => $itemId
        ]);
    }
    
} catch (PDOException $e) {
    error_log('Save user item error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

