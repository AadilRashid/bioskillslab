<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://bioskillslab.dev');
session_start();
session_destroy();
echo json_encode(['success' => true]);
