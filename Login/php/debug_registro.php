<?php
echo "<h2>Datos recibidos:</h2>";
echo "<pre>";
print_r($_POST);
echo "</pre>";

include 'conexion.php';

// Probar conexión
$test = $conn->query("SELECT COUNT(*) as total FROM usuarios");
$result = $test->fetch_assoc();
echo "<p>Usuarios en la tabla: " . $result['total'] . "</p>";
?>