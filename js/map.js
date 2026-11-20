/* ============================================================
 * FAROL: Camada de mapa (Leaflet + tiles OpenStreetMap)
 * Depende de: Leaflet (CDN), js/data.js e js/app.js (Farol).
 * Nenhuma chave de API é necessária.
 * ============================================================ */

const FarolMap = (function () {
  const URL_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const ATRIBUICAO =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  const ROTULO_PERIODO = { agora: 'agora', noite: 'à noite', madrugada: 'na madrugada' };
  const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving/';
  const CACHE_ROTAS = {};

  /* Cria um mapa com o estilo padrão do app. */
  function criarMapa(el, opts) {
    opts = opts || {};
    const mapa = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: opts.scrollWheelZoom === true,
      dragging: opts.dragging !== false,
      zoomSnap: 0.5,
    });
    L.tileLayer(URL_TILES, { attribution: ATRIBUICAO, maxZoom: 19 }).addTo(mapa);

    if (opts.centro) {
      mapa.setView(opts.centro, opts.zoom || 15);
    } else if (opts.pontos && opts.pontos.length) {
      const b = L.latLngBounds(opts.pontos);
      mapa.fitBounds(b, { padding: opts.padding || [24, 24], maxZoom: opts.maxZoom || 15 });
    } else {
      mapa.setView([REFERENCIA_BAIRRO.lat, REFERENCIA_BAIRRO.lng], 14);
    }

    if (opts.zoomControl) {
      L.control.zoom({ position: opts.zoomPosition || 'topright' }).addTo(mapa);
    }

    /* O contêiner também muda com fontes, controles e grids, sem resize da janela. */
    let resizeFrame = null;
    function atualizarTamanho() {
      if (resizeFrame !== null) return;
      resizeFrame = requestAnimationFrame(function () {
        resizeFrame = null;
        mapa.invalidateSize({ animate: false });
      });
    }
    const observador = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(atualizarTamanho) : null;
    if (observador) observador.observe(el);
    else window.addEventListener('resize', atualizarTamanho);
    mapa.on('unload', function () {
      if (observador) observador.disconnect();
      else window.removeEventListener('resize', atualizarTamanho);
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    });
    return mapa;
  }

  /* Ícone circular colorido por categoria, com SVG branco. */
  function iconeOcorrencia(categoria, ativa) {
    const cat = CATEGORIAS[categoria] || CATEGORIAS.buraco;
    return L.divIcon({
      className: 'farol-marker',
      html:
        '<span class="farol-marker-pin' + (ativa === false ? ' inativo' : '') + '" style="--cor-cat:' + cat.cor + '">' +
        Farol.iconeSVG(categoria) +
        '</span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -20],
    });
  }

  function popupOcorrencia(o) {
    const cat = CATEGORIAS[o.categoria] || CATEGORIAS.buraco;
    const f = Farol.riscoFaixa(o.indiceRisco);
    return (
      '<div class="popup-oc">' +
        '<div class="popup-oc-topo">' +
          '<span class="badge badge-cat" style="--cor-cat:' + cat.cor + '"><i></i>' + cat.label + '</span>' +
          '<span class="pill-risco faixa-' + f.classe + '">Risco ' + o.indiceRisco + '</span>' +
        '</div>' +
        '<h3>' + Farol.esc(o.titulo) + '</h3>' +
        '<p>' + Farol.esc(o.enderecoAproximado) + '</p>' +
        '<a class="btn btn-sm btn-primario btn-bloco" href="detalhe.html?id=' + encodeURIComponent(o.id) + '">Ver detalhes</a>' +
      '</div>'
    );
  }

  /* Adiciona os marcadores das ocorrências; devolve a lista para remoção. */
  function adicionarOcorrencias(mapa, lista) {
    const marcadores = [];
    lista.forEach(function (o) {
      const m = L.marker([o.lat, o.lng], { icon: iconeOcorrencia(o.categoria) })
        .addTo(mapa)
        .bindPopup(popupOcorrencia(o), { maxWidth: 250 });
      marcadores.push(m);
    });
    return marcadores;
  }

  /* Círculos semitransparentes dos trechos críticos (âmbar/vermelho). */
  function adicionarTrechos(mapa, trechos, periodo) {
    periodo = periodo || 'agora';
    const camadas = [];
    trechos.forEach(function (t) {
      const risco = t.risco[periodo] !== undefined ? t.risco[periodo] : t.risco.agora;
      if (risco < 60) return; // só destaca trechos críticos
      const cor = risco >= 80 ? '#E11D48' : '#F59E0B';
      const c = L.circle([t.lat, t.lng], {
        radius: t.raio || 120,
        color: cor,
        weight: 2,
        fillColor: cor,
        fillOpacity: 0.16,
      }).addTo(mapa);
      c.bindPopup(
        '<div class="popup-trecho"><strong>' + Farol.esc(t.nome) + '</strong><br>' +
        'Risco <b style="color:' + cor + '">' + risco + '</b> ' + ROTULO_PERIODO[periodo] + '<br>' +
        '<small>Período mais crítico: ' + t.horarioPico.toLowerCase() + '</small></div>'
      );
      camadas.push(c);
    });
    return camadas;
  }

  /* Polilinha de rota. */
  function desenharRota(mapa, pontos, opcoes) {
    opcoes = opcoes || {};
    return L.polyline(pontos, {
      color: opcoes.cor || '#64748B',
      weight: opcoes.ativa ? 5 : 3,
      opacity: opcoes.ativa ? 0.95 : 0.5,
      dashArray: opcoes.ativa ? null : '2 10',
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(mapa);
  }

  /* Pontos de origem e destino da rota. */
  function pinInicioFim(mapa, inicio, fim) {
    L.marker([inicio.lat, inicio.lng], {
      icon: L.divIcon({
        className: 'farol-marker',
        html: '<span class="ponto-rota ponto-inicio"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(mapa).bindTooltip('Início: ' + inicio.label, { direction: 'top', offset: [0, -6] });

    L.marker([fim.lat, fim.lng], {
      icon: L.divIcon({
        className: 'farol-marker',
        html: '<span class="ponto-rota ponto-fim"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(mapa).bindTooltip('Destino: ' + fim.label, { direction: 'top', offset: [0, -6] });
  }

  /* Pin simples e arrastável (usado no wizard de registro). */
  function criarPinArrastavel(mapa, lat, lng) {
    return L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'farol-marker',
        html: '<span class="farol-marker-pin" style="--cor-cat:' + CATEGORIAS.buraco.cor + '">' +
              Farol.iconeSVG('buraco') + '</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      }),
      draggable: true,
    }).addTo(mapa);
  }

  function enquadrar(mapa, pontos, padding, maxZoom) {
    if (!pontos || !pontos.length) return;
    mapa.fitBounds(L.latLngBounds(pontos), {
      padding: padding || [30, 30],
      maxZoom: maxZoom || 15,
    });
  }

  /* ---------- Rotas reais (OSRM público, sem chave) ---------- */

  function coordenada(p) {
    if (Array.isArray(p)) return { lat: p[0], lng: p[1] };
    return { lat: p.lat, lng: p.lng };
  }

  /* Distância em metros entre um ponto e um segmento (fórmula do enunciado). */
  function distanciaPontoSegmento(p, a, b) {
    const R = 6371000;
    const rad = function (d) { return (d * Math.PI) / 180; };
    const cos = Math.cos(rad((a.lat + b.lat) / 2));
    const x = (p.lng - a.lng) * cos;
    const y = p.lat - a.lat;
    const dx = (b.lng - a.lng) * cos;
    const dy = b.lat - a.lat;
    const t = Math.max(0, Math.min(1, (x * dx + y * dy) / (dx * dx + dy * dy || 1)));
    const px = x - t * dx;
    const py = y - t * dy;
    return Math.sqrt(px * px + py * py) * rad(1) * R;
  }

  /* Risco 0 a 100 de uma rota: soma ponderada dos trechos a menos de 80 m. */
  function riscoRota(pontos, trechos, periodo) {
    if (!pontos || pontos.length < 2 || !trechos || !trechos.length) return 0;
    const segmentos = pontos.map(coordenada);
    let soma = 0;
    trechos.forEach(function (t) {
      let menor = Infinity;
      for (let i = 0; i < segmentos.length - 1; i++) {
        const d = distanciaPontoSegmento(
          { lat: t.lat, lng: t.lng },
          segmentos[i],
          segmentos[i + 1]
        );
        if (d < menor) menor = d;
      }
      if (menor <= 80) {
        const valor = t.risco && t.risco[periodo] !== undefined
          ? t.risco[periodo]
          : (t.risco ? t.risco.agora : 0);
        soma += valor * (1 - menor / 80);
      }
    });
    return Math.max(0, Math.min(100, Math.round(soma)));
  }

  /* Consulta o OSRM com timeout de 8 s e cache em memória por origem/destino. */
  async function calcularRotas(origem, destino) {
    const a = coordenada(origem);
    const b = coordenada(destino);
    const chave = a.lng + ',' + a.lat + ';' + b.lng + ',' + b.lat;
    if (CACHE_ROTAS[chave]) return CACHE_ROTAS[chave];

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 8000);
    const url = OSRM_BASE + a.lng + ',' + a.lat + ';' + b.lng + ',' + b.lat +
      '?alternatives=true&overview=full&geometries=geojson';

    try {
      const resposta = await fetch(url, { signal: controller.signal });
      if (!resposta.ok) throw new Error('OSRM respondeu ' + resposta.status);
      const dados = await resposta.json();
      if (!dados.routes || !dados.routes.length) throw new Error('OSRM sem rotas');

      const rotas = dados.routes.slice(0, 3).map(function (r) {
        return {
          pontos: r.geometry.coordinates.map(function (c) { return [c[1], c[0]]; }),
          distanciaKm: Math.round((r.distance / 1000) * 10) / 10,
          tempoMin: Math.max(1, Math.round(r.duration / 60)),
          duration: r.duration,
          risco: {},
        };
      });
      CACHE_ROTAS[chave] = rotas;
      return rotas;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    criarMapa: criarMapa,
    iconeOcorrencia: iconeOcorrencia,
    adicionarOcorrencias: adicionarOcorrencias,
    adicionarTrechos: adicionarTrechos,
    desenharRota: desenharRota,
    pinInicioFim: pinInicioFim,
    criarPinArrastavel: criarPinArrastavel,
    enquadrar: enquadrar,
    calcularRotas: calcularRotas,
    distanciaPontoSegmento: distanciaPontoSegmento,
    riscoRota: riscoRota,
    ROTULO_PERIODO: ROTULO_PERIODO,
  };
})();

/* Expõe para scripts carregados sob demanda (wizard em qualquer página). */
window.FarolMap = FarolMap;
