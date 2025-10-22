<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'items' => []], 401);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    // Get user's saved items
    $stmt = $db->prepare('
        SELECT * FROM user_items 
        WHERE user_id = ?
        ORDER BY name ASC
    ');
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'items' => $items
    ]);
    
} catch (PDOException $e) {
    error_log('Get user items error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'items' => []], 500);
}
?>

