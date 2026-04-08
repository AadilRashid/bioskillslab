<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
  http_response_code(401); echo json_encode(['error' => 'Not logged in']); exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$answers = isset($data['answers']) ? $data['answers'] : [];
$course  = isset($data['course'])  ? trim($data['course']) : 'bioinfo';

// Answer key — 30 questions
$answer_key_bioinfo = [
  1=>'c', 2=>'c', 3=>'a', 4=>'d', 5=>'c',
  6=>'d', 7=>'c', 8=>'a', 9=>'a', 10=>'b',
  11=>'d', 12=>'a', 13=>'c', 14=>'b', 15=>'c',
  16=>'a', 17=>'d', 18=>'b', 19=>'b', 20=>'c',
  21=>'b', 22=>'b', 23=>'b', 24=>'c', 25=>'b',
  26=>'a', 27=>'c', 28=>'b', 29=>'b', 30=>'b'
];

$answer_key_stats = [
  1=>'c', 2=>'b', 3=>'a', 4=>'d', 5=>'b',
  6=>'c', 7=>'d', 8=>'a', 9=>'c', 10=>'b',
  11=>'a', 12=>'c', 13=>'b', 14=>'d', 15=>'a',
  16=>'c', 17=>'b', 18=>'d', 19=>'a', 20=>'c',
  21=>'b', 22=>'a', 23=>'c', 24=>'b', 25=>'d',
  26=>'a', 27=>'c', 28=>'b', 29=>'a', 30=>'c'
];

$answer_key = $course === 'stats' ? $answer_key_stats : $answer_key_bioinfo;

$correct = 0;
foreach ($answer_key as $q => $correct_ans) {
  if (isset($answers[$q]) && strtolower($answers[$q]) === $correct_ans) {
    $correct++;
  }
}

$score  = round(($correct / 30) * 100);
$passed = $score >= 80;

$db = getDB();
$db->exec("SET time_zone = '+00:00'");

// Check if already passed this course
$existing = $db->prepare('SELECT id FROM certificates WHERE user_id = ? AND course = ?');
$existing->execute([$_SESSION['user_id'], $course]);
if ($existing->fetch()) {
  echo json_encode(['error' => 'You already have a certificate for this course']); exit;
}

// Check if already attempted and failed
$attempted = $db->prepare('SELECT id FROM exam_attempts WHERE user_id = ? AND course = ?');
$attempted->execute([$_SESSION['user_id'], $course]);
if ($attempted->fetch()) {
  echo json_encode(['error' => 'You have already attempted this exam. To request a reexam, email contact@bioskillslab.dev']); exit;
}

// Record attempt
$stmt = $db->prepare('INSERT INTO exam_attempts (user_id, course, score, passed) VALUES (?, ?, ?, ?)');
$stmt->execute([$_SESSION['user_id'], $course, $score, $passed ? 1 : 0]);

if ($passed) {
  $cert_code = strtoupper(bin2hex(random_bytes(8)));
  $stmt = $db->prepare('INSERT INTO certificates (user_id, course, cert_code, score) VALUES (?, ?, ?, ?)');
  $stmt->execute([$_SESSION['user_id'], $course, $cert_code, $score]);
  echo json_encode(['success' => true, 'passed' => true, 'score' => $score, 'cert_code' => $cert_code]);
} else {
  echo json_encode(['success' => true, 'passed' => false, 'score' => $score, 'correct' => $correct, 'total' => 30]);
}
