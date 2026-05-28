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

$nivelAdmin = (int)($_SESSION['usuario']['es_admin'] ?? 0);
if (!isset($_SESSION['usuario']) || $nivelAdmin < 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
    exit();
}

require_once __DIR__ . '/../models/AccesoDatos.php';

try {
    $db = AccesoDatos::getModelo();
    $conn = $db->getConexion();

    $query = "SELECT u.nombre, u.email, c.curso_id, c.fecha_compra
              FROM compras c
              JOIN usuarios u ON u.id = c.usuario_id
              ORDER BY c.fecha_compra DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor']);
}
