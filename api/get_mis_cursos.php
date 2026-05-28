<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit();
}

$usuario_id = $_SESSION['usuario']['id'] ?? null;
if (!$usuario_id) {
    // Admin hardcoded no tiene ID en BD
    echo json_encode(['success' => true, 'data' => []]);
    exit();
}

require_once __DIR__ . '/../models/AccesoDatos.php';

try {
    $db = AccesoDatos::getModelo();
    $ids = $db->getComprasUsuario((int)$usuario_id);
    echo json_encode(['success' => true, 'data' => $ids]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor']);
}
