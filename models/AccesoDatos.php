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
        $query = "SELECT * FROM USUARIOS WHERE EMAIL = :email LIMIT 1";
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

    // Obtener todos los usuarios (admin)
    public function getTodosLosUsuarios() {
        $query = "SELECT EMAIL, NOMBRE, APELLIDO, TELEFONO, GRADOS FROM USUARIOS ORDER BY NOMBRE";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    // Guardar comentario
    public function guardarComentario($nombre, $texto) {
        $query = "INSERT INTO comentarios (NOMBRE, texto_comentario, fecha_creacion)
                  VALUES (:nombre, :texto, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':texto', $texto);
        return $stmt->execute();
    }

    // Obtener todos los comentarios
    public function getComentarios() {
        $query = "SELECT NOMBRE, texto_comentario, fecha_creacion FROM comentarios ORDER BY fecha_creacion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }
}
?>