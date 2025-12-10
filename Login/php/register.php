<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registro</title>
    <link rel="stylesheet" href="login.css">
</head>
<body>
<div class="content">
    <form action="register.php" method="POST">
        <h2>Registrarse</h2>

        <?php if (isset($_GET['error'])): ?>
            <p style="color: red;"><?= htmlspecialchars($_GET['error']) ?></p>
        <?php endif; ?>

        <div class="input-box">
            <input type="text" name="username" placeholder="Usuario" required>
        </div>

        <div class="input-box">
            <input type="email" name="email" placeholder="Correo electrónico" required>
        </div>

        <div class="input-box">
            <input type="password" name="password" placeholder="Contraseña" required>
        </div>

        <button type="submit" class="btnn">Registrarse</button>
        <a href="login.php" class="forgot-link">¿Ya tienes cuenta? Inicia sesión</a>
    </form>
</div>
</body>
</html>
