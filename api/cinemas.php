<?php
require_once '../config/database.php';

$conn   = conectar();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM cinemas WHERE id = ?");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $cinema = $stmt->get_result()->fetch_assoc();

            if (!$cinema) {
                http_response_code(404);
                echo json_encode(['erro' => 'Cinema não encontrado.']);
                break;
            }

            echo json_encode($cinema);
        } else {
            $result  = $conn->query("SELECT * FROM cinemas ORDER BY id ASC");
            $cinemas = [];
            while ($row = $result->fetch_assoc()) {
                $cinemas[] = $row;
            }
            echo json_encode($cinemas);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nome']) || empty($data['endereco'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: nome, endereco.']);
            break;
        }

        $stmt = $conn->prepare(
            "INSERT INTO cinemas (nome, endereco, telefone, horario, estacionamento, salas)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param(
            'sssssi',
            $data['nome'],
            $data['endereco'],
            $data['telefone'],
            $data['horario'],
            $data['estacionamento'],
            $data['salas']
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Cinema criado com sucesso.', 'id' => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar cinema.']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do cinema é obrigatório.']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $conn->prepare(
            "UPDATE cinemas SET nome=?, endereco=?, telefone=?, horario=?, estacionamento=?, salas=?
             WHERE id=?"
        );
        $stmt->bind_param(
            'sssssii',
            $data['nome'],
            $data['endereco'],
            $data['telefone'],
            $data['horario'],
            $data['estacionamento'],
            $data['salas'],
            $id
        );

        if ($stmt->execute()) {
            echo json_encode(['mensagem' => 'Cinema atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar cinema.']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do cinema é obrigatório.']);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM cinemas WHERE id = ?");
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            echo json_encode(['mensagem' => 'Cinema removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover cinema.']);
        }
        break;
}

$conn->close();
?>