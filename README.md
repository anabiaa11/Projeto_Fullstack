# CineMax

Sistema web de cinema desenvolvido com HTML, CSS e JavaScript puro, permitindo visualizar filmes em cartaz, escolher sessões, selecionar assentos, adicionar combos ao carrinho e finalizar a compra.

---

## Sobre o projeto

O CineMax simula a experiência de compra de ingressos de cinema online, com interface moderna, responsiva e interativa.

O sistema permite:

- Visualizar filmes em cartaz
- Filtrar filmes por gênero
- Escolher sessões disponíveis
- Selecionar assentos no cinema
- Adicionar combos de pipoca e bebidas
- Gerenciar carrinho de compras
- Realizar login simples de usuário
- Finalizar checkout com código de reserva
- Selecionar unidade de cinema
- Interface adaptada para desktop e mobile

---

## Tecnologias utilizadas

- **HTML5** – estrutura das páginas
- **CSS3** – layout moderno, responsivo e estilizado
- **JavaScript (Vanilla)** – toda a lógica do sistema, incluindo:
  - Renderização dinâmica de filmes, combos e cinemas
  - Controle de estado do carrinho
  - Sistema de login
  - Seleção de assentos
  - Checkout simulado
- **PHP** – back-end da aplicação, responsável pela API REST e comunicação com o banco de dados
- **MySQL** – banco de dados relacional para persistência dos dados

---

## Funcionalidades principais

### Filmes

Listagem dinâmica com:

- Gênero
- Classificação indicativa
- Avaliação
- Duração
- Horários de sessão
- Preço do ingresso

### Seleção de assentos

- Mapa interativo de assentos
- Assentos ocupados, disponíveis e selecionados
- Cálculo automático do valor total

### Combos

- Combos de alimentos adicionados ao carrinho
- Destaque para mais vendido

### Carrinho

- Visualização de itens adicionados
- Remoção de produtos
- Cálculo do total da compra

### Login / Cadastro

- Cadastro de usuário com nome, e-mail e senha
- Login com e-mail e senha
- Alteração da interface quando usuário está logado

### Checkout

- Simulação de pagamento
- Geração automática de código de reserva
- Limpeza do carrinho após confirmação

---

## Back-end (PHP + MySQL)

O back-end é organizado como uma **API REST** em PHP, com endpoints separados para cada recurso do sistema.

### Endpoints disponíveis

| Arquivo | Rota | Descrição |
|---|---|---|
| `filmes.php` | `/api/filmes` | CRUD de filmes e sessões |
| `cinemas.php` | `/api/cinemas` | CRUD de unidades de cinema |
| `combos.php` | `/api/combos` | CRUD de combos (soft delete) |
| `pedidos.php` | `/api/pedidos` | Criação e consulta de pedidos |
| `login.php` | `/auth/login.php` | Autenticação de usuário |
| `cadastro.php` | `/auth/register.php` | Cadastro de usuário |

### Detalhes dos endpoints

#### 🎬 Filmes (`filmes.php`)

- `GET /api/filmes` – Lista todos os filmes ativos (filtro opcional por gênero via `?genero=`)
- `GET /api/filmes?id=1` – Retorna um filme específico com suas sessões
- `POST /api/filmes` – Cria um novo filme (campos obrigatórios: `titulo`, `genero`, `imagem_url`)
- `PUT /api/filmes?id=1` – Atualiza os dados de um filme
- `DELETE /api/filmes?id=1` – Desativa um filme (soft delete via campo `ativo`)

#### 🏛️ Cinemas (`cinemas.php`)

- `GET /api/cinemas` – Lista todos os cinemas
- `GET /api/cinemas?id=1` – Retorna um cinema específico
- `POST /api/cinemas` – Cria uma nova unidade (campos obrigatórios: `nome`, `endereco`)
- `PUT /api/cinemas?id=1` – Atualiza os dados de um cinema
- `DELETE /api/cinemas?id=1` – Remove um cinema definitivamente

#### 🍿 Combos (`combos.php`)

- `GET /api/combos` – Lista todos os combos ativos, priorizando os mais vendidos
- `GET /api/combos?id=1` – Retorna um combo específico
- `POST /api/combos` – Cria um novo combo (campos obrigatórios: `nome`, `imagem_url`)
- `PUT /api/combos?id=1` – Atualiza os dados de um combo
- `DELETE /api/combos?id=1` – Desativa um combo (soft delete via campo `ativo`)

#### 🧾 Pedidos (`pedidos.php`)

- `GET /api/pedidos?codigo=CXM-XXXXX` – Busca um pedido pelo código, incluindo seus itens
- `POST /api/pedidos` – Cria um novo pedido com itens (campos obrigatórios: `itens`, `total`)
  - Gera automaticamente um código único no formato `CXM-XXXXXXXXX`
  - Aceita itens do tipo ingresso, combo, etc.

### Estrutura do banco de dados

O sistema utiliza as seguintes tabelas principais:

- `filmes` – catálogo de filmes
- `sessoes` – horários de sessões vinculados a filmes
- `cinemas` – unidades de cinema
- `combos` – opções de combos de alimentação
- `pedidos` – pedidos realizados pelos usuários
- `itens_pedido` – itens individuais de cada pedido
- `usuarios` – dados de autenticação dos usuários

---

## Responsividade

O layout foi desenvolvido para funcionar em:

- Celulares
- Tablets
- Computadores

Inclui menu mobile, modais interativos e navegação suave.

---

## Como executar o projeto

1. Baixe ou clone este repositório:

```bash
git clone https://github.com/seu-usuario/cinemax.git
```

2. Configure o banco de dados MySQL e ajuste as credenciais em `config/database.php`.

3. Suba o projeto em um servidor PHP local (ex: XAMPP, Laragon ou PHP built-in server):

```bash
php -S localhost:8000
```

4. Acesse no navegador:

```
http://localhost:8000
```

> Para rodar apenas o front-end sem back-end, basta abrir o arquivo `index.html` diretamente no navegador.

---

## Estrutura do projeto

```
/cinemax
│
├── index.html
├── style.css
├── script.js
│
├── login.php
├── cadastro.php
│
├── api/
│   ├── filmes.php
│   ├── cinemas.php
│   ├── combos.php
│   └── pedidos.php
│
├── auth/
│   ├── login.php
│   └── register.php
│
├── config/
│   └── database.php
│
├── includes/
│   ├── header.php
│   └── footer.php
│
└── README.md
```

---

## Objetivo acadêmico

Projeto desenvolvido para prática de desenvolvimento web, explorando:

- Manipulação de DOM
- Eventos em JavaScript
- Estruturação de interface
- Experiência do usuário (UX)
- Organização de código
- Desenvolvimento de API REST com PHP
- Integração front-end e back-end

---

## Autores

Desenvolvido por **Ana** e **Felipe**  
Projeto educacional para estudos de HTML, CSS, JavaScript e PHP.

---

## Licença

Este projeto é de uso educacional e livre para estudos.
