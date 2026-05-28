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

$data = json_decode(file_get_contents("php://input"), true);
$texto = trim($data['texto_comentario'] ?? '');

if (empty($texto)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El comentario no puede estar vacío']);
    exit();
}

// Extraer el nombre del usuario de la sesión
$usuario = $_SESSION['usuario'];
$nombre  = $usuario['nombre'];

try {
    $db = AccesoDatos::getModelo();
    $resultado = $db->guardarComentario($nombre, $texto);

    if ($resultado) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Comentario guardado correctamente']);
    } else {
        throw new Exception('Error al guardar el comentario');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
