<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require 'config.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$username     = isset($data['username'])     ? trim($data['username'])     : '';
$display_name = isset($data['display_name']) ? trim($data['display_name']) : '';
$password     = isset($data['password'])     ? $data['password']           : '';
$email        = isset($data['email'])        ? trim($data['email'])        : '';

if (!$username || !$display_name || !$password) {
  http_response_code(400); echo json_encode(['error' => 'Username, display name and password are required']); exit;
}
if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
  http_response_code(400); echo json_encode(['error' => 'Username must be 3-30 characters, letters/numbers/underscore only']); exit;
}
if (strlen($password) < 8) {
  http_response_code(400); echo json_encode(['error' => 'Password must be at least 8 characters']); exit;
}
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); echo json_encode(['error' => 'Invalid email']); exit;
}

$db = getDB();
$check = $db->prepare('SELECT id FROM users WHERE username = ?');
$check->execute([$username]);
if ($check->fetch()) {
  http_response_code(409); echo json_encode(['error' => 'Username already taken']); exit;
}

// Generate recovery phrase (5 random words)
$words = ['alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet','kilo','lima','mike','november','oscar','papa','quebec','romeo','sierra','tango','uniform','victor','whiskey','xray','yankee','zulu','genome','sequence','protein','codon','allele','locus','exon','intron','primer','vector','plasmid','operon','helix','strand'];
shuffle($words);
$phrase = implode('-', array_slice($words, 0, 5));

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $db->prepare('INSERT INTO users (username, display_name, password_hash, email, recovery_phrase) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$username, $display_name, $hash, $email ?: null, $phrase]);
$id = $db->lastInsertId();

$_SESSION['user_id']      = $id;
$_SESSION['username']     = $username;
$_SESSION['display_name'] = $display_name;

echo json_encode(['success' => true, 'username' => $username, 'display_name' => $display_name, 'recovery_phrase' => $phrase]);
