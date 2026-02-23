<?php
session_start();
include("../includes/db.php");

$nome  = $_POST["nome"];
$email = $_POST["email"];
$senha = password_hash($_POST["senha"], PASSWORD_DEFAULT);

$sql = "INSERT INTO usuarios (nome, email, senha)
        VALUES ('$nome', '$email', '$senha')";

if ($conn->query($sql) === TRUE) {
    $_SESSION["usuario"] = $nome;
    header("Location: ../index.php");
} else {
    echo "Erro ao cadastrar.";
}
