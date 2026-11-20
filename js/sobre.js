(function () {
  'use strict';

  var frame = document.querySelector('.app-frame');
  function fitPreview() {
    frame.style.setProperty('--preview-scale', frame.clientWidth / 1280);
    frame.classList.add('is-scaled');
  }
  fitPreview();
  if ('ResizeObserver' in window) new ResizeObserver(fitPreview).observe(frame);
  else window.addEventListener('resize', fitPreview, { passive: true });

  var topics = {
    buraco: ['warning', 'O desvio que podia ser evitado.', 'Buracos entram no mapa para você conhecer os obstáculos antes de passar por eles.'],
    iluminacao: ['lightbulb', 'O caminho também muda à noite.', 'Pontos sem iluminação ajudam a identificar trechos que pedem mais atenção.'],
    semaforo: ['traffic', 'Uma travessia merece atenção.', 'Semáforos quebrados ficam visíveis para quem vai passar pelo cruzamento.'],
    calcada: ['accessible', 'A cidade precisa caber todo mundo.', 'Calçadas danificadas e barreiras de acessibilidade também fazem parte do mapa.'],
    ciclovia: ['pedal_bike', 'A pedalada não precisa de surpresas.', 'Obstruções nas ciclovias ajudam você a planejar o trajeto antes de sair.'],
    lixo: ['delete', 'O que ocupa a rua importa.', 'Registros de lixo acumulado mostram os pontos que precisam de cuidado.'],
    sinalizacao: ['signpost', 'Orientação faz parte do caminho.', 'Placas e sinalização danificadas entram no mapa junto aos outros problemas.']
  };
  document.querySelectorAll('[data-topic]').forEach(function (button) {
    button.addEventListener('click', function () {
      var topic = topics[button.dataset.topic];
      document.querySelectorAll('[data-topic]').forEach(function (item) {
        item.classList.toggle('selected', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.querySelector('.topic-icon').textContent = topic[0];
      document.getElementById('topic-title').textContent = topic[1];
      document.getElementById('topic-copy').textContent = topic[2];
    });
  });
})();
