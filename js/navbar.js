/* Navegação compartilhada: ilha, indicador e movimento por direção de rolagem. */
(function () {
  'use strict';
  var nav = document.querySelector('.navbar, .about-nav');
  if (!nav) return;
  var system = nav.classList.contains('navbar');
  if (new URLSearchParams(window.location.search).get('preview') === '1') {
    var base = document.createElement('base');
    base.target = '_top';
    document.head.appendChild(base);
  }
  nav.classList.add('site-nav');
  if (system) document.body.classList.add('has-system-nav');

  var island = nav.querySelector('.nav-island');
  if (!island) {
    island = document.createElement('div');
    island.className = 'nav-island';
    while (nav.firstChild) island.appendChild(nav.firstChild);
    nav.appendChild(island);
  }
  var brand = island.querySelector('.navbar-marca, .brand');
  brand.classList.add('nav-brand');
  var wordmark = brand.querySelector('span:not(.logo)');
  if (!wordmark) { wordmark = document.createElement('span'); wordmark.textContent = 'farol'; brand.appendChild(wordmark); }
  wordmark.classList.add('nav-wordmark');
  var links = island.querySelector('.navbar-links, .desktop-links');
  links.classList.add('nav-links');
  var indicator = links.querySelector('.nav-indicator');
  if (!indicator) { indicator = document.createElement('span'); indicator.className = 'nav-indicator'; indicator.setAttribute('aria-hidden', 'true'); links.prepend(indicator); }
  var actions = island.querySelector('.nav-actions, .navbar-acoes');
  if (!actions) {
    actions = document.createElement('div');
    var cta = island.querySelector('.nav-cta');
    island.insertBefore(actions, cta);
    actions.appendChild(cta);
  }
  actions.classList.add('nav-actions');
  var register = actions.querySelector('[data-registrar]');
  if (register) register.classList.add('nav-cta');

  var toggle = island.querySelector('.menu-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'menu-toggle';
    toggle.innerHTML = '<span></span><span></span>';
    island.appendChild(toggle);
  }
  var menu = nav.querySelector('.mobile-menu');
  if (!menu) {
    menu = document.createElement('nav');
    menu.className = 'mobile-menu'; menu.id = 'mobile-menu'; menu.hidden = true;
    menu.setAttribute('aria-label', 'Navegação móvel');
    links.querySelectorAll('a').forEach(function (link) { menu.appendChild(link.cloneNode(true)); });
    if (register) menu.appendChild(register.cloneNode(true));
    var account = document.createElement('a');
    account.href = 'login.html'; account.textContent = 'Entrar / conta';
    menu.appendChild(account);
    nav.appendChild(menu);
  }
  toggle.setAttribute('aria-label', 'Abrir navegação');
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');

  var mobile = window.matchMedia('(max-width: 820px)');
  function reserveNavSpace() {
    if (!system) return;
    /* offsetHeight/offsetTop não variam com a animação de esconder a barra. */
    document.body.style.setProperty('--navbar-h', (nav.offsetTop + island.offsetHeight + 16) + 'px');
  }
  reserveNavSpace();
  if ('ResizeObserver' in window) new ResizeObserver(reserveNavSpace).observe(island);
  window.addEventListener('resize', reserveNavSpace, { passive: true });
  var open = false;
  var savedInert = [];
  var bodyOverflow = '';
  function setMenu(value, restoreFocus) {
    if (value === open) return;
    open = value;
    nav.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
    menu.hidden = !open;
    document.body.classList.toggle('nav-menu-open', open);
    if (open) {
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      var background = Array.from(document.querySelectorAll('main, .frame-mapa, footer'));
      background.push(brand, actions);
      savedInert = background.map(function (element) { var previous = element.inert; element.inert = true; return [element, previous]; });
      menu.querySelector('a').focus();
    } else {
      document.body.style.overflow = bodyOverflow;
      savedInert.forEach(function (entry) { entry[0].inert = entry[1]; });
      savedInert = [];
      if (restoreFocus) toggle.focus();
    }
  }
  toggle.addEventListener('click', function () { setMenu(!open, true); });
  menu.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    setMenu(false);
    if (link.hash) {
      var target = document.getElementById(link.hash.slice(1));
      if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    }
  });
  document.addEventListener('keydown', function (event) {
    if (!open) return;
    if (event.key === 'Escape') { setMenu(false, true); return; }
    if (event.key !== 'Tab') return;
    var last = menu.querySelector('a:last-child');
    if (event.shiftKey && document.activeElement === toggle) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); toggle.focus(); }
  });
  mobile.addEventListener('change', function (event) { if (!event.matches) setMenu(false); updateIndicator(); });

  var activeLink = links.querySelector('[aria-current="page"]');
  function moveIndicator(link) {
    if (!link || mobile.matches) { indicator.style.opacity = '0'; return; }
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    indicator.style.opacity = '1';
  }
  function updateIndicator() { moveIndicator(activeLink); }
  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('pointerenter', function () { moveIndicator(link); });
    link.addEventListener('focus', function () { moveIndicator(link); });
  });
  links.addEventListener('pointerleave', updateIndicator);
  links.addEventListener('focusout', function (event) { if (!links.contains(event.relatedTarget)) updateIndicator(); });
  window.addEventListener('resize', updateIndicator, { passive: true });
  if (document.fonts) document.fonts.ready.then(updateIndicator);
  updateIndicator();

  var lastY = Math.max(0, window.scrollY);
  var direction = 0;
  var distance = 0;
  var scheduled = false;
  function updateScroll() {
    scheduled = false;
    var maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var y = Math.min(maxY, Math.max(0, window.scrollY));
    var delta = y - lastY;
    nav.classList.toggle('is-compact', y > 70);
    if (y <= 70 || open || nav.querySelector(':focus-visible')) {
      nav.classList.remove('is-hidden'); distance = 0;
    } else if (Math.abs(delta) > 0.5) {
      var nextDirection = delta > 0 ? 1 : -1;
      if (direction !== nextDirection) distance = 0;
      direction = nextDirection;
      distance += Math.abs(delta);
      if (direction === 1 && y > 140 && distance > 24) nav.classList.add('is-hidden');
      if (direction === -1 && distance > 10) nav.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', function () {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); });
  updateScroll();
})();
