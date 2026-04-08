<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
require 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(['loggedIn' => false]); exit;
}

$course = isset($_GET['course']) ? trim($_GET['course']) : 'bioinfo';
$db = getDB();

$cert = $db->prepare('SELECT cert_code FROM certificates WHERE user_id = ? AND course = ?');
$cert->execute([$_SESSION['user_id'], $course]);
$certRow = $cert->fetch(PDO::FETCH_ASSOC);

$attempt = $db->prepare('SELECT score, passed FROM exam_attempts WHERE user_id = ? AND course = ? ORDER BY taken_at DESC LIMIT 1');
$attempt->execute([$_SESSION['user_id'], $course]);
$attemptRow = $attempt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
  'loggedIn'  => true,
  'attempted' => !!$attemptRow,
  'passed'    => $certRow ? true : false,
  'score'     => $attemptRow ? (int)$attemptRow['score'] : null,
  'cert_code' => $certRow ? $certRow['cert_code'] : null,
]);
