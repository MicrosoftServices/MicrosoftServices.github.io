<?php
session_start();
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $username  = trim($_POST['username']);
    $email     = trim($_POST['email']);
    $password  = trim($_POST['password']);
    $confirmar = trim($_POST['confirmar']);

    // Contraseñas no coinciden
    if ($password !== $confirmar) {
        $_SESSION['error_registro'] = "Las contraseñas no coinciden.";
        header("Location: ../Ingresar_for.html");
        exit();
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Verificar usuario o correo
    $verificar = $conn->prepare(
        "SELECT id FROM usuarios WHERE username=? OR email=?"
    );
    $verificar->bind_param("ss", $username, $email);
    $verificar->execute();
    $resultado = $verificar->get_result();

    if ($resultado->num_rows > 0) {
        $_SESSION['error_registro'] = "El usuario o correo ya están registrados.";
        header("Location: ../Ingresar_for.html");
        exit();
    }

    // Insertar usuario
    $stmt = $conn->prepare(
        "INSERT INTO usuarios (username, email, password_hash, tipo, estado)
         VALUES (?, ?, ?, 'estudiante', 'pendiente')"
    );
    $stmt->bind_param("sss", $username, $email, $password_hash);

    if ($stmt->execute()) {
        // ✅ Registro exitoso → vuelve al login SIN mensaje
        header("Location: ../Ingresar_for.html");
        exit();
    } else {
        $_SESSION['error_registro'] = "Error al registrar el usuario.";
        header("Location: ../Ingresar_for.html");
        exit();
    }
}
?>
