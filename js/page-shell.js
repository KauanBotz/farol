/* Executado cedo: fundo contínuo e navegação interna nativa. */
(function () {
  'use strict';
  var root = document.documentElement;
  var page = window.location.pathname.split('/').pop();
  root.classList.add('nav-initializing');
  var resolveReady;
  window.FarolShell = { ready: new Promise(function (resolve) { resolveReady = resolve; }) };
  if (page !== 'sobre.html') root.classList.add('system-page');

  function start() {
    if (document.querySelector('.about-nav')) root.classList.remove('system-page');
    resolveReady();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.addEventListener('pageshow', function () {
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('nav-initializing'); }); });
  });
})();
