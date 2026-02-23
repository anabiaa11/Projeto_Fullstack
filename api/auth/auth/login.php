<?php
session_start();
include("../includes/db.php");

$email = $_POST["email"];
$senha = $_POST["senha"];

$sql = "SELECT * FROM usuarios WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($senha, $user["senha"])) {
        $_SESSION["usuario"] = $user["nome"];
        header("Location: ../index.php");
    } else {
        echo "Senha incorreta.";
    }
} else {
    echo "Usuário não encontrado.";
}
