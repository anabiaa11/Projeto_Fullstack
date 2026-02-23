<?php include("includes/header.php"); ?>

<div class="form-container">
    <h2>Criar Conta</h2>

    <form action="auth/register.php" method="POST">
        <input type="text" name="nome" placeholder="Nome" required>
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="senha" placeholder="Senha" required>

        <button type="submit">Cadastrar</button>
    </form>

    <p>Já tem conta? <a href="login.php">Entrar</a></p>
</div>

<?php include("includes/footer.php"); ?>
