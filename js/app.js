/* ============================================================
 * FAROL: Helpers compartilhados do app (sem dependências)
 * Persistência em localStorage com fallback em memória,
 * formatação pt-BR, ícones SVG por categoria, toast, etc.
 * ============================================================ */

(function (global) {
  'use strict';

  var LS_CHAVES = {
    ocorrencias: 'farol_ocorrencias',
    confirmadas: 'farol_confirmadas',
    status: 'farol_status',
    trechos: 'farol_trechos_status',
  };

  function lerLS(chave, padrao) {
    try {
      var v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch (e) {
      return padrao;
    }
  }

  function gravarLS(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  var ROTULO_STATUS = {
    'aberta': 'Aberta',
    'em-analise': 'Em análise',
    'encaminhada': 'Encaminhada',
    'resolvida': 'Resolvida',
  };

  /* Escapa HTML (conteúdo do usuário entra em templates) */
  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Faixa do índice de risco 0 a 100 */
  function riscoFaixa(v) {
    if (v <= 30) return { classe: 'baixa', label: 'Baixo', cor: '#22C55E' };
    if (v <= 60) return { classe: 'media', label: 'Médio', cor: '#F59E0B' };
    return { classe: 'alta', label: 'Alto', cor: '#E11D48' };
  }

  /* Ícone (Material Symbols Rounded) de cada categoria. Usado em
   * marcadores, listas e no wizard. */
  function iconeSVG(categoria) {
    var nomes = {
      buraco: 'warning',
      iluminacao: 'lightbulb',
      semaforo: 'traffic',
      calcada: 'accessible',
      ciclovia: 'pedal_bike',
      lixo: 'delete',
      sinalizacao: 'signpost',
    };
    return '<span class="material-symbols-rounded" aria-hidden="true">' + (nomes[categoria] || 'warning') + '</span>';
  }

  /* Logo do Farol (farol/feixe de luz) em SVG */
  function logoSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/>' +
      '<path d="M4.9 4.9l2.1 2.1"/><path d="M17 17l2.1 2.1"/><path d="M19.1 4.9L17 7"/><path d="M7 17l-2.1 2.1"/>' +
      '<circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>' +
      '</svg>';
  }

  /* Tempo relativo: "há 20 min", "há 3 h", "ontem", "há 2 dias" */
  function tempoRelativo(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    var min = Math.floor(diff / 60000);
    if (min < 1) return 'agora mesmo';
    if (min < 60) return 'há ' + min + ' min';
    var h = Math.floor(min / 60);
    if (h < 24) return 'há ' + h + ' h';
    var d = Math.floor(h / 24);
    if (d === 1) return 'ontem';
    return 'há ' + d + ' dias';
  }

  function formataDataHora(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formataHora(iso) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /* Distância em km (haversine): filtro de raio dos alertas */
  function distanciaKm(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLng = (b.lng - a.lng) * Math.PI / 180;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  /* ------------------------------------------------------------
   * Dados: base (data.js) + persistência local
   * ------------------------------------------------------------ */
  function ocorrencias() {
    var locais = lerLS(LS_CHAVES.ocorrencias, []);
    var confirmadas = {};
    (lerLS(LS_CHAVES.confirmadas, [])).forEach(function (id) { confirmadas[id] = true; });
    var statusMap = lerLS(LS_CHAVES.status, {});

    var base = OCORRENCIAS.map(function (o) {
      var c = Object.assign({}, o);
      if (confirmadas[o.id]) c.confirmacoes = o.confirmacoes + 1;
      if (statusMap[o.id]) c.status = statusMap[o.id];
      return c;
    });
    return locais.concat(base);
  }

  function trechos() {
    var statusMap = lerLS(LS_CHAVES.trechos, {});
    return TRECHOS.map(function (t) {
      var c = Object.assign({}, t);
      if (statusMap[t.id]) c.status = statusMap[t.id];
      return c;
    });
  }

  function salvarOcorrencia(dados) {
    var lista = lerLS(LS_CHAVES.ocorrencias, []);
    var o = {
      id: 'local-' + Date.now(),
      categoria: dados.categoria,
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      lat: dados.lat,
      lng: dados.lng,
      enderecoAproximado: dados.enderecoAproximado,
      dataHora: new Date().toISOString(),
      status: 'aberta',
      confirmacoes: 0,
      indiceRisco: dados.indiceRisco,
      foto: dados.foto || 'https://picsum.photos/seed/farol-' + Date.now() + '/720/480',
    };
    lista.unshift(o);
    if (!gravarLS(LS_CHAVES.ocorrencias, lista)) {
      toast('Não foi possível salvar no dispositivo (memória cheia?).', 'info');
    }
    return o;
  }

  /* Confirmação de uma ocorrência (uma vez por dispositivo) */
  function confirmar(id) {
    var lista = lerLS(LS_CHAVES.confirmadas, []);
    var o = ocorrencias().find(function (x) { return x.id === id; });
    if (!o) return { jaConfirmada: true, total: 0 };
    if (lista.indexOf(id) !== -1) return { jaConfirmada: true, total: o.confirmacoes };
    lista.push(id);
    gravarLS(LS_CHAVES.confirmadas, lista);
    return { jaConfirmada: false, total: o.confirmacoes + 1 };
  }

  function setStatusOcorrencia(id, status) {
    var mapaStatus = lerLS(LS_CHAVES.status, {});
    mapaStatus[id] = status;
    gravarLS(LS_CHAVES.status, mapaStatus);
  }

  /* Já confirmada por este dispositivo? */
  function jaConfirmou(id) {
    return lerLS(LS_CHAVES.confirmadas, []).indexOf(id) !== -1;
  }

  function setStatusTrecho(id, status) {
    var mapaStatus = lerLS(LS_CHAVES.trechos, {});
    mapaStatus[id] = status;
    gravarLS(LS_CHAVES.trechos, mapaStatus);
  }

  /* ------------------------------------------------------------
   * Toast
   * ------------------------------------------------------------ */
  var ICONE_OK = '<span class="material-symbols-rounded" aria-hidden="true">check</span>';
  var ICONE_INFO = '<span class="material-symbols-rounded" aria-hidden="true">info</span>';

  var toastTimer = null;
  function toast(msg, tipo) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.innerHTML = (tipo === 'info' ? ICONE_INFO : ICONE_OK) + '<span>' + esc(msg) + '</span>';
    el.classList.add('toast-visivel');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('toast-visivel');
    }, 2600);
  }

  /* Fallback de imagem (placeholder cinza) caso a foto não carregue */
  var FOTO_FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480">' +
    '<rect width="100%" height="100%" fill="#E3E8E5"/>' +
    '<text x="50%" y="50%" font-family="Arial, sans-serif" font-size="26" fill="#5B6B66" text-anchor="middle">Foto ilustrativa</text>' +
    '</svg>'
  );
  function aplicarFallbackFoto(img) {
    img.addEventListener('error', function () {
      img.onerror = null;
      img.src = FOTO_FALLBACK;
    });
  }

  var Farol = {
    CATEGORIAS: CATEGORIAS,
    ANALISE_IA: ANALISE_IA,
    ORDEM_CATEGORIAS: ORDEM_CATEGORIAS,
    REFERENCIA_BAIRRO: REFERENCIA_BAIRRO,
    ROTULO_STATUS: ROTULO_STATUS,
    FOTO_FALLBACK: FOTO_FALLBACK,
    esc: esc,
    riscoFaixa: riscoFaixa,
    iconeSVG: iconeSVG,
    logoSVG: logoSVG,
    tempoRelativo: tempoRelativo,
    formataDataHora: formataDataHora,
    formataHora: formataHora,
    distanciaKm: distanciaKm,
    ocorrencias: ocorrencias,
    trechos: trechos,
    salvarOcorrencia: salvarOcorrencia,
    confirmar: confirmar,
    jaConfirmou: jaConfirmou,
    setStatusOcorrencia: setStatusOcorrencia,
    setStatusTrecho: setStatusTrecho,
    toast: toast,
    aplicarFallbackFoto: aplicarFallbackFoto,
  };

  global.Farol = Farol;

})(window);
