<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'config.php';

$code = isset($_GET['code']) ? strtoupper(trim($_GET['code'])) : '';
if (!$code) { http_response_code(400); echo json_encode(['error' => 'No code provided']); exit; }

$db   = getDB();
$stmt = $db->prepare('SELECT c.cert_code, c.course, c.score, c.issued_at, u.display_name FROM certificates c JOIN users u ON c.user_id = u.id WHERE c.cert_code = ?');
$stmt->execute([$code]);
$cert = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$cert) {
  http_response_code(404); echo json_encode(['valid' => false]); exit;
}

echo json_encode(['valid' => true, 'display_name' => $cert['display_name'], 'course' => $cert['course'], 'score' => $cert['score'], 'issued_at' => $cert['issued_at']]);
