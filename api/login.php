<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require 'config.php';
session_start();

$data     = json_decode(file_get_contents('php://input'), true);
$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password']       : '';

if (!$username || !$password) {
  http_response_code(400); echo json_encode(['error' => 'Username and password required']); exit;
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, display_name, password_hash FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
  http_response_code(401); echo json_encode(['error' => 'Invalid username or password']); exit;
}

$_SESSION['user_id']      = $user['id'];
$_SESSION['username']     = $username;
$_SESSION['display_name'] = $user['display_name'];

echo json_encode(['success' => true, 'username' => $username, 'display_name' => $user['display_name']]);
