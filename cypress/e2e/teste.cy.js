// ================================================
// TESTES CYPRESS - CineMax
// ================================================

const BASE_URL = 'http://localhost:5252/projetofullstack/index.html';

// ================================================
// FILTROS DE GÊNERO
// ================================================
describe('Testes de Filtros de Gênero', () => {

  beforeEach(() => {
    cy.visit(BASE_URL);
    // Aguarda os filmes carregarem da API antes de cada teste
    cy.get('#moviesGrid .movie-card', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('Deve exibir os botões de filtro de gênero após carregar os filmes', () => {
    cy.get('#genreFilters .filter-btn').should('have.length.greaterThan', 0);
    cy.get('#genreFilters .filter-btn').first().should('contain', 'Todos');
  });

  it('Deve iniciar com o filtro "Todos" ativo', () => {
    cy.get('#genreFilters .filter-btn.active').should('contain', 'Todos');
  });

  it('Deve filtrar os filmes ao clicar em um gênero', () => {
    // Pega o segundo botão (primeiro gênero real, após "Todos")
    cy.get('#genreFilters .filter-btn').eq(1).then(($btn) => {
      const genero = $btn.text();
      cy.wrap($btn).click();

      // O botão clicado deve ficar ativo
      cy.get('#genreFilters .filter-btn.active').should('contain', genero);

      // O grid deve mostrar filmes
      cy.get('#moviesGrid .movie-card').should('have.length.greaterThan', 0);
    });
  });

  it('Deve voltar a exibir todos os filmes ao clicar em "Todos"', () => {
    // Clica em um gênero qualquer primeiro
    cy.get('#genreFilters .filter-btn').eq(1).click();

    // Depois clica em "Todos"
    cy.get('#genreFilters .filter-btn').first().click();

    cy.get('#genreFilters .filter-btn.active').should('contain', 'Todos');
    cy.get('#moviesGrid .movie-card').should('have.length.greaterThan', 0);
  });

});

// ================================================
// MODAL DE LOCALIZAÇÃO
// ================================================
describe('Testes do Modal de Localização', () => {

  beforeEach(() => {
    cy.visit(BASE_URL);
  });

  it('Deve abrir o modal de localização ao clicar no botão de local', () => {
    cy.get('#btnLocation').click();
    cy.get('#modalLocation').should('be.visible');
  });

  it('Deve exibir as opções de cinema dentro do modal', () => {
    cy.get('#btnLocation').click();
    cy.get('#locationsList .location-option').should('have.length.greaterThan', 0);
  });

  it('Deve selecionar um cinema e atualizar o texto do header', () => {
    cy.get('#btnLocation').click();

    // Clica na segunda opção de cinema
    cy.get('#locationsList .location-option').eq(1).then(($btn) => {
      const nomeCinema = $btn.find('.location-option__name').text().replace('📍', '').trim();
      cy.wrap($btn).click();

      // O modal deve fechar
      cy.get('#modalLocation').should('not.be.visible');

      // O texto do header deve atualizar
      cy.get('#locationText').should('contain', nomeCinema);
    });
  });

  it('Deve fechar o modal ao clicar no botão "X"', () => {
    cy.get('#btnLocation').click();
    cy.get('#modalLocation').should('be.visible');
    cy.get('#modalLocation .modal__close').click();
    cy.get('#modalLocation').should('not.be.visible');
  });

});

// ================================================
// MODAL DE ASSENTOS
// ================================================
describe('Testes do Modal de Assentos', () => {

  beforeEach(() => {
    cy.visit(BASE_URL);
    // Aguarda os filmes carregarem
    cy.get('#moviesGrid .movie-card', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('Deve abrir o modal de assentos ao clicar em uma sessão', () => {
    cy.get('.session-btn').first().click();
    cy.get('#modalSeats').should('be.visible');
  });

  it('Deve exibir o título do filme no modal de assentos', () => {
    cy.get('.movie-card').first().then(($card) => {
      const titulo = $card.find('.movie-card__title').text();
      cy.get('.session-btn').first().click();
      cy.get('#seatMovieTitle').should('contain', titulo);
    });
  });

  it('Deve selecionar um assento disponível e habilitar o botão de confirmar', () => {
    cy.get('.session-btn').first().click();
    cy.get('#modalSeats').should('be.visible');

    // Clica no primeiro assento disponível
    cy.get('.seat--available').first().click();

    // O botão de confirmar deve ficar habilitado
    cy.get('#btnConfirmSeats').should('not.be.disabled');
    cy.get('#btnConfirmSeats').should('contain', '1');
  });



  it('Deve fechar o modal ao clicar no botão "X"', () => {
    cy.get('.session-btn').first().click();
    cy.get('#modalSeats').should('be.visible');
    cy.get('#modalSeats .modal__close').click();
    cy.get('#modalSeats').should('not.be.visible');
  });

});

// ================================================
// CARRINHO DE COMPRAS
// ================================================
describe('Testes do Carrinho de Compras', () => {

  beforeEach(() => {
    cy.visit(BASE_URL);
    cy.get('#moviesGrid .movie-card', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('Deve abrir o carrinho ao clicar no ícone', () => {
    cy.get('#btnCart').click();
    cy.get('#modalCart').should('be.visible');
  });

  it('Deve exibir mensagem de carrinho vazio quando não há itens', () => {
    cy.get('#btnCart').click();
    cy.get('#cartBody').should('contain', 'carrinho esta vazio');
  });

  it('Deve adicionar um combo ao carrinho', () => {
    // Clica no botão de adicionar do primeiro combo
    cy.get('#combosGrid .btn').first().click();

    // O modal do carrinho deve abrir automaticamente
    cy.get('#modalCart').should('be.visible');

    // Deve ter um item no carrinho
    cy.get('#cartBody .cart-item').should('have.length', 1);
  });

  it('Deve atualizar o badge do carrinho ao adicionar item', () => {
    cy.get('#cartBadge').should('contain', '0');

    cy.get('#combosGrid .btn').first().click();
    cy.get('#modalCart .modal__close').click();

    cy.get('#cartBadge').should('contain', '1');
  });

  it('Deve adicionar ingresso ao carrinho via seleção de assento', () => {
    // Abre o modal de assentos
    cy.get('.session-btn').first().click();

    // Seleciona um assento
    cy.get('.seat--available').first().click();

    // Confirma
    cy.get('#btnConfirmSeats').click();

    // O carrinho deve abrir com o ingresso
    cy.get('#modalCart').should('be.visible');
    cy.get('#cartBody .cart-item').should('have.length', 1);
    cy.get('.cart-item__type--ticket').should('exist');
  });

  it('Deve remover um item do carrinho', () => {
    // Adiciona um combo
    cy.get('#combosGrid .btn').first().click();
    cy.get('#cartBody .cart-item').should('have.length', 1);

    // Remove o item
    cy.get('.cart-item__remove').first().click();

    // Carrinho deve ficar vazio
    cy.get('#cartBody').should('contain', 'carrinho esta vazio');
  });

  it('Deve fechar o carrinho ao clicar no botão "X"', () => {
    cy.get('#btnCart').click();
    cy.get('#modalCart').should('be.visible');
    cy.get('#modalCart .modal__close').click();
    cy.get('#modalCart').should('not.be.visible');
  });

});