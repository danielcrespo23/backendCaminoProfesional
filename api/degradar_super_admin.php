<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require_once __DIR__ . '/../models/AccesoDatos.php';

$nivelAdmin = (int)($_SESSION['usuario']['es_admin'] ?? 0);
if (!isset($_SESSION['usuario']) || $nivelAdmin < 2) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Solo el superadmin puede realizar esta acción']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$data  = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta el email del usuario']);
    exit();
}

try {
    $db = AccesoDatos::getModelo();
    $ok = $db->degradarSuperAdmin($email);

    http_response_code($ok ? 200 : 404);
    echo json_encode([
        'success' => $ok,
        'message' => $ok ? 'Superadmin degradado a admin' : 'No se encontró el usuario o no hubo cambios'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
