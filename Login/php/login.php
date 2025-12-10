<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="login.css">
</head>
<body>
<div class="content">
    <form action="login_process.php" method="POST">
        <h2>Iniciar Sesión</h2>

        <?php if (isset($_GET['error'])): ?>
            <p style="color: red;"><?= htmlspecialchars($_GET['error']) ?></p>
        <?php endif; ?>
        <?php if (isset($_GET['success'])): ?>
            <p style="color: green;"><?= htmlspecialchars($_GET['success']) ?></p>
        <?php endif; ?>

        <div class="input-box">
            <input type="text" name="usuario" placeholder="Usuario o correo" required>
        </div>

        <div class="input-box">
            <input type="password" name="password" placeholder="Contraseña" required>
        </div>

        <button type="submit" class="btnn">Entrar</button>
        <a href="register.php" class="forgot-link">¿No tienes cuenta? Regístrate</a>
    </form>
</div>
</body>
</html>
