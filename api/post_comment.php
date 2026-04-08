<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit;
}

require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$chapter = isset($data['chapter']) ? trim($data['chapter']) : '';
$name    = isset($data['name'])    ? trim($data['name'])    : 'Anonymous';
$email   = isset($data['email'])   ? trim($data['email'])   : '';
$text    = isset($data['text'])    ? trim($data['text'])    : '';

if (!$chapter || !$text) {
  http_response_code(400); echo json_encode(['error' => 'Missing fields']); exit;
}
if (strlen($text) > 2000) {
  http_response_code(400); echo json_encode(['error' => 'Comment too long']); exit;
}
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); echo json_encode(['error' => 'Invalid email']); exit;
}
if (preg_match('/(http|https|www\.)/i', $text)) {
  http_response_code(400); echo json_encode(['error' => 'Links not allowed']); exit;
}

$name  = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$text  = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
$token = bin2hex(random_bytes(32));

$db = getDB();
$db->exec("SET time_zone = '+00:00'");
$stmt = $db->prepare('INSERT INTO comments (chapter, name, email, text, token) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$chapter, $name, $email, $text, $token]);
$id = $db->lastInsertId();

echo json_encode(['success' => true, 'id' => $id, 'token' => $token]);
