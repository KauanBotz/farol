/* ============================================================
 * FAROL: wizard de registro em modal, injetado em qualquer página
 * - Abre sobre qualquer página (botão "Registrar" da navbar).
 * - Em registrar.html o modal abre sozinho; fechar volta ao mapa.
 * - Leaflet e js/map.js são carregados sob demanda para páginas
 *   que não têm mapa.
 * ============================================================ */

(function (global) {
  'use strict';

  function construirModal() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-registro';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
        '<header class="modal-header">' +
          '<div>' +
            '<h2 id="modal-titulo">Nova ocorrência</h2>' +
            '<p class="modal-progresso">Passo <span id="num-passo">1</span> de 4</p>' +
          '</div>' +
          '<button class="modal-fechar" type="button" aria-label="Fechar registro">' +
            '<span class="material-symbols-rounded" aria-hidden="true">close</span>' +
          '</button>' +
        '</header>' +
        '<div class="barra-progresso" aria-hidden="true"><span id="barra" style="width:25%"></span></div>' +
        '<div class="modal-corpo" id="modal-corpo">' +
          '<section class="passo ativo" id="passo1">' +
            '<h2 tabindex="-1" id="titulo-passo1">O que você viu?</h2>' +
            '<p class="passo-sub">Escolha a categoria que melhor descreve o problema.</p>' +
            '<div class="grade-categorias" id="gradeCategorias"></div>' +
          '</section>' +
          '<section class="passo" id="passo2">' +
            '<h2 tabindex="-1" id="titulo-passo2">Tire uma foto</h2>' +
            '<p class="passo-sub">A foto ajuda a IA a confirmar a categoria e o risco.</p>' +
            '<label class="upload" id="areaUpload" for="inputFoto">' +
              '<span class="material-symbols-rounded" aria-hidden="true">photo_camera</span>' +
              '<strong>Toque para tirar ou escolher uma foto</strong>' +
              '<span>JPG ou PNG, máx. 8 MB</span>' +
            '</label>' +
            '<input type="file" id="inputFoto" accept="image/*" hidden>' +
            '<div class="previa-foto" id="previaFoto" hidden>' +
              '<img id="imgPrevia" alt="Prévia da foto da ocorrência">' +
              '<div class="previa-acoes">' +
                '<button class="btn btn-fantasma btn-sm" type="button" id="btTrocarFoto"><span class="material-symbols-rounded" aria-hidden="true">image</span> Trocar</button>' +
                '<button class="btn btn-fantasma btn-sm" type="button" id="btRemoverFoto"><span class="material-symbols-rounded" aria-hidden="true">close</span> Remover</button>' +
              '</div>' +
            '</div>' +
            '<p class="texto-2" style="font-size:13px">Sem foto agora? Sem problema: usamos uma imagem de exemplo e você continua o registro.</p>' +
          '</section>' +
          '<section class="passo" id="passo3">' +
            '<h2 tabindex="-1" id="titulo-passo3">Onde aconteceu?</h2>' +
            '<p class="passo-sub">Arraste o pino ou clique no mapa para ajustar o local.</p>' +
            '<div class="mini-mapa" id="mapaRegistro"></div>' +
            '<p class="coord-label" id="coordLabel">…</p>' +
            '<label class="campo">' +
              '<span>Ponto de referência (opcional)</span>' +
              '<input class="input" id="campoReferencia" type="text" placeholder="Ex.: Av. das Palmeiras, próximo ao nº 120">' +
            '</label>' +
          '</section>' +
          '<section class="passo" id="passo4">' +
            '<h2 tabindex="-1" id="titulo-passo4">Confira e envie</h2>' +
            '<p class="passo-sub">Revise os dados antes de enviar o registro.</p>' +
            '<div class="cartao revisao-resumo">' +
              '<img class="revisao-foto" id="revFoto" alt="Foto da ocorrência">' +
              '<div class="revisao-linhas">' +
                '<div><span class="material-symbols-rounded" aria-hidden="true">tag</span><span id="revCategoria">…</span></div>' +
                '<div><span class="material-symbols-rounded" aria-hidden="true">location_on</span><span id="revEndereco">…</span></div>' +
                '<div><span class="material-symbols-rounded" aria-hidden="true">schedule</span><span id="revHorario">…</span></div>' +
                '<div><span class="material-symbols-rounded" aria-hidden="true">speed</span><span>Risco estimado pela IA: <b id="revRisco">…</b></span></div>' +
              '</div>' +
            '</div>' +
            '<label class="campo">' +
              '<span>Descrição curta (opcional)</span>' +
              '<textarea class="textarea" id="campoDescricao" placeholder="Conte o que você viu: tamanho, perigo, há quanto tempo…"></textarea>' +
            '</label>' +
          '</section>' +
          '<section class="passo sucesso" id="sucesso">' +
            '<h2 tabindex="-1" id="titulo-sucesso">Registro enviado!</h2>' +
            '<div><span class="sucesso-check" aria-hidden="true"><span class="material-symbols-rounded">check</span></span></div>' +
            '<p class="sucesso-sub">Obrigado por contribuir com um bairro mais seguro.</p>' +
            '<div class="cartao cartao-ia" aria-live="polite">' +
              '<div class="cartao-ia-topo">' +
                '<span class="ia-titulo"><span class="material-symbols-rounded" aria-hidden="true">auto_awesome</span> Análise da IA</span>' +
                '<span class="ia-status" id="iaStatus">Analisando…</span>' +
              '</div>' +
              '<div class="ia-carregando" id="iaCarregando">' +
                '<span class="spinner" aria-hidden="true"></span>' +
                '<p>Analisando a imagem…</p>' +
              '</div>' +
              '<div class="ia-resultado" id="iaResultado" hidden>' +
                '<p class="ia-resumo" id="iaResumo">…</p>' +
                '<div class="ia-linha">' +
                  '<span>Confiança</span>' +
                  '<span class="barra-confianca"><i id="iaConfiancaBarra" style="width:0%"></i></span>' +
                  '<b id="iaConfiancaTxt">…</b>' +
                '</div>' +
                '<div class="ia-linha">' +
                  '<span>Risco do trecho</span>' +
                  '<span></span>' +
                  '<b><span class="pill-risco" id="iaRisco">…</span></b>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="sucesso-acoes">' +
              '<a class="btn btn-primario" href="index.html" id="btVerMapa"><span class="material-symbols-rounded" aria-hidden="true">map</span> Ver no mapa</a>' +
              '<a class="btn btn-fantasma" href="detalhe.html" id="btVerDetalhes">Ver detalhes da ocorrência</a>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="modal-confirma" id="modal-confirma" hidden>' +
          '<span class="material-symbols-rounded" aria-hidden="true">warning</span>' +
          '<p>Há dados preenchidos. Fechar e descartar este registro?</p>' +
          '<div class="modal-confirma-acoes">' +
            '<button class="btn btn-fantasma btn-sm" type="button" id="btManter">Manter registro</button>' +
            '<button class="btn btn-primario btn-sm" type="button" id="btDescartar">Descartar e fechar</button>' +
          '</div>' +
        '</div>' +
        '<footer class="modal-rodape" id="modal-rodape">' +
          '<button type="button" class="btn btn-fantasma" id="btn-voltar" hidden><span class="material-symbols-rounded" aria-hidden="true">arrow_back</span> Voltar</button>' +
          '<span style="flex:1"></span>' +
          '<button type="button" class="btn btn-primario" id="btn-continuar">Continuar</button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  /* Carrega Leaflet e js/map.js sob demanda (páginas sem mapa) */
  function garantirMapa() {
    return new Promise(function (resolve) {
      if (global.L && global.FarolMap) return resolve();
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      var s1 = document.createElement('script');
      s1.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s1.onload = function () {
        if (global.FarolMap) return resolve();
        var s2 = document.createElement('script');
        s2.src = 'js/map.js?v=farol-final-2';
        s2.onload = resolve;
        document.head.appendChild(s2);
      };
      s1.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      s1.crossOrigin = 'anonymous';
      document.head.appendChild(s1);
    });
  }

  /* Aceita /registrar, /registrar.html e /registrar/ (servidor com URL limpa). */
  function estaEmRegistrar() {
    return /(^|\/)registrar(\.html)?\/?$/.test(global.location.pathname);
  }

  function iniciar() {
    construirModal();

    var estado = {
      passo: 1,
      categoria: null,
      foto: null,
      lat: global.Farol.REFERENCIA_BAIRRO.lat,
      lng: global.Farol.REFERENCIA_BAIRRO.lng,
    };
    var dados = estado;
    var passosEls = [1, 2, 3, 4].map(function (n) { return document.getElementById('passo' + n); });
    var titulosEls = [1, 2, 3, 4].map(function (n) { return document.getElementById('titulo-passo' + n); });
    var sucessoEl = document.getElementById('sucesso');
    var overlay = document.getElementById('modal-registro');
    var corpo = document.getElementById('modal-corpo');
    var rodape = document.getElementById('modal-rodape');
    var btContinuar = document.getElementById('btn-continuar');
    var btVoltar = document.getElementById('btn-voltar');
    var barra = document.getElementById('barra');
    var passoAtual = 1;
    var concluido = false;
    var mapaRegistro = null;
    var pinRegistro = null;
    var mapaIniciado = false;

    /* Passo 1: categorias */
    var grade = document.getElementById('gradeCategorias');
    global.Farol.ORDEM_CATEGORIAS.forEach(function (key) {
      var cat = global.Farol.CATEGORIAS[key];
      var bt = document.createElement('button');
      bt.type = 'button';
      bt.className = 'categoria-card';
      bt.style.setProperty('--cor-cat', cat.cor);
      bt.innerHTML =
        '<span class="check-sel"><span class="material-symbols-rounded" aria-hidden="true">check</span></span>' +
        '<span class="icone-cat">' + global.Farol.iconeSVG(key) + '</span>' +
        '<span>' + cat.label + '</span>';
      bt.addEventListener('click', function () {
        dados.categoria = key;
        grade.querySelectorAll('.categoria-card').forEach(function (c) { c.classList.remove('sel'); });
        bt.classList.add('sel');
        atualizarHabilitacao();
      });
      grade.appendChild(bt);
    });

    /* Passo 2: foto */
    var inputFoto = document.getElementById('inputFoto');
    var areaUpload = document.getElementById('areaUpload');
    var previaFoto = document.getElementById('previaFoto');
    var imgPrevia = document.getElementById('imgPrevia');

    function aplicarFoto(dataURL) {
      dados.foto = dataURL;
      imgPrevia.src = dataURL;
      areaUpload.hidden = true;
      previaFoto.hidden = false;
    }
    function removerFoto() {
      dados.foto = null;
      inputFoto.value = '';
      areaUpload.hidden = false;
      previaFoto.hidden = true;
    }
    inputFoto.addEventListener('change', function () {
      var arquivo = inputFoto.files && inputFoto.files[0];
      if (!arquivo) return;
      if (arquivo.size > 8 * 1024 * 1024) {
        global.Farol.toast('Imagem muito grande (máx. 8 MB).', 'info');
        inputFoto.value = '';
        return;
      }
      var leitor = new FileReader();
      leitor.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var escala = Math.min(1, 900 / Math.max(img.width, img.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          aplicarFoto(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = function () { global.Farol.toast('Não foi possível ler a imagem.', 'info'); };
        img.src = e.target.result;
      };
      leitor.readAsDataURL(arquivo);
    });
    document.getElementById('btTrocarFoto').addEventListener('click', function () { inputFoto.click(); });
    document.getElementById('btRemoverFoto').addEventListener('click', removerFoto);

    /* Passo 3: mapa (Leaflet sob demanda) */
    function iniciarMapaRegistro() {
      if (mapaIniciado) return;
      mapaIniciado = true;
      garantirMapa().then(function () {
        mapaRegistro = global.FarolMap.criarMapa(document.getElementById('mapaRegistro'), {
          centro: [dados.lat, dados.lng],
          zoom: 15,
          dragging: false,
        });
        pinRegistro = global.FarolMap.criarPinArrastavel(mapaRegistro, dados.lat, dados.lng);
        pinRegistro.on('dragend', function () {
          var p = pinRegistro.getLatLng();
          dados.lat = p.lat;
          dados.lng = p.lng;
          atualizarCoord();
        });
        mapaRegistro.on('click', function (e) {
          pinRegistro.setLatLng(e.latlng);
          dados.lat = e.latlng.lat;
          dados.lng = e.latlng.lng;
          atualizarCoord();
        });
        atualizarCoord();
        setTimeout(function () { if (mapaRegistro) mapaRegistro.invalidateSize(); }, 100);
      });
    }
    function atualizarCoord() {
      document.getElementById('coordLabel').textContent =
        'Lat ' + dados.lat.toFixed(4) + ', Lng ' + dados.lng.toFixed(4);
    }

    /* Passo 4: revisão */
    function preencherRevisao() {
      var cat = global.Farol.CATEGORIAS[dados.categoria];
      var ref = document.getElementById('campoReferencia').value.trim();
      document.getElementById('revFoto').src = dados.foto || 'https://picsum.photos/seed/farol-nova/720/480';
      document.getElementById('revCategoria').textContent = cat.label;
      document.getElementById('revEndereco').textContent = ref || 'Jardim das Flores (coordenadas informadas)';
      document.getElementById('revHorario').textContent = 'Agora às ' + global.Farol.formataHora(new Date().toISOString());
      var risco = global.Farol.ANALISE_IA[dados.categoria].risco;
      var f = global.Farol.riscoFaixa(risco);
      var el = document.getElementById('revRisco');
      el.textContent = f.label.toLowerCase() + ' (' + risco + ')';
      el.style.color = f.cor;
    }

    /* Navegação */
    function temDadosPreenchidos() {
      return !!(dados.categoria || dados.foto ||
        document.getElementById('campoReferencia').value.trim() ||
        document.getElementById('campoDescricao').value.trim());
    }
    function atualizarHabilitacao() {
      btContinuar.disabled = passoAtual === 1 && !dados.categoria;
    }
    function irPara(n) {
      passoAtual = n;
      passosEls.forEach(function (el, i) {
        var visivel = i + 1 === n;
        el.classList.toggle('ativo', visivel);
        if (visivel) {
          el.classList.add('entrando');
          el.addEventListener('animationend', function fim() {
            el.classList.remove('entrando');
            el.removeEventListener('animationend', fim);
          }, { once: true });
        }
      });
      sucessoEl.classList.remove('ativo');
      document.getElementById('num-passo').textContent = n;
      barra.style.width = (n / 4 * 100) + '%';
      document.getElementById('modal-titulo').textContent = 'Nova ocorrência';
      btVoltar.hidden = n === 1;
      btContinuar.innerHTML = n === 4
        ? '<span class="material-symbols-rounded" aria-hidden="true">send</span> Enviar registro'
        : 'Continuar';
      rodape.classList.remove('invisivel');
      atualizarHabilitacao();
      corpo.scrollTop = 0;
      if (n === 3) iniciarMapaRegistro();
      if (n === 4) preencherRevisao();
      var titulo = titulosEls[n - 1];
      if (titulo) setTimeout(function () { titulo.focus({ preventScroll: true }); }, 60);
    }

    btContinuar.addEventListener('click', function () {
      if (passoAtual === 1) {
        if (!dados.categoria) return;
        irPara(2);
      } else if (passoAtual === 2) {
        irPara(3);
      } else if (passoAtual === 3) {
        irPara(4);
      } else {
        enviarRegistro();
      }
    });
    btVoltar.addEventListener('click', function () {
      if (passoAtual > 1) irPara(passoAtual - 1);
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      if (e.target && e.target.tagName === 'TEXTAREA') return;
      if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A')) return;
      if (passoAtual === 1 && !dados.categoria) return;
      if (passoAtual < 4) {
        e.preventDefault();
        irPara(passoAtual + 1);
      } else if (!concluido) {
        e.preventDefault();
        enviarRegistro();
      }
    });

    /* Envio + análise da IA */
    function enviarRegistro() {
      if (concluido) return;
      concluido = true;
      var ref = document.getElementById('campoReferencia').value.trim();
      var desc = document.getElementById('campoDescricao').value.trim();
      var cat = global.Farol.CATEGORIAS[dados.categoria];
      var analise = global.Farol.ANALISE_IA[dados.categoria];

      var ocorrencia = global.Farol.salvarOcorrencia({
        categoria: dados.categoria,
        titulo: cat.label + (ref ? ' em ' + ref : ' no Jardim das Flores'),
        descricao: desc,
        lat: dados.lat,
        lng: dados.lng,
        enderecoAproximado: ref || 'Jardim das Flores, próximo às coordenadas informadas',
        indiceRisco: analise.risco,
        foto: dados.foto || null,
      });

      passosEls.forEach(function (el) { el.classList.remove('ativo'); });
      sucessoEl.classList.add('ativo', 'entrando');
      sucessoEl.addEventListener('animationend', function fim() {
        sucessoEl.classList.remove('entrando');
        sucessoEl.removeEventListener('animationend', fim);
      }, { once: true });
      document.getElementById('num-passo').textContent = '4';
      barra.style.width = '100%';
      document.getElementById('modal-titulo').textContent = 'Registro enviado';
      btVoltar.hidden = true;
      rodape.classList.add('invisivel');
      corpo.scrollTop = 0;
      document.getElementById('btVerDetalhes').href = 'detalhe.html?id=' + encodeURIComponent(ocorrencia.id);

      setTimeout(function () {
        document.getElementById('iaStatus').textContent = 'Concluída';
        document.getElementById('iaCarregando').hidden = true;
        var res = document.getElementById('iaResultado');
        res.hidden = false;
        document.getElementById('iaResumo').textContent = analise.resumo + ' (' + cat.label.toLowerCase() + ')';
        document.getElementById('iaConfiancaTxt').textContent = analise.confianca + '%';
        document.getElementById('iaConfiancaBarra').style.width = analise.confianca + '%';
        var f = global.Farol.riscoFaixa(analise.risco);
        var pill = document.getElementById('iaRisco');
        pill.textContent = 'risco ' + f.label.toLowerCase() + ' (' + analise.risco + ')';
        pill.className = 'pill-risco faixa-' + f.classe;
        global.Farol.toast('Registro salvo! Ele já aparece no mapa.');
      }, 1500);
    }

    /* Abrir / fechar */
    function resetar() {
      dados.categoria = null;
      dados.foto = null;
      dados.lat = global.Farol.REFERENCIA_BAIRRO.lat;
      dados.lng = global.Farol.REFERENCIA_BAIRRO.lng;
      grade.querySelectorAll('.categoria-card').forEach(function (c) { c.classList.remove('sel'); });
      removerFoto();
      document.getElementById('campoReferencia').value = '';
      document.getElementById('campoDescricao').value = '';
      document.getElementById('iaCarregando').hidden = false;
      document.getElementById('iaResultado').hidden = true;
      document.getElementById('iaStatus').textContent = 'Analisando…';
      concluido = false;
    }

    function abrirModal() {
      resetar();
      overlay.hidden = false;
      document.body.classList.add('modal-aberto');
      irPara(1);
    }

    function sair() {
      overlay.hidden = true;
      document.body.classList.remove('modal-aberto');
      document.getElementById('modal-confirma').hidden = true;
      /* Em registrar.html, fechar volta para o mapa */
      if (estaEmRegistrar()) {
        global.location.href = 'index.html';
      }
    }

    function pedirConfirmacaoFechar() {
      if (!temDadosPreenchidos()) {
        sair();
        return;
      }
      document.getElementById('modal-confirma').hidden = false;
    }

    document.getElementById('btManter').addEventListener('click', function () {
      document.getElementById('modal-confirma').hidden = true;
    });
    document.getElementById('btDescartar').addEventListener('click', sair);
    document.querySelector('.modal-fechar').addEventListener('click', pedirConfirmacaoFechar);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || overlay.hidden) return;
      pedirConfirmacaoFechar();
    });

    /* Botões que abrem o modal */
    var abrirLanding = document.getElementById('btAbrirModal');
    if (abrirLanding) abrirLanding.addEventListener('click', abrirModal);
    document.querySelectorAll('[data-registrar]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModal();
      });
    });

    global.FarolRegistro = { abrir: abrirModal };

    /* Em registrar.html o modal abre sozinho */
    if (estaEmRegistrar()) {
      abrirModal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
