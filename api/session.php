<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
session_start();
if (isset($_SESSION['user_id'])) {
  echo json_encode(['loggedIn' => true, 'username' => $_SESSION['username'], 'display_name' => $_SESSION['display_name']]);
} else {
  echo json_encode(['loggedIn' => false]);
}
