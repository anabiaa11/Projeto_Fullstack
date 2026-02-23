# 🎬 CineMax — Testes Automatizados com Cypress

Este repositório contém os **testes automatizados end-to-end (E2E)** do projeto CineMax, desenvolvidos utilizando o framework **Cypress**.

Os testes validam as principais funcionalidades do sistema, garantindo que a aplicação esteja funcionando corretamente do ponto de vista do usuário.

---

## 🚀 Tecnologias Utilizadas

- JavaScript  
- Cypress  
- HTML  
- CSS  
- API local  

---

## 📂 Estrutura dos Testes

Arquivo principal:

teste.cy.js

Os testes estão organizados por funcionalidades:

- 🎭 Filtros de Gênero  
- 📍 Modal de Localização  
- 💺 Modal de Assentos  
- 🛒 Carrinho de Compras  

---

# ✅ Funcionalidades Testadas

## 🎭 Filtros de Gênero

Valida:

- ✔️ Exibição dos botões de filtro  
- ✔️ Filtro "Todos" ativo por padrão  
- ✔️ Filtragem correta ao clicar em um gênero  
- ✔️ Retorno à listagem completa ao clicar em "Todos"  

---

## 📍 Modal de Localização

Valida:

- ✔️ Abertura do modal  
- ✔️ Exibição das opções de cinema  
- ✔️ Seleção de cinema  
- ✔️ Atualização do texto no header  
- ✔️ Fechamento do modal  

---

## 💺 Modal de Assentos

Valida:

- ✔️ Abertura do modal ao clicar em sessão  
- ✔️ Exibição do título do filme  
- ✔️ Seleção de assento disponível  
- ✔️ Habilitação do botão de confirmação  
- ✔️ Fechamento do modal  

---

## 🛒 Carrinho de Compras

Valida:

- ✔️ Abertura do carrinho  
- ✔️ Mensagem de carrinho vazio  
- ✔️ Adição de combos  
- ✔️ Atualização do badge do carrinho  
- ✔️ Adição de ingresso via seleção de assento  
- ✔️ Remoção de item  
- ✔️ Fechamento do carrinho  

---

# ▶️ Como Executar os Testes

## 1️⃣ Instale as dependências

```bash
npm install
