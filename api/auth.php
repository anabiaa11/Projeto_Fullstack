<?php
require_once '../config/database.php';

$conn   = conectar();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // ── CADASTRO ─────────────────────────────────────────
    case 'cadastro':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['erro' => 'Método não permitido.']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nome']) || empty($data['email']) || empty($data['senha'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, email e senha são obrigatórios.']);
            break;
        }

        // Verificar se email já existe
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->bind_param('s', $data['email']);
        $stmt->execute();

        if ($stmt->get_result()->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['erro' => 'Email já cadastrado.']);
            break;
        }

        $senha_hash = password_hash($data['senha'], PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
        $stmt->bind_param('sss', $data['nome'], $data['email'], $senha_hash);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                'mensagem' => 'Cadastro realizado com sucesso.',
                'usuario'  => [
                    'id'    => $conn->insert_id,
                    'nome'  => $data['nome'],
                    'email' => $data['email']
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao cadastrar usuário.']);
        }
        break;

    // ── LOGIN ─────────────────────────────────────────────
    case 'login':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['erro' => 'Método não permitido.']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['senha'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Email e senha são obrigatórios.']);
            break;
        }

        $stmt = $conn->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = ?");
        $stmt->bind_param('s', $data['email']);
        $stmt->execute();
        $usuario = $stmt->get_result()->fetch_assoc();

        if (!$usuario || !password_verify($data['senha'], $usuario['senha'])) {
            http_response_code(401);
            echo json_encode(['erro' => 'Email ou senha incorretos.']);
            break;
        }

        unset($usuario['senha']);
        echo json_encode([
            'mensagem' => 'Login realizado com sucesso.',
            'usuario'  => $usuario
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['erro' => 'Ação inválida. Use ?action=login ou ?action=cadastro']);
        break;
}

$conn->close();
?>