<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Content-Type: application/json');
    http_response_code(200);
    exit();
}

session_start();

if (!isset($_SESSION['usuario'])) {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit();
}

$curso_id = (int)($_GET['curso_id'] ?? 0);
if ($curso_id < 1 || $curso_id > 100) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de curso no válido']);
    exit();
}

$es_admin = (int)($_SESSION['usuario']['es_admin'] ?? 0) >= 1;
$usuario_id = $_SESSION['usuario']['id'] ?? null;

if (!$es_admin) {
    if (!$usuario_id) {
        header('Content-Type: application/json');
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
        exit();
    }

    require_once __DIR__ . '/../models/AccesoDatos.php';
    $db = AccesoDatos::getModelo();
    $ids_comprados = $db->getComprasUsuario((int)$usuario_id);

    if (!in_array($curso_id, $ids_comprados)) {
        header('Content-Type: application/json');
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'No has comprado este curso']);
        exit();
    }
}

$pdf_path = __DIR__ . '/../pdfs/curso_' . $curso_id . '.pdf';

if (!file_exists($pdf_path)) {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'El PDF de este curso aún no está disponible']);
    exit();
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="curso_' . $curso_id . '.pdf"');
header('Content-Length: ' . filesize($pdf_path));
header('Cache-Control: private, max-age=0, must-revalidate');
readfile($pdf_path);
