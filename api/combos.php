<?php
require_once '../config/database.php';

$conn   = conectar();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM combos WHERE id = ? AND ativo = 1");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $combo = $stmt->get_result()->fetch_assoc();

            if (!$combo) {
                http_response_code(404);
                echo json_encode(['erro' => 'Combo não encontrado.']);
                break;
            }

            echo json_encode($combo);
        } else {
            $result = $conn->query("SELECT * FROM combos WHERE ativo = 1 ORDER BY mais_vendido DESC, id ASC");
            $combos = [];
            while ($row = $result->fetch_assoc()) {
                $combos[] = $row;
            }
            echo json_encode($combos);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nome']) || empty($data['imagem_url'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: nome, imagem_url.']);
            break;
        }

        $maisVendido = isset($data['mais_vendido']) ? (int)$data['mais_vendido'] : 0;

        $stmt = $conn->prepare(
            "INSERT INTO combos (nome, descricao, imagem_url, preco, mais_vendido)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->bind_param(
            'sssdi',
            $data['nome'],
            $data['descricao'],
            $data['imagem_url'],
            $data['preco'],
            $maisVendido
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Combo criado com sucesso.', 'id' => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar combo.']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do combo é obrigatório.']);
            break;
        }

        $data        = json_decode(file_get_contents('php://input'), true);
        $maisVendido = isset($data['mais_vendido']) ? (int)$data['mais_vendido'] : 0;

        $stmt = $conn->prepare(
            "UPDATE combos SET nome=?, descricao=?, imagem_url=?, preco=?, mais_vendido=? WHERE id=?"
        );
        $stmt->bind_param(
            'sssdii',
            $data['nome'],
            $data['descricao'],
            $data['imagem_url'],
            $data['preco'],
            $maisVendido,
            $id
        );

        if ($stmt->execute()) {
            echo json_encode(['mensagem' => 'Combo atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar combo.']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do combo é obrigatório.']);
            break;
        }

        $stmt = $conn->prepare("UPDATE combos SET ativo = 0 WHERE id = ?");
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            echo json_encode(['mensagem' => 'Combo removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover combo.']);
        }
        break;
}

$conn->close();
?>