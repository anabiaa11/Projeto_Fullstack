<?php
require_once '../config/database.php';

$conn   = conectar();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$genero = isset($_GET['genero']) ? $_GET['genero'] : null;

switch ($method) {

    // ── GET: listar filmes ou buscar por ID ──────────────
    case 'GET':
        if ($id) {
            // Buscar filme + sessões
            $stmt = $conn->prepare("SELECT * FROM filmes WHERE id = ? AND ativo = 1");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $filme = $stmt->get_result()->fetch_assoc();

            if (!$filme) {
                http_response_code(404);
                echo json_encode(['erro' => 'Filme não encontrado.']);
                break;
            }

            // Buscar sessões do filme
            $stmtS = $conn->prepare("SELECT horario FROM sessoes WHERE filme_id = ? ORDER BY horario");
            $stmtS->bind_param('i', $id);
            $stmtS->execute();
            $res = $stmtS->get_result();

            $sessoes = [];
            while ($row = $res->fetch_assoc()) {
                $sessoes[] = $row['horario'];
            }

            $filme['sessoes'] = $sessoes;
            echo json_encode($filme);

        } else {
            // Listar todos com filtro opcional de gênero
            if ($genero && $genero !== 'Todos') {
                $stmt = $conn->prepare(
                    "SELECT f.*, GROUP_CONCAT(s.horario ORDER BY s.horario SEPARATOR ',') AS sessoes
                     FROM filmes f
                     LEFT JOIN sessoes s ON s.filme_id = f.id
                     WHERE f.ativo = 1 AND f.genero = ?
                     GROUP BY f.id"
                );
                $stmt->bind_param('s', $genero);
            } else {
                $stmt = $conn->prepare(
                    "SELECT f.*, GROUP_CONCAT(s.horario ORDER BY s.horario SEPARATOR ',') AS sessoes
                     FROM filmes f
                     LEFT JOIN sessoes s ON s.filme_id = f.id
                     WHERE f.ativo = 1
                     GROUP BY f.id"
                );
            }

            $stmt->execute();
            $result = $stmt->get_result();

            $filmes = [];
            while ($row = $result->fetch_assoc()) {
                $row['sessoes'] = $row['sessoes'] ? explode(',', $row['sessoes']) : [];
                $filmes[] = $row;
            }

            echo json_encode($filmes);
        }
        break;

    // ── POST: criar filme ────────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['titulo']) || empty($data['genero']) || empty($data['imagem_url'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: titulo, genero, imagem_url.']);
            break;
        }

        $stmt = $conn->prepare(
            "INSERT INTO filmes (titulo, genero, avaliacao, duracao, classificacao, imagem_url, preco)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param(
            'ssdsssd',
            $data['titulo'],
            $data['genero'],
            $data['avaliacao'],
            $data['duracao'],
            $data['classificacao'],
            $data['imagem_url'],
            $data['preco']
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Filme criado com sucesso.', 'id' => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar filme.']);
        }
        break;

    // ── PUT: atualizar filme ─────────────────────────────
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do filme é obrigatório.']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $conn->prepare(
            "UPDATE filmes SET titulo=?, genero=?, avaliacao=?, duracao=?, classificacao=?, imagem_url=?, preco=?
             WHERE id=?"
        );
        $stmt->bind_param(
            'ssdsssdi',
            $data['titulo'],
            $data['genero'],
            $data['avaliacao'],
            $data['duracao'],
            $data['classificacao'],
            $data['imagem_url'],
            $data['preco'],
            $id
        );

        if ($stmt->execute()) {
            echo json_encode(['mensagem' => 'Filme atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar filme.']);
        }
        break;

    // ── DELETE: desativar filme ──────────────────────────
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do filme é obrigatório.']);
            break;
        }

        $stmt = $conn->prepare("UPDATE filmes SET ativo = 0 WHERE id = ?");
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            echo json_encode(['mensagem' => 'Filme removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover filme.']);
        }
        break;
}

$conn->close();
?>