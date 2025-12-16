<?php
$host = "localhost";
$user = "root"; 
$pass = "1803";    
$dbname = "manuel_cabral";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
