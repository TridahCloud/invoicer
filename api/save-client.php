<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['name']) || empty(trim($input['name']))) {
    jsonResponse(['success' => false, 'message' => 'Client name is required'], 400);
}

try {
    $db = getDBConnection();
    $userId = getCurrentUserId();
    
    $id = isset($input['id']) ? intval($input['id']) : null;
    $name = trim($input['name']);
    $email = isset($input['email']) ? trim($input['email']) : '';
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $address = isset($input['address']) ? trim($input['address']) : '';
    $city = isset($input['city']) ? trim($input['city']) : '';
    $state = isset($input['state']) ? trim($input['state']) : '';
    $zip = isset($input['zip']) ? trim($input['zip']) : '';
    $country = isset($input['country']) ? trim($input['country']) : '';
    $notes = isset($input['notes']) ? trim($input['notes']) : '';
    
    if ($id) {
        // Update existing client
        $stmt = $db->prepare('
            UPDATE clients SET 
                name = ?, email = ?, phone = ?, address = ?,
                city = ?, state = ?, zip = ?, country = ?, notes = ?
            WHERE id = ? AND user_id = ?
        ');
        $stmt->execute([$name, $email, $phone, $address, $city, $state, $zip, $country, $notes, $id, $userId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Client updated successfully',
            'client_id' => $id
        ]);
    } else {
        // Create new client
        $stmt = $db->prepare('
            INSERT INTO clients (user_id, name, email, phone, address, city, state, zip, country, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$userId, $name, $email, $phone, $address, $city, $state, $zip, $country, $notes]);
        
        $clientId = $db->lastInsertId();
        
        jsonResponse([
            'success' => true,
            'message' => 'Client created successfully',
            'client_id' => $clientId
        ]);
    }
    
} catch (PDOException $e) {
    error_log('Save client error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

