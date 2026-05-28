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

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$usuario_id = $_SESSION['usuario']['id'] ?? null;
if (!$usuario_id) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Esta cuenta no puede realizar compras']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$curso_ids = $data['curso_ids'] ?? [];

if (empty($curso_ids) || !is_array($curso_ids)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No hay cursos en el carrito']);
    exit();
}

$curso_ids = array_values(array_filter(array_map('intval', $curso_ids), fn($id) => $id >= 1 && $id <= 100));

if (empty($curso_ids)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'IDs de cursos no válidos']);
    exit();
}

require_once __DIR__ . '/../models/AccesoDatos.php';

try {
    $db = AccesoDatos::getModelo();
    $db->comprarCursos((int)$usuario_id, $curso_ids);
    echo json_encode(['success' => true, 'message' => 'Compra realizada correctamente']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
