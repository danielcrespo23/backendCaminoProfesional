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

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
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
    $ok = $db->hacerAdmin($email);

    if ($ok) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Permisos de administrador concedidos']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró el usuario o no hubo cambios']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
