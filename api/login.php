<?php include("includes/header.php"); ?>

<div class="form-container">
    <h2>Entrar</h2>

    <form action="auth/login.php" method="POST">
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="senha" placeholder="Senha" required>

        <button type="submit">Entrar</button>
    </form>

    <p>Não tem conta? <a href="cadastro.php">Cadastre-se</a></p>
</div>

<?php include("includes/footer.php"); ?>
