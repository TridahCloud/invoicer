<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['name']) || empty(trim($input['name']))) {
    jsonResponse(['success' => false, 'message' => 'Tag name is required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    $name = trim($input['name']);
    $color = isset($input['color']) ? trim($input['color']) : '#3B82F6';
    
    // Check if tag already exists for this user
    $stmt = $db->prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?');
    $stmt->execute([$userId, $name]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Tag already exists'], 400);
    }
    
    $stmt = $db->prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $name, $color]);
    
    $tagId = $db->lastInsertId();
    
    jsonResponse([
        'success' => true,
        'message' => 'Tag created successfully',
        'tag' => [
            'id' => $tagId,
            'name' => $name,
            'color' => $color
        ]
    ]);
    
} catch (PDOException $e) {
    error_log('Create tag error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

