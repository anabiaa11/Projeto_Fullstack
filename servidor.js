// ================================================
// SERVIDOR LOCAL CINEMAX
// Execute: node servidor.js
// Acesse:  http://localhost:3000
// ================================================

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 5252;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml'
};

http.createServer(function(req, res) {

  // ── PROXY TMDB ──────────────────────────────────────────────────────────
  // O browser bloqueia HTTP → HTTPS, então o Node faz a chamada por nós
  if (req.url.startsWith('/tmdb/')) {
    var tmdbPath = req.url.replace('/tmdb', '');          // /movie/now_playing?...
    var options  = {
      hostname: 'api.themoviedb.org',
      path:     '/3' + tmdbPath,
      method:   'GET',
      headers:  { 'Accept': 'application/json' }
    };
    var proxyReq = https.request(options, function(proxyRes) {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', function(e) {
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'Proxy error: ' + e.message }));
    });
    proxyReq.end();
    return;
  }
  // ────────────────────────────────────────────────────────────────────────

  // Limpa a URL de parâmetros como ?#cinemas e remove o prefixo da pasta
  let urlLimpa = req.url.split('?')[0].split('#')[0];
  
  if (urlLimpa.startsWith('/projetofullstack/')) {
    urlLimpa = urlLimpa.replace('/projetofullstack/', '/');
  }

  var reqPath = urlLimpa === '/' ? '/index.html' : urlLimpa;
  var filePath = path.join(__dirname, reqPath);
  var ext  = path.extname(filePath);
  var mime = MIME[ext] || 'text/plain';

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end('Erro: Ficheiro nao encontrado no caminho: ' + reqPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });

}).listen(PORT, function() {
  console.log('🎬 CineMax Ativo!');
  console.log('👉 Tente agora: http://localhost:5252/projetofullstack/');
});