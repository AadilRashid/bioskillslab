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

$data  = json_decode(file_get_contents('php://input'), true);
$id    = isset($data['id'])    ? (int)$data['id']        : 0;
$token = isset($data['token']) ? trim($data['token'])     : '';
$text  = isset($data['text'])  ? trim($data['text'])      : '';

if (!$id || !$token || !$text) {
  http_response_code(400); echo json_encode(['error' => 'Missing fields']); exit;
}
if (strlen($text) > 2000) {
  http_response_code(400); echo json_encode(['error' => 'Comment too long']); exit;
}
if (preg_match('/(http|https|www\.)/i', $text)) {
  http_response_code(400); echo json_encode(['error' => 'Links not allowed']); exit;
}

$text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

$db = getDB();
// Verify token matches
$stmt = $db->prepare('SELECT token FROM comments WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || !hash_equals($row['token'], $token)) {
  http_response_code(403); echo json_encode(['error' => 'Unauthorized']); exit;
}

$stmt = $db->prepare('UPDATE comments SET text = ? WHERE id = ?');
$stmt->execute([$text, $id]);

echo json_encode(['success' => true]);
