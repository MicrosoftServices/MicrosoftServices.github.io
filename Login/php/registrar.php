<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirmar = trim($_POST['confirmar']);

    if ($password !== $confirmar) {
        die("Las contraseñas no coinciden.");
    }

    
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    
    $verificar = $conn->prepare("SELECT * FROM usuarios WHERE username=? OR email=?");
    $verificar->bind_param("ss", $username, $email);
    $verificar->execute();
    $resultado = $verificar->get_result();

    if ($resultado->num_rows > 0) {
        die("El usuario o correo ya están registrados.");
    }

    
    $stmt = $conn->prepare("INSERT INTO usuarios (username, email, password_hash, tipo, estado) VALUES (?, ?, ?, 'estudiante', 'pendiente')");
    $stmt->bind_param("sss", $username, $email, $password_hash);

    if ($stmt->execute()) {
        echo "Registro exitoso. Ahora puedes iniciar sesión.";
    } else {
        echo "Error al registrar usuario: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>
