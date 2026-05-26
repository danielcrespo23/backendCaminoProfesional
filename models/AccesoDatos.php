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
   // Guardar comentario (¡Fíjate que se llama insertarComentario!)
   public function insertarComentario($nombre, $texto) {
        $query = "INSERT INTO comentarios (nombre_autor, comentario, fecha_creacion)
                  VALUES (:nombre, :texto, NOW())";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':texto', $texto);
        return $stmt->execute();
    }
    // Obtener todos los comentarios
    public function getComentarios() {
    $query = "SELECT id, nombre_autor, comentario, fecha_creacion FROM comentarios ORDER BY fecha_creacion DESC";
    $stmt = $this->conn->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_OBJ);
}
    public function borrarComentario($id) {
      $query = "DELETE FROM comentarios WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    return $stmt->execute();
}
public function registrarUsuario($nombre, $apellido, $email, $password, $telefono, $ciclos) {
        // 🔥 MUY IMPORTANTE: Encriptamos la contraseña por seguridad antes de guardarla
        $passHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Asumo que tu tabla se llama 'usuarios'. Si las columnas se llaman distinto, cámbialas aquí:
        $query = "INSERT INTO usuarios (nombre, apellido, email, password, telefono, ciclos) 
                  VALUES (:nombre, :apellido, :email, :password, :telefono, :ciclos)";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':apellido', $apellido);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $passHash); // Guardamos la contraseña encriptada
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':ciclos', $ciclos);
        
        return $stmt->execute();
    }
    // Guardar solicitud de información (Formulario de la landing)
    public function guardarSolicitudInfo($nombre, $apellido, $email, $telefono, $ciclo_interes) {
        $query = "INSERT INTO solicitudes_info (nombre, apellido, email, telefono, ciclo_interes) 
                  VALUES (:nombre, :apellido, :email, :telefono, :ciclo_interes)";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':apellido', $apellido);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':ciclo_interes', $ciclo_interes);
        
        return $stmt->execute();
    }
    // Obtener todas las solicitudes de información
    public function getTodasLasSolicitudes() {
        $query = "SELECT * FROM solicitudes_info ORDER BY fecha_solicitud DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    // Borrar un usuario por su email
    public function borrarUsuario($email) {
        $query = "DELETE FROM USUARIOS WHERE EMAIL = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }
}


?>