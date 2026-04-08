<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');

require 'config.php';

$chapter = isset($_GET['chapter']) ? trim($_GET['chapter']) : '';
if (!$chapter) { echo json_encode([]); exit; }

$db = getDB();
$stmt = $db->prepare('SELECT id, name, text, created_at, updated_at FROM comments WHERE chapter = ? ORDER BY created_at DESC');
$stmt->execute([$chapter]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
