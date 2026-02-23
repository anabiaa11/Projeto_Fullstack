-- ================================================
-- CINEMAX - Banco de Dados
-- Execute no phpMyAdmin do XAMPP
-- ================================================

CREATE DATABASE IF NOT EXISTS cinemax CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinemax;

-- ================================================
-- TABELA: usuarios
-- ================================================
CREATE TABLE usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  senha       VARCHAR(255) NOT NULL,
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABELA: cinemas
-- ================================================
CREATE TABLE cinemas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  endereco      VARCHAR(255) NOT NULL,
  telefone      VARCHAR(20),
  horario       VARCHAR(100),
  estacionamento VARCHAR(100),
  salas         INT DEFAULT 1
);

INSERT INTO cinemas (nome, endereco, telefone, horario, estacionamento, salas) VALUES
('CineMax Shopping Center Norte', 'Av. Otto Baumgart, 500 - Vila Guilherme, São Paulo - SP', '(11) 3456-7890', 'Seg a Dom: 10h às 23h',   'Estacionamento com 2h grátis', 12),
('CineMax Shopping Morumbi',      'Av. Roque Petroni Jr, 1089 - Morumbi, São Paulo - SP',   '(11) 3456-7891', 'Seg a Dom: 10h às 00h',   'Estacionamento com 3h grátis', 15),
('CineMax Shopping Eldorado',     'Av. Rebouças, 3970 - Pinheiros, São Paulo - SP',          '(11) 3456-7892', 'Seg a Dom: 10h às 23h30', 'Estacionamento com 2h grátis', 10),
('CineMax Shopping Vila Olímpia', 'Rua Olimpíadas, 360 - Vila Olímpia, São Paulo - SP',      '(11) 3456-7893', 'Seg a Dom: 11h às 23h',   'Estacionamento com 2h grátis',  8);

-- ================================================
-- TABELA: filmes
-- ================================================
CREATE TABLE filmes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(200) NOT NULL,
  genero      VARCHAR(50)  NOT NULL,
  avaliacao   DECIMAL(3,1) NOT NULL,
  duracao     VARCHAR(20)  NOT NULL,
  classificacao VARCHAR(10) NOT NULL,
  imagem_url  TEXT         NOT NULL,
  preco       DECIMAL(8,2) NOT NULL,
  ativo       TINYINT(1)   DEFAULT 1
);

INSERT INTO filmes (titulo, genero, avaliacao, duracao, classificacao, imagem_url, preco) VALUES
('Velozes & Furiosos 11', 'Ação',     9.2, '2h 25min', '16', 'https://images.unsplash.com/photo-1761948245185-fc300ad20316?w=600&q=80', 28.00),
('A Última Aventura',     'Aventura', 8.7, '2h 10min', '12', 'https://images.unsplash.com/photo-1620146095812-813e2de733b1?w=600&q=80', 25.00),
('Risos Garantidos',      'Comédia',  7.5, '1h 45min', 'Livre', 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&q=80', 22.00),
('Sombras do Passado',    'Drama',    8.9, '2h 15min', '14', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80', 26.00),
('O Grito Silencioso',    'Terror',   7.8, '1h 55min', '18', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80', 24.00),
('Além do Universo',      'Ficção',   9.0, '2h 30min', '12', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80', 30.00);

-- ================================================
-- TABELA: sessoes
-- ================================================
CREATE TABLE sessoes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  filme_id   INT NOT NULL,
  cinema_id  INT NOT NULL,
  horario    VARCHAR(10) NOT NULL,
  FOREIGN KEY (filme_id)  REFERENCES filmes(id)  ON DELETE CASCADE,
  FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
);

INSERT INTO sessoes (filme_id, cinema_id, horario) VALUES
(1, 1, '14:30'), (1, 1, '17:15'), (1, 1, '20:00'), (1, 1, '22:45'),
(2, 1, '15:00'), (2, 1, '18:00'), (2, 1, '21:00'),
(3, 1, '13:30'), (3, 1, '16:30'), (3, 1, '19:30'), (3, 1, '22:00'),
(4, 1, '15:30'), (4, 1, '18:45'), (4, 1, '21:30'),
(5, 1, '19:00'), (5, 1, '21:45'), (5, 1, '00:15'),
(6, 1, '14:00'), (6, 1, '17:30'), (6, 1, '21:00');

-- ================================================
-- TABELA: combos
-- ================================================
CREATE TABLE combos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(150) NOT NULL,
  descricao   VARCHAR(255) NOT NULL,
  imagem_url  TEXT         NOT NULL,
  preco       DECIMAL(8,2) NOT NULL,
  mais_vendido TINYINT(1)  DEFAULT 0,
  ativo       TINYINT(1)  DEFAULT 1
);

INSERT INTO combos (nome, descricao, imagem_url, preco, mais_vendido) VALUES
('Combo Individual', 'Pipoca Média + Refrigerante 500ml',                      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=600&q=80', 28.00, 0),
('Combo Casal',      'Pipoca Grande + 2 Refrigerantes 500ml',                  'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=600&q=80', 40.00, 1),
('Combo Família',    'Pipoca Mega + 4 Refrigerantes 500ml + Nachos',           'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=600&q=80', 65.00, 0),

-- ================================================
-- TABELA: pedidos
-- ================================================
CREATE TABLE pedidos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT,
  codigo        VARCHAR(20)    NOT NULL UNIQUE,
  total         DECIMAL(10,2)  NOT NULL,
  status        ENUM('pendente','pago','cancelado') DEFAULT 'pendente',
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ================================================
-- TABELA: itens_pedido
-- ================================================
CREATE TABLE itens_pedido (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id    INT NOT NULL,
  tipo         ENUM('ingresso','combo') NOT NULL,
  referencia_id INT NOT NULL,
  descricao    VARCHAR(255),
  preco        DECIMAL(8,2) NOT NULL,
  quantidade   INT DEFAULT 1,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);