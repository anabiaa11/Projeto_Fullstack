// ================================================
// CONFIGURAÇÃO DA API TMDB
// ================================================
const TMDB_CONFIG = {
  API_KEY: 'be7e1098482adef311fc485d3c4c324d',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
  LANGUAGE: 'pt-BR',
  REGION: 'BR'
};

// ================================================
// DADOS LOCAIS (fallback e cinemas/combos)
// ================================================
const combos = [
  {
    id: 1, nome: 'Combo Individual', mais_vendido: false,
    descricao: 'Pipoca Media + Refrigerante 500ml', preco: 28.00,
    imagem_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&q=80'
  },
  {
    id: 2, nome: 'Combo Casal', mais_vendido: true,
    descricao: 'Pipoca Grande + 2 Refrigerantes 500ml', preco: 40.00,
    imagem_url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&q=80'
  },
  {
    id: 3, nome: 'Combo Familia', mais_vendido: false,
    descricao: 'Pipoca Mega + 4 Refrigerantes + Nachos', preco: 65.00,
    imagem_url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80'
  }
];

const cinemas = [
  { id:1, nome:'CineMax Shopping Center Norte', endereco:'Av. Otto Baumgart, 500 - Vila Guilherme, SP', telefone:'(11) 3456-7890', horario:'Seg a Dom: 10h as 23h',    estacionamento:'2h gratis', salas:12 },
  { id:2, nome:'CineMax Shopping Morumbi',      endereco:'Av. Roque Petroni Jr, 1089 - Morumbi, SP',   telefone:'(11) 3456-7891', horario:'Seg a Dom: 10h as 00h',    estacionamento:'3h gratis', salas:15 },
  { id:3, nome:'CineMax Shopping Eldorado',     endereco:'Av. Reboucas, 3970 - Pinheiros, SP',          telefone:'(11) 3456-7892', horario:'Seg a Dom: 10h as 23h30', estacionamento:'2h gratis', salas:10 },
  { id:4, nome:'CineMax Shopping Vila Olimpia', endereco:'Rua Olimpiadas, 360 - Vila Olimpia, SP',      telefone:'(11) 3456-7893', horario:'Seg a Dom: 11h as 23h',    estacionamento:'2h gratis', salas:8  }
];

// Sessões e preços gerados dinamicamente para cada filme
const SESSOES_PADRAO = ['14:30','17:15','20:00','22:45'];
const PRECO_PADRAO   = 28;

// Gêneros TMDB → labels em português
const GENEROS_MAP = {
  28: 'Acao', 12: 'Aventura', 35: 'Comedia', 18: 'Drama',
  27: 'Terror', 878: 'Ficcao', 10749: 'Romance', 16: 'Animacao',
  80: 'Crime', 99: 'Documentario', 14: 'Fantasia', 36: 'Historia',
  10402: 'Musica', 9648: 'Misterio', 10752: 'Guerra', 37: 'Faroeste'
};

// ================================================
// ESTADO
// ================================================
const state = {
  carrinho: [],
  usuario: null,
  localSelecionado: 'CineMax Shopping Center Norte',
  assentosSelecionados: [],
  sessaoAtual: { filme: '', sessao: '', preco: 0 },
  assentosOcupados: ['C5','C6','D7','D8','E5','E6','E7'],
  filmesCarregados: [],
  generoAtivo: 'Todos'
};

// ================================================
// API TMDB — BUSCAR FILMES EM CARTAZ
// ================================================
async function buscarFilmesEmCartaz() {
  mostrarLoadingFilmes();

  try {
    const url = `${TMDB_CONFIG.BASE_URL}/movie/now_playing?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&region=${TMDB_CONFIG.REGION}&page=1`;
    const resp = await fetch(url);

    if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);

    const data = await resp.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('Nenhum filme retornado pela API');
    }

    // Mapeia os filmes da API para o formato interno
    const filmes = data.results.slice(0, 9).map(function(f) {
      const generoId  = f.genre_ids && f.genre_ids[0];
      const genero    = GENEROS_MAP[generoId] || 'Acao';
      const duracao   = '2h 00min'; // TMDB /now_playing não retorna duração; use /movie/{id} se quiser
      const classif   = classificacaoPorGenero(genero);
      const sessoes   = gerarSessoes();
      const preco     = gerarPreco(genero);
      const imagem    = f.poster_path
        ? TMDB_CONFIG.IMAGE_BASE + f.poster_path
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80';

      return {
        id:           f.id,
        titulo:       f.title,
        genero:       genero,
        avaliacao:    parseFloat((f.vote_average / 10 * 10).toFixed(1)),
        duracao:      duracao,
        classificacao: classif,
        imagem_url:   imagem,
        sessoes:      sessoes,
        preco:        preco,
        sinopse:      f.overview || 'Sinopse não disponível.'
      };
    });

    state.filmesCarregados = filmes;
    renderizarFilmes(filmes);
    atualizarFiltros(filmes);

  } catch (err) {
    console.error('[TMDB] Falha ao buscar filmes:', err);
    mostrarErroBuscaFilmes(err.message);
  }
}

// ================================================
// API TMDB — BUSCAR DETALHES DE UM FILME
// ================================================
async function buscarDetalhesFilme(filmeId) {
  try {
    const url = `${TMDB_CONFIG.BASE_URL}/movie/${filmeId}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erro ao buscar detalhes');
    const data = await resp.json();
    return data;
  } catch (err) {
    console.error('[TMDB] Erro ao buscar detalhes:', err);
    return null;
  }
}

// ================================================
// HELPERS
// ================================================
function classificacaoPorGenero(genero) {
  const map = {
    'Terror': '18', 'Acao': '14', 'Crime': '16',
    'Drama': '12',  'Comedia': 'Livre', 'Animacao': 'Livre',
    'Aventura': '10', 'Ficcao': '12', 'Romance': 'Livre'
  };
  return map[genero] || '12';
}

function gerarSessoes() {
  const todas = ['13:30','14:30','15:00','16:30','17:15','18:00','19:30','20:00','21:00','22:00','22:45','00:15'];
  const qtd   = 3 + Math.floor(Math.random() * 2);
  const inicio = Math.floor(Math.random() * (todas.length - qtd));
  return todas.slice(inicio, inicio + qtd);
}

function gerarPreco(genero) {
  const map = { 'Ficcao': 30, 'Acao': 28, 'Terror': 24, 'Aventura': 25, 'Drama': 26, 'Comedia': 22 };
  return map[genero] || PRECO_PADRAO;
}

// ================================================
// LOADING E ERRO
// ================================================
function mostrarLoadingFilmes() {
  var grid = document.getElementById('moviesGrid');
  grid.innerHTML = [
    '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;">',
      '<div class="loading-spinner"></div>',
      '<p style="color:#6B7280;margin-top:1rem;font-size:1rem;">Buscando filmes em cartaz...</p>',
    '</div>'
  ].join('');
}

function mostrarErroBuscaFilmes(msg) {
  var grid = document.getElementById('moviesGrid');
  grid.innerHTML = [
    '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;">',
      '<div style="font-size:3rem">🎬</div>',
      '<p style="color:#EF4444;margin:.5rem 0;font-weight:600;">Não foi possível carregar os filmes</p>',
      '<p style="color:#6B7280;font-size:.9rem;margin-bottom:1rem;">' + (msg || 'Erro desconhecido') + '</p>',
      '<p style="color:#6B7280;font-size:.85rem;">Verifique se a <strong>API Key do TMDB</strong> está configurada corretamente em <code>script.js</code></p>',
      '<button class="btn btn--yellow" style="margin-top:1rem" onclick="buscarFilmesEmCartaz()">Tentar Novamente</button>',
    '</div>'
  ].join('');
}

// ================================================
// ATUALIZAR FILTROS COM GÊNEROS REAIS
// ================================================
function atualizarFiltros(filmes) {
  var generosUnicos = ['Todos'];
  filmes.forEach(function(f) {
    if (generosUnicos.indexOf(f.genero) === -1) generosUnicos.push(f.genero);
  });

  var container = document.getElementById('genreFilters');
  var icone     = container.querySelector('svg');
  var label     = container.querySelector('span');

  // Remove botões antigos
  container.querySelectorAll('.filter-btn').forEach(function(b) { b.remove(); });

  generosUnicos.forEach(function(g) {
    var btn = document.createElement('button');
    btn.className  = 'filter-btn' + (g === state.generoAtivo ? ' active' : '');
    btn.dataset.genre = g;
    btn.textContent   = g;
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.generoAtivo = g;
      var filtrados = g === 'Todos' ? state.filmesCarregados
        : state.filmesCarregados.filter(function(f) { return f.genero === g; });
      renderizarFilmes(filtrados);
    });
    container.appendChild(btn);
  });
}

// ================================================
// RENDERIZAR FILMES
// ================================================
function renderizarFilmes(lista) {
  var grid = document.getElementById('moviesGrid');
  if (!lista.length) {
    grid.innerHTML = '<p style="text-align:center;color:#6B7280;grid-column:1/-1">Nenhum filme encontrado.</p>';
    return;
  }
  grid.innerHTML = lista.map(function(f) {
    var sessoesBtns = f.sessoes.map(function(s) {
      return '<button class="session-btn" onclick="abrirAssentos(\'' +
        f.titulo.replace(/'/g, '').replace(/"/g, '') + '\',\'' + s + '\',' + f.preco + ')">' + s + '</button>';
    }).join('');

    return [
      '<div class="movie-card">',
        '<div class="movie-card__img-wrap">',
          '<img src="' + f.imagem_url + '" alt="' + f.titulo + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80\'">',
          '<div class="movie-card__tags">',
            '<span class="tag--genre">' + f.genero + '</span>',
            '<span class="tag--age">' + f.classificacao + '</span>',
          '</div>',
          '<div class="movie-card__rating">&#9733; ' + f.avaliacao + '</div>',
        '</div>',
        '<div class="movie-card__body">',
          '<h3 class="movie-card__title">' + f.titulo + '</h3>',
          '<div class="movie-card__duration">&#9679; ' + f.duracao + '</div>',
          '<p class="movie-card__sessions-label">Horarios disponiveis:</p>',
          '<div class="movie-card__sessions">' + sessoesBtns + '</div>',
          '<div class="movie-card__price">',
            '<small>A partir de</small>',
            '<strong>R$ ' + f.preco.toFixed(2) + '</strong>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }).join('');
}

// ================================================
// RENDERIZAR COMBOS
// ================================================
function renderizarCombos(lista) {
  var grid = document.getElementById('combosGrid');
  grid.innerHTML = lista.map(function(c) {
    return [
      '<div class="combo-card">',
        c.mais_vendido ? '<span class="combo-card__popular">Mais Vendido</span>' : '',
        '<div class="combo-card__img">',
          '<img src="' + c.imagem_url + '" alt="' + c.nome + '">',
        '</div>',
        '<div class="combo-card__body">',
          '<h3 class="combo-card__name">' + c.nome + '</h3>',
          '<p class="combo-card__desc">' + c.descricao + '</p>',
          '<div class="combo-card__footer">',
            '<span class="combo-card__price">R$ ' + parseFloat(c.preco).toFixed(2) + '</span>',
            '<button class="btn btn--yellow" onclick="adicionarCombo(' + c.id + ',\'' + c.nome + '\',\'' + c.descricao + '\',' + c.preco + ')">&#128722; Adicionar</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }).join('');
}

// ================================================
// RENDERIZAR CINEMAS
// ================================================
function renderizarCinemas(lista) {
  var grid = document.getElementById('locationsGrid');
  grid.innerHTML = lista.map(function(c) {
    return [
      '<div class="location-card">',
        '<h3 class="location-card__name">' + c.nome + '</h3>',
        '<div class="location-card__infos">',
          '<div class="location-info">&#128205; ' + c.endereco + '</div>',
          '<div class="location-info">&#128222; ' + c.telefone + '</div>',
          '<div class="location-info">&#128336; ' + c.horario + '</div>',
          '<div class="location-info">&#128663; ' + c.estacionamento + '</div>',
        '</div>',
        '<div class="location-card__footer">',
          '<span class="screens-badge">' + c.salas + ' Salas</span>',
          '<button class="btn btn--yellow" onclick="document.getElementById(\'filmes\').scrollIntoView({behavior:\'smooth\'})">Ver Filmes</button>',
        '</div>',
      '</div>'
    ].join('');
  }).join('');
}

// ================================================
// RENDERIZAR OPCOES DE LOCALIZACAO
// ================================================
function renderizarOpcoesLocalizacao(lista) {
  var el = document.getElementById('locationsList');
  el.innerHTML = lista.map(function(c) {
    var ativo = state.localSelecionado === c.nome ? 'active' : '';
    return [
      '<button class="location-option ' + ativo + '" onclick="selecionarLocal(\'' + c.nome.replace(/'/g, '') + '\')">',
        '<div>',
          '<div class="location-option__name">&#128205; ' + c.nome + '</div>',
          '<div class="location-option__addr">' + c.endereco + '</div>',
          '<span class="location-option__screens">' + c.salas + ' salas</span>',
        '</div>',
        state.localSelecionado === c.nome ? '<span class="check-icon">&#10003;</span>' : '',
      '</button>'
    ].join('');
  }).join('');
}

// ================================================
// INICIO
// ================================================
document.addEventListener('DOMContentLoaded', function() {
  buscarFilmesEmCartaz();   // 🎬 Busca filmes reais do TMDB
  renderizarCombos(combos);
  renderizarCinemas(cinemas);
  renderizarOpcoesLocalizacao(cinemas);
  iniciarEventos();
  adicionarEstiloLoader();
});

// ================================================
// LOADER CSS DINÂMICO
// ================================================
function adicionarEstiloLoader() {
  var style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      width: 48px; height: 48px;
      border: 4px solid #F3F4F6;
      border-top-color: #EAB308;
      border-radius: 50%;
      animation: spin .8s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

// ================================================
// EVENTOS
// ================================================
function iniciarEventos() {
  // Menu mobile
  document.getElementById('btnMenu').addEventListener('click', toggleMenu);

  // Login desktop e mobile
  document.getElementById('btnLogin').addEventListener('click', function() {
    state.usuario ? fazerLogout() : openModal('modalLogin');
  });
  document.getElementById('btnLoginMobile').addEventListener('click', function() {
    state.usuario ? fazerLogout() : openModal('modalLogin');
  });

  // Localização desktop e mobile
  document.getElementById('btnLocation').addEventListener('click', function() {
    openModal('modalLocation');
  });
  document.getElementById('btnLocationMobile').addEventListener('click', function() {
    openModal('modalLocation');
  });

  // Carrinho
  document.getElementById('btnCart').addEventListener('click', function() {
    abrirCarrinho();
  });

  // Formulário login — suporta submit e click direto no botão
  var loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);
  loginForm.querySelector('button[type="submit"]').addEventListener('click', function(e) {
    // Se o form não disparar submit sozinho (ex: Cypress), força manualmente
    if (!e.defaultPrevented) {
      e.preventDefault();
      handleLogin(e);
    }
  });

  // Formulário checkout
  document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
  document.getElementById('btnCloseCheckout').addEventListener('click', function() {
    closeModal('modalCheckout');
  });

  // Confirmar assentos
  document.getElementById('btnConfirmSeats').addEventListener('click', confirmarAssentos);

  // Fechar modal clicando fora
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  });
}

// ================================================
// MENU MOBILE
// ================================================
function toggleMenu() {
  var nav    = document.getElementById('mobileNav');
  var aberto = nav.style.display === 'flex';
  nav.style.display = aberto ? 'none' : 'flex';
  document.getElementById('iconMenu').style.display  = aberto ? 'block' : 'none';
  document.getElementById('iconClose').style.display = aberto ? 'none'  : 'block';
}

// ================================================
// MODAIS
// ================================================
function openModal(id)  { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ================================================
// LOGIN / LOGOUT
// ================================================
function handleLogin(e) {
  e.preventDefault();
  var nome  = document.getElementById('loginName').value.trim();
  var email = document.getElementById('loginEmail').value.trim();
  if (!nome || !email) return;
  state.usuario = { nome: nome, email: email };
  atualizarUILogin();
  closeModal('modalLogin');
}

function fazerLogout() {
  state.usuario = null;
  atualizarUILogin();
}

function atualizarUILogin() {
  var logado = !!state.usuario;
  var texto  = logado ? state.usuario.nome : 'Entrar';
  document.getElementById('loginText').textContent = texto;
  var mobileEl = document.getElementById('loginTextMobile');
  if (mobileEl) mobileEl.textContent = texto;
}

// ================================================
// LOCALIZAÇÃO
// ================================================
function selecionarLocal(nome) {
  state.localSelecionado = nome;
  document.getElementById('locationText').textContent = nome;
  var mobileEl = document.getElementById('locationTextMobile');
  if (mobileEl) mobileEl.textContent = nome;
  renderizarOpcoesLocalizacao(cinemas);
  closeModal('modalLocation');
}

// ================================================
// ASSENTOS
// ================================================
function abrirAssentos(filme, sessao, preco) {
  state.sessaoAtual          = { filme: filme, sessao: sessao, preco: Number(preco) };
  state.assentosSelecionados = [];
  document.getElementById('seatMovieTitle').textContent  = filme;
  document.getElementById('seatSessionInfo').textContent = 'Sessao: ' + sessao;
  renderizarAssentos();
  atualizarInfoAssentos();
  openModal('modalSeats');
}

function renderizarAssentos() {
  var grid = document.getElementById('seatsGrid');
  var rows = ['A','B','C','D','E','F','G','H'];
  grid.innerHTML = rows.map(function(row) {
    var assentos = '';
    for (var i = 1; i <= 12; i++) {
      var id       = row + i;
      var ocupado  = state.assentosOcupados.indexOf(id) > -1;
      var selecion = state.assentosSelecionados.indexOf(id) > -1;
      var classe   = ocupado ? 'seat--occupied' : selecion ? 'seat--selected' : 'seat--available';
      if (ocupado) {
        assentos += '<button class="seat ' + classe + '" disabled title="' + id + '">&#9644;</button>';
      } else {
        assentos += '<button class="seat ' + classe + '" onclick="toggleAssento(\'' + id + '\')" title="' + id + '">&#9644;</button>';
      }
    }
    return '<div class="seats-row"><span class="seats-row__label">' + row + '</span>' + assentos + '</div>';
  }).join('');
}

function toggleAssento(id) {
  var idx = state.assentosSelecionados.indexOf(id);
  if (idx > -1) state.assentosSelecionados.splice(idx, 1);
  else          state.assentosSelecionados.push(id);
  renderizarAssentos();
  atualizarInfoAssentos();
}

function atualizarInfoAssentos() {
  var qtd   = state.assentosSelecionados.length;
  var total = qtd * state.sessaoAtual.preco;
  var btn   = document.getElementById('btnConfirmSeats');
  var info  = document.getElementById('seatsInfo');

  btn.disabled    = qtd === 0;
  btn.textContent = 'Adicionar ao Carrinho (' + qtd + ')';

  if (qtd > 0) {
    info.style.display = 'block';
    document.getElementById('selectedSeatsList').textContent =
      state.assentosSelecionados.slice().sort().join(', ');
    document.getElementById('selectedSeatsTotal').textContent =
      qtd + ' ingresso(s) x R$ ' + state.sessaoAtual.preco.toFixed(2) +
      ' = R$ ' + total.toFixed(2);
  } else {
    info.style.display = 'none';
  }
}

function confirmarAssentos() {
  if (!state.assentosSelecionados.length) return;
  var f     = state.sessaoAtual;
  var total = state.assentosSelecionados.length * f.preco;
  state.carrinho.push({
    id:       'ticket-' + Date.now(),
    tipo:     'ingresso',
    nome:     f.filme,
    detalhes: 'Sessao ' + f.sessao + ' - Assentos: ' + state.assentosSelecionados.slice().sort().join(', '),
    preco:    total,
    qtd:      1
  });
  state.assentosSelecionados = [];
  atualizarBadgeCarrinho();
  closeModal('modalSeats');
  abrirCarrinho();
}

// ================================================
// COMBOS
// ================================================
function adicionarCombo(id, nome, descricao, preco) {
  state.carrinho.push({
    id:       'combo-' + Date.now(),
    tipo:     'combo',
    nome:     nome,
    detalhes: descricao,
    preco:    parseFloat(preco),
    qtd:      1
  });
  atualizarBadgeCarrinho();
  abrirCarrinho();
}

// ================================================
// CARRINHO
// ================================================
function atualizarBadgeCarrinho() {
  var badge = document.getElementById('cartBadge');
  var qtd   = state.carrinho.length;
  badge.textContent   = qtd;
  badge.style.display = qtd > 0 ? 'flex' : 'none';
}

function abrirCarrinho() {
  renderizarCarrinho();
  openModal('modalCart');
}

function renderizarCarrinho() {
  var body   = document.getElementById('cartBody');
  var footer = document.getElementById('cartFooter');

  if (!state.carrinho.length) {
    body.innerHTML = [
      '<div class="cart-empty">',
        '<div style="font-size:3rem">&#128722;</div>',
        '<p style="font-size:1.1rem;margin-top:.5rem;color:#374151">Seu carrinho esta vazio</p>',
        '<p>Adicione ingressos e combos para continuar</p>',
      '</div>'
    ].join('');
    footer.style.display = 'none';
    return;
  }

  var total = state.carrinho.reduce(function(s, i) { return s + i.preco * i.qtd; }, 0);

  body.innerHTML = state.carrinho.map(function(item) {
    var tipoClasse = item.tipo === 'ingresso' ? 'ticket' : 'combo';
    var tipoLabel  = item.tipo === 'ingresso' ? 'Ingresso' : 'Combo';
    return [
      '<div class="cart-item">',
        '<div class="cart-item__info">',
          '<span class="cart-item__type cart-item__type--' + tipoClasse + '">' + tipoLabel + '</span>',
          '<div class="cart-item__name">' + item.nome + '</div>',
          '<div class="cart-item__details">' + item.detalhes + '</div>',
          '<div class="cart-item__price">R$ ' + item.preco.toFixed(2) + '</div>',
        '</div>',
        '<button class="cart-item__remove" onclick="removerDoCarrinho(\'' + item.id + '\')">&#128465;</button>',
      '</div>'
    ].join('');
  }).join('');

  document.getElementById('cartTotal').textContent = 'R$ ' + total.toFixed(2);
  footer.style.display = 'block';
}

function removerDoCarrinho(id) {
  state.carrinho = state.carrinho.filter(function(i) { return i.id !== id; });
  atualizarBadgeCarrinho();
  renderizarCarrinho();
}

// ================================================
// CHECKOUT
// ================================================
function openCheckout() {
  var total = state.carrinho.reduce(function(s, i) { return s + i.preco * i.qtd; }, 0);
  document.getElementById('checkoutTotal').textContent = 'R$ ' + total.toFixed(2);
  closeModal('modalCart');
  openModal('modalCheckout');
}

function handleCheckout(e) {
  e.preventDefault();
  var btn = document.getElementById('btnPagar');
  btn.disabled    = true;
  btn.textContent = 'Processando...';

  setTimeout(function() {
    var codigo = 'CXM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    var el = document.getElementById('reservationCode');
    if (el) el.textContent = codigo;
    btn.disabled    = false;
    btn.textContent = 'Confirmar Pagamento';
    closeModal('modalCheckout');
    var modalSuccess = document.getElementById('modalSuccess');
    if (modalSuccess) {
      openModal('modalSuccess');
      setTimeout(function() { closeModal('modalSuccess'); }, 5000);
    }
    state.carrinho = [];
    atualizarBadgeCarrinho();
  }, 2000);
}