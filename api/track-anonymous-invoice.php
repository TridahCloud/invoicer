<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    // Increment anonymous invoice counter
    $stmt = $db->prepare('
        INSERT INTO counters (counter_name, counter_value) 
        VALUES ("anonymous_invoices", 1)
        ON DUPLICATE KEY UPDATE counter_value = counter_value + 1
    ');
    $stmt->execute();
    
    jsonResponse([
        'success' => true,
        'message' => 'Counter incremented'
    ]);
    
} catch (PDOException $e) {
    error_log('Track anonymous invoice error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

