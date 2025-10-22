<?php
require_once '../config/config.php';

header('Content-Type: application/json');

// Destroy session
session_destroy();
$_SESSION = array();

jsonResponse(['success' => true, 'message' => 'Logged out successfully']);
?>

