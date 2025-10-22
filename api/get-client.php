<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

if (!isset($_GET['id'])) {
    jsonResponse(['success' => false, 'message' => 'Client ID is required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    $clientId = intval($_GET['id']);
    
    $stmt = $db->prepare('
        SELECT * FROM clients 
        WHERE id = ? AND user_id = ?
    ');
    $stmt->execute([$clientId, $userId]);
    $client = $stmt->fetch();
    
    if ($client) {
        jsonResponse([
            'success' => true,
            'client' => $client
        ]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Client not found'], 404);
    }
    
} catch (PDOException $e) {
    error_log('Get client error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

