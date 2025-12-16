<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel</title>
</head>
<body>
    <h2>Bienvenido, <?= htmlspecialchars($_SESSION['username']) ?>!</h2>
    <p>Tipo de usuario: <?= htmlspecialchars($_SESSION['tipo']) ?></p>
    <a href="logout.php">Cerrar sesión</a>
</body>
</html>
