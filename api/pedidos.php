<?php
require_once '../config/database.php';

$conn   = conectar();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {

    // ── GET: buscar pedido por ID ou código ──────────────
    case 'GET':
        $codigo = isset($_GET['codigo']) ? $_GET['codigo'] : null;

        if ($codigo) {
            $stmt = $conn->prepare("SELECT * FROM pedidos WHERE codigo = ?");
            $stmt->bind_param('s', $codigo);
            $stmt->execute();
            $pedido = $stmt->get_result()->fetch_assoc();

            if (!$pedido) {
                http_response_code(404);
                echo json_encode(['erro' => 'Pedido não encontrado.']);
                break;
            }

            // Buscar itens do pedido
            $stmtI = $conn->prepare("SELECT * FROM itens_pedido WHERE pedido_id = ?");
            $stmtI->bind_param('i', $pedido['id']);
            $stmtI->execute();
            $resI = $stmtI->get_result();

            $itens = [];
            while ($row = $resI->fetch_assoc()) {
                $itens[] = $row;
            }

            $pedido['itens'] = $itens;
            echo json_encode($pedido);
        } else {
            http_response_code(400);
            echo json_encode(['erro' => 'Informe o código do pedido: ?codigo=CXM-XXXXX']);
        }
        break;

    // ── POST: criar pedido ───────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['itens']) || empty($data['total'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: itens, total.']);
            break;
        }

        // Gerar código único
        $codigo = 'CXM-' . strtoupper(substr(md5(uniqid()), 0, 9));

        $usuario_id = isset($data['usuario_id']) ? (int)$data['usuario_id'] : null;

        $stmt = $conn->prepare(
            "INSERT INTO pedidos (usuario_id, codigo, total, status) VALUES (?, ?, ?, 'pago')"
        );
        $stmt->bind_param('isd', $usuario_id, $codigo, $data['total']);

        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar pedido.']);
            break;
        }

        $pedido_id = $conn->insert_id;

        // Inserir itens
        foreach ($data['itens'] as $item) {
            $stmtI = $conn->prepare(
                "INSERT INTO itens_pedido (pedido_id, tipo, referencia_id, descricao, preco, quantidade)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            $ref_id     = isset($item['referencia_id']) ? (int)$item['referencia_id'] : 0;
            $quantidade = isset($item['quantidade'])    ? (int)$item['quantidade']    : 1;

            $stmtI->bind_param(
                'iissdi',
                $pedido_id,
                $item['tipo'],
                $ref_id,
                $item['descricao'],
                $item['preco'],
                $quantidade
            );
            $stmtI->execute();
        }

        http_response_code(201);
        echo json_encode([
            'mensagem' => 'Pedido criado com sucesso.',
            'codigo'   => $codigo,
            'id'       => $pedido_id
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
        break;
}

$conn->close();
?>