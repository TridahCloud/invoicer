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
    
    $stmt = $db->prepare('
        SELECT id, name, color, created_at
        FROM tags 
        WHERE user_id = ?
        ORDER BY name ASC
    ');
    $stmt->execute([$userId]);
    $tags = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'tags' => $tags
    ]);
    
} catch (PDOException $e) {
    error_log('Get tags error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

