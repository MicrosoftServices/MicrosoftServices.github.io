<?php
session_start();
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario']);
    $password = trim($_POST['password']);

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE username = :user OR email = :user LIMIT 1");
    $stmt->execute(['user' => $usuario]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        if ($user['estado'] !== 'activo') {
            header("Location: login.php?error=" . urlencode("Cuenta inactiva o pendiente"));
            exit;
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['tipo'] = $user['tipo'];

        $pdo->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?")->execute([$user['id']]);
        header("Location: dashboard.php");
        exit;
    } else {
        header("Location: login.php?error=" . urlencode("Usuario o contraseña incorrectos"));
        exit;
    }
}
?>
