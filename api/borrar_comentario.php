<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require_once __DIR__ . '/../models/AccesoDatos.php';

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit();
}

$usuario = $_SESSION['usuario'];
if (strtolower($usuario['nombre']) !== 'admin' && strtolower($usuario['nombre']) !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'No tienes permisos de administrador']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de comentario no proporcionado']);
    exit();
}

try {
    $db = AccesoDatos::getModelo();
    $resultado = $db->borrarComentario($id);

    if ($resultado) {
        echo json_encode(['success' => true, 'message' => 'Comentario borrado']);
    } else {
        throw new Exception('No se pudo borrar el comentario');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
