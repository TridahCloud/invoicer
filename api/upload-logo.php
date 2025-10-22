<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
}

if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['success' => false, 'message' => 'No file uploaded'], 400);
}

$file = $_FILES['logo'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validate file type
if (!in_array($file['type'], $allowedTypes)) {
    jsonResponse(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WebP allowed.'], 400);
}

// Validate file size
if ($file['size'] > $maxSize) {
    jsonResponse(['success' => false, 'message' => 'File too large. Maximum 5MB allowed.'], 400);
}

try {
    $userId = getCurrentUserId();
    
    // Create uploads directory if it doesn't exist
    $uploadDir = BASE_PATH . '/uploads/logos/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'logo_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        jsonResponse(['success' => false, 'message' => 'Failed to save file'], 500);
    }
    
    // Update database
    $db = getDBConnection();
    $logoUrl = '/uploads/logos/' . $filename;
    
    $stmt = $db->prepare('UPDATE users SET logo_url = ? WHERE id = ?');
    $stmt->execute([$logoUrl, $userId]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Logo uploaded successfully',
        'logo_url' => $logoUrl
    ]);
    
} catch (Exception $e) {
    error_log('Logo upload error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred'], 500);
}
?>

