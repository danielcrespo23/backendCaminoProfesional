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

require_once __DIR__ . '/../models/AccesoDatos.php';

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data['email'] ?? '');
$nombre   = trim($data['nombre'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$telefono = trim($data['telefono'] ?? '');
$grados   = trim($data['grados'] ?? ''); 

if (empty($email) || empty($nombre) || empty($apellido)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email, nombre y apellido son obligatorios']);
    exit();
}

try {
    $db = AccesoDatos::getModelo();
    $resultado = $db->guardarSolicitudInfo($nombre, $apellido, $email, $telefono, $grados);
    
    if ($resultado) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Solicitud guardada correctamente']);
    } else {
        throw new Exception('Error al guardar en la base de datos');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>