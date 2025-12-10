<?php
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'conexion.php';

if (!$conn) {
    die("Error de conexión: " . mysqli_connect_error());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // VALORES POR DEFECTO
    $defaults = [
        'padece_enfermedad' => 'no',
        'numero_hermanos' => 0,
        'hermanos_centro' => 0
    ];

    foreach ($defaults as $c => $v) {
        if (!isset($_POST[$c]) || $_POST[$c] === "") $_POST[$c] = $v;
    }

    // ✔ SQL EXACTO CON 60 CAMPOS (59 del form + estado)
    $sql = "INSERT INTO formularios_inscripcion (
        nombre_solicitante, email_solicitante, telefono_solicitante, relacion_estudiante,
        nombres_estudiante, apellidos_estudiante, fecha_nacimiento, genero, grado_solicitado,
        escuela_procedencia, telefono_estudiante, celular_estudiante, whatsapp_estudiante,
        email_estudiante, numero_hermanos, hermanos_centro, direccion_estudiante,
        numero_direccion, sector_estudiante, tipo_vivienda, tipo_construccion,
        especialidad_interes,

        nombres_madre, apellidos_madre, cedula_madre, escolaridad_madre, ocupacion_madre,
        trabajo_madre, telefono_madre, celular_madre, telefono_trabajo_madre, direccion_madre,
        sector_madre, email_madre,

        nombres_padre, apellidos_padre, cedula_padre, escolaridad_padre, ocupacion_padre,
        trabajo_padre, telefono_padre, celular_padre, telefono_trabajo_padre, direccion_padre,
        sector_padre, email_padre,

        vive_con, nombre_responsable, telefono_responsable, celular_responsable,
        direccion_responsable, email_responsable,

        padece_enfermedad, tipo_enfermedad, medicamento,

        contacto_emergencia, telefono_emergencia, celular_emergencia, telefono_trabajo_emergencia,

        estado
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        'pendiente'
    )";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        die("Error preparando consulta: " . $conn->error);
    }

    // ✔ PARÁMETROS EXACTOS (59)
    $params = [
        $_POST['nombre_solicitante'], $_POST['email_solicitante'], $_POST['telefono_solicitante'], $_POST['relacion_estudiante'],
        $_POST['nombres_estudiante'], $_POST['apellidos_estudiante'], $_POST['fecha_nacimiento'], $_POST['genero'], $_POST['grado_solicitado'],
        $_POST['escuela_procedencia'], $_POST['telefono_estudiante'], $_POST['celular_estudiante'], $_POST['whatsapp_estudiante'],
        $_POST['email_estudiante'], intval($_POST['numero_hermanos']), intval($_POST['hermanos_centro']), $_POST['direccion_estudiante'],
        $_POST['numero_direccion'], $_POST['sector_estudiante'], $_POST['tipo_vivienda'], $_POST['tipo_construccion'],
        $_POST['especialidad_interes'],

        $_POST['nombres_madre'], $_POST['apellidos_madre'], $_POST['cedula_madre'], $_POST['escolaridad_madre'], $_POST['ocupacion_madre'],
        $_POST['trabajo_madre'], $_POST['telefono_madre'], $_POST['celular_madre'], $_POST['telefono_trabajo_madre'], $_POST['direccion_madre'],
        $_POST['sector_madre'], $_POST['email_madre'],

        $_POST['nombres_padre'], $_POST['apellidos_padre'], $_POST['cedula_padre'], $_POST['escolaridad_padre'], $_POST['ocupacion_padre'],
        $_POST['trabajo_padre'], $_POST['telefono_padre'], $_POST['celular_padre'], $_POST['telefono_trabajo_padre'], $_POST['direccion_padre'],
        $_POST['sector_padre'], $_POST['email_padre'],

        $_POST['vive_con'], $_POST['nombre_responsable'], $_POST['telefono_responsable'], $_POST['celular_responsable'],
        $_POST['direccion_responsable'], $_POST['email_responsable'],

        $_POST['padece_enfermedad'], $_POST['tipo_enfermedad'], $_POST['medicamento'],

        $_POST['contacto_emergencia'], $_POST['telefono_emergencia'], $_POST['celular_emergencia'], $_POST['telefono_trabajo_emergencia']
    ];

    // ✔ 57 strings + 2 integers
    $tipos = str_repeat('s', 57) . 'ii';

    $stmt->bind_param($tipos, ...$params);

    // EJECUTAR INSERT
    if ($stmt->execute()) {

        echo "<h1 style='font-family:Arial; color:green; text-align:center;'>Datos insertados correctamente ✔</h1>";
        echo "<p style='text-align:center;'>Redirigiendo al formulario...</p>";

        // ✔ REDIRECCIÓN AUTOMÁTICA A TU FORMULARIO
        header("Refresh: 2; URL=../html/inscripciones.html");
        exit();
    } else {
        echo "Error al ejecutar: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();

} else {
    echo "Acceso no permitido.";
}
?>
