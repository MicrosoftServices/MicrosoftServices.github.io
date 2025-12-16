<?php
session_start();
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT id, username, password_hash, tipo, estado FROM usuarios WHERE username=? OR email=? LIMIT 1");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $usuario = $resultado->fetch_assoc();

        if (password_verify($password, $usuario['password_hash'])) {
            if ($usuario['estado'] !== 'activo') {
                die("Tu cuenta está " . $usuario['estado'] . ". Contacta al administrador.");
            }

            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario'] = $usuario['username'];
            $_SESSION['tipo'] = $usuario['tipo'];

            $update = $conn->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id=?");
            $update->bind_param("i", $usuario['id']);
            $update->execute();

            echo "success";
        } else {
            echo "Contraseña incorrecta.";
        }
    } else {
        echo "Usuario no encontrado.";
    }

    $stmt->close();
    $conn->close();
}
?>
