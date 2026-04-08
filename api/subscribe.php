<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require 'config.php';

$data  = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? trim($data['email']) : '';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); echo json_encode(['error' => 'Invalid email']); exit;
}

$db = getDB();
$db->exec("SET time_zone = '+00:00'");

// Check if already subscribed
$check = $db->prepare('SELECT id FROM subscribers WHERE email = ?');
$check->execute([$email]);
if ($check->fetch()) {
  echo json_encode(['success' => true, 'message' => 'Already subscribed!']); exit;
}

// Save to database
$stmt = $db->prepare('INSERT INTO subscribers (email) VALUES (?)');
$stmt->execute([$email]);

// Send thank you email via SMTP
$to      = $email;
$subject = 'Welcome to BioSkills Lab';
$body    = "Hi there,\r\n\r\n"
         . "Thanks for subscribing! You'll be the first to know when we add new chapters, projects, and the AI/ML for Genomics course.\r\n\r\n"
         . "In the meantime, if you haven't already — the Statistics for Biology course is live and complete (15 chapters).\r\n\r\n"
         . "Happy learning!\r\n\r\n"
         . "Aadil Bhat, PhD\r\n"
         . "bioskillslab.dev";

sendMail($to, $subject, $body);

echo json_encode(['success' => true]);

function sendMail($to, $subject, $body) {
  $host     = 'smtp.hostinger.com';
  $port     = 465;
  $username = 'contact@bioskillslab.dev';
  $password = 'SMTP_PASSWORD_HERE';
  $from     = 'contact@bioskillslab.dev';
  $fromName = 'BioSkills Lab';

  $socket = fsockopen('ssl://' . $host, $port, $errno, $errstr, 10);
  if (!$socket) return false;

  $read = fgets($socket, 512);

  fwrite($socket, "EHLO bioskillslab.dev\r\n");
  while ($line = fgets($socket, 512)) { if (substr($line, 3, 1) == ' ') break; }

  fwrite($socket, "AUTH LOGIN\r\n");
  fgets($socket, 512);
  fwrite($socket, base64_encode($username) . "\r\n");
  fgets($socket, 512);
  fwrite($socket, base64_encode($password) . "\r\n");
  $auth = fgets($socket, 512);
  if (strpos($auth, '235') === false) { fclose($socket); return false; }

  fwrite($socket, "MAIL FROM:<{$from}>\r\n"); fgets($socket, 512);
  fwrite($socket, "RCPT TO:<{$to}>\r\n");     fgets($socket, 512);
  fwrite($socket, "DATA\r\n");                 fgets($socket, 512);

  $headers  = "From: {$fromName} <{$from}>\r\n";
  $headers .= "To: {$to}\r\n";
  $headers .= "Subject: {$subject}\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  fwrite($socket, $headers . "\r\n" . $body . "\r\n.\r\n");
  fgets($socket, 512);
  fwrite($socket, "QUIT\r\n");
  fclose($socket);
  return true;
}
