<?php
require_once __DIR__ . '/../config/database.php';

class AccesoDatos {
    private $conn;
    private static $modelo = null;

    private function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public static function getModelo() {
        if (self::$modelo == null) {
            self::$modelo = new AccesoDatos();
        }
        return self::$modelo;
    }

    public function getConexion() {
        return $this->conn;
    }

    // Obtener usuario por email
    public function getUsuarioPorEmail($email) {
        $query = "SELECT id AS ID, email AS EMAIL, nombre AS NOMBRE, apellido AS APELLIDO,
                         telefono AS TELEFONO, grados AS GRADOS, clave AS CLAVE, es_admin AS ES_ADMIN
                  FROM usuarios WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_OBJ);
    }

    // Crear usuario
    public function crearUsuario($email, $nombre, $apellido, $telefono, $grados, $clave) {
        $query = "INSERT INTO USUARIOS (EMAIL, NOMBRE, APELLIDO, TELEFONO, GRADOS, CLAVE)
                  VALUES (:email, :nombre, :apellido, :telefono, :grados, :clave)";
        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($clave, PASSWORD_DEFAULT);

        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':apellido', $apellido);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':grados', $grados);
        $stmt->bindParam(':clave', $hashedPassword);

        return $stmt->execute();
    }

    // Obtener todos los usuarios (admin) — incluye es_admin para mostrar el rol
    public function getTodosLosUsuarios() {
        $query = "SELECT email AS EMAIL, nombre AS NOMBRE, apellido AS APELLIDO,
                         telefono AS TELEFONO, grados AS GRADOS, es_admin AS ES_ADMIN
                  FROM usuarios ORDER BY nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    // Dar permisos de administrador
    public function hacerAdmin($email) {
        $query = "UPDATE usuarios SET es_admin = 1 WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }

    // Quitar permisos de administrador (pasa a usuario normal)
    public function quitarAdmin($email) {
        $query = "UPDATE usuarios SET es_admin = 0 WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }

    // Ascender admin a superadmin
    public function hacerSuperAdmin($email) {
        $query = "UPDATE usuarios SET es_admin = 2 WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }

    // Degradar superadmin a admin normal (no a usuario)
    public function degradarSuperAdmin($email) {
        $query = "UPDATE usuarios SET es_admin = 1 WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }

    // Guardar comentario (con soporte de respuestas via parent_id)
    public function guardarComentario($nombre, $texto, $usuario_id = null, $parent_id = null) {
        if ($usuario_id !== null) {
            $query = "INSERT INTO comentarios (usuario_id, nombre, texto_comentario, fecha_creacion, parent_id)
                      VALUES (:usuario_id, :nombre, :texto, NOW(), :parent_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':texto', $texto);
            $stmt->bindParam(':parent_id', $parent_id);
        } else {
            $query = "INSERT INTO comentarios (nombre, texto_comentario, fecha_creacion, parent_id)
                      VALUES (:nombre, :texto, NOW(), :parent_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':texto', $texto);
            $stmt->bindParam(':parent_id', $parent_id);
        }
        return $stmt->execute();
    }

    // Obtener todos los comentarios — incluye parent_id para el sistema de respuestas
    public function getComentarios() {
        $query = "SELECT id, nombre AS NOMBRE, texto_comentario, fecha_creacion, parent_id
                  FROM comentarios ORDER BY fecha_creacion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    // Borrar comentario por ID
    public function borrarComentario($id) {
        $query = "DELETE FROM comentarios WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // Borrar usuario por email
    public function borrarUsuario($email) {
        $query = "DELETE FROM USUARIOS WHERE EMAIL = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }

    // Guardar solicitud de información (formulario landing)
    public function guardarSolicitudInfo($nombre, $apellido, $email, $telefono, $grados, $usuario_id = null) {
        $query = "INSERT INTO solicitudes_info (usuario_id, nombre, apellido, email, telefono, grados)
                  VALUES (:usuario_id, :nombre, :apellido, :email, :telefono, :grados)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':apellido', $apellido);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':grados', $grados);
        return $stmt->execute();
    }

    // Obtener los IDs de cursos comprados por un usuario
    public function getComprasUsuario($usuario_id) {
        $query = "SELECT curso_id FROM compras WHERE usuario_id = :usuario_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
        return array_map(fn($r) => (int)$r->curso_id, $rows);
    }

    // Registrar compra de uno o varios cursos (ignora duplicados)
    public function comprarCursos($usuario_id, $curso_ids) {
        $stmt = $this->conn->prepare(
            "INSERT IGNORE INTO compras (usuario_id, curso_id) VALUES (:usuario_id, :curso_id)"
        );
        foreach ($curso_ids as $curso_id) {
            $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->bindValue(':curso_id', $curso_id, PDO::PARAM_INT);
            $stmt->execute();
        }
        return true;
    }

    // Obtener todas las solicitudes de información
    public function getTodasLasSolicitudes() {
        $query = "SELECT id, usuario_id, nombre, apellido, email, telefono, grados, fecha_solicitud
                  FROM solicitudes_info ORDER BY fecha_solicitud DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }
}
?>
