(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var gs = window.gsap;
  var trigger = window.ScrollTrigger;
  var motion, cinematic, contextLost = false;
  var renderScene = function () {};
  var sceneState = { progress: 0 };
  var stage = document.querySelector(".journey-visual");
  if (gs && trigger) gs.registerPlugin(trigger);

  function startMotion() {
    if (!gs) return;
    motion = gs.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', function () {
      gs.timeline({ defaults: { ease: 'power3.out', clearProps: 'filter,opacity,transform' } })
        .from('.hero-copy > .small-tag', { opacity: 0, y: 12, duration: .6 })
        .from('.headline-piece', { opacity: 0, y: 25, filter: 'blur(12px)', duration: 1.1, stagger: .12 }, .12)
        .from('.hero-copy > p, .prototype-note', { opacity: 0, y: 14, duration: .8, stagger: .08 }, .5)
        .from('.app-frame', { opacity: 0, y: 36, duration: 1 }, .7);

      var signature = document.querySelector('.farol-signature');
      var stroke = signature && signature.querySelector('path');
      var signatureObserver = null;
      var handwriting = null;
      function hideSignature() {
        if (handwriting) { handwriting.kill(); handwriting = null; }
        if (stroke) stroke.style.strokeDashoffset = '1';
      }
      if (stroke) {
        stroke.style.strokeDasharray = '1';
        hideSignature();
        signatureObserver = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          if (entry.isIntersecting && entry.intersectionRatio >= .35) {
            if (handwriting) handwriting.kill();
            handwriting = gs.fromTo(stroke,
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 3.1, delay: .15, ease: 'power2.inOut', overwrite: true });
          } else if (!entry.isIntersecting) {
            hideSignature();
          }
        }, { threshold: [0, .35] });
        signatureObserver.observe(signature);
      }

      function reveal(selector, options) {
        var elements = document.querySelectorAll(selector);
        if (!elements.length) return;
        var config = options || {};
        var triggerElement = config.trigger ? document.querySelector(config.trigger) : elements[0];
        if (!triggerElement) triggerElement = elements[0];
        gs.from(elements, {
          opacity: 0,
          y: config.y === undefined ? 24 : config.y,
          duration: config.duration || .7,
          stagger: config.stagger || .07,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: { trigger: triggerElement, start: config.start || 'top 88%', once: true }
        });
      }
      reveal('.category-pill', { trigger: '.category-cloud', y: 18, stagger: .045, duration: .5 });
      reveal('.topic-preview', { y: 18, duration: .6 });
      reveal('.capture-demo', { y: 24 });
      reveal('.steps li', { trigger: '.steps', y: 26, stagger: .09 });
      reveal('.journey-switch', { trigger: '.journey-copy', y: 14, duration: .55 });
      reveal('.journey-status', { trigger: '.journey-copy', y: 12, duration: .5 });
      reveal('.journey-copy .button-dark', { trigger: '.journey-copy', y: 12, duration: .5 });
      reveal('.journey-note', { trigger: '.journey-copy', y: 10, duration: .5 });
      reveal('.audience-grid article', { trigger: '.audience-grid', y: 26, stagger: .09 });
      reveal('.faq-list details', { trigger: '.faq-list', y: 18, stagger: .05, duration: .55 });
      reveal('.closing-actions', { trigger: '.closing-section', y: 12, duration: .6 });

      if (trigger) {
        document.querySelectorAll('.project-section h2, .how-copy h2, .audience-heading h2, .journey-copy h2, .closing-section h2').forEach(function (heading) {
          gs.from(heading, { opacity: .25, filter: 'blur(6px)', y: 18, duration: .85, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
        });
        if (routeMaterial) {
          document.querySelector('.journey-track').classList.add('is-cinematic');
          cinematic = gs.to(sceneState, { progress: 1, ease: 'none', onUpdate: function () { renderScene(); }, scrollTrigger: { trigger: '.journey-track', start: 'top 15%', end: 'bottom bottom', scrub: .65 } });
          if (contextLost) suspendScene();
        }
      }
      return function () {
        if (signatureObserver) signatureObserver.disconnect();
        if (handwriting) handwriting.kill();
        if (stroke) { stroke.style.removeProperty('stroke-dasharray'); stroke.style.removeProperty('stroke-dashoffset'); }
        document.querySelectorAll('.category-pill,.topic-preview,.capture-demo,.steps li,.journey-switch,.journey-status,.journey-copy .button-dark,.journey-note,.audience-grid article,.faq-list details,.closing-actions').forEach(function (element) {
          element.style.removeProperty('opacity');
          element.style.removeProperty('transform');
        });
        document.querySelector('.journey-track').classList.remove('is-cinematic');
        cinematic = null; sceneState.progress = 0; renderScene();
      };
    });
  }
  Promise.resolve(window.FarolShell && window.FarolShell.ready).then(startMotion);
  document.querySelectorAll('[data-topic]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (gs && !reduced.matches) gs.fromTo('.topic-preview > div', { opacity: .3, y: 5, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .3, overwrite: true, clearProps: 'all' });
    });
  });

  var routeMaterial, fastMaterial, renderer, scene, camera;
  var canvas = document.getElementById('route-scene');
  function suspendScene() {
    if (cinematic) cinematic.scrollTrigger.disable(false);
    stage.closest('.journey-track').classList.remove('is-cinematic');
    sceneState.progress = 0;
    renderScene();
  }
  function chooseRoute(value) {
    document.querySelectorAll('[data-route]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.route === value)); });
    document.querySelector('.journey-status').textContent = value === 'safe' ? 'O caminho contorna os pontos de atenção.' : 'O caminho direto passa pelo trecho de atenção.';
    stage.dataset.route = value;
    if (!routeMaterial) return;
    renderScene();
    var safe = value === 'safe';
    if (gs && !reduced.matches) {
      gs.to(routeMaterial, { opacity: safe ? 1 : .12, duration: .45, overwrite: true, onUpdate: renderScene });
      gs.to(fastMaterial, { opacity: safe ? .12 : 1, duration: .45, overwrite: true, onUpdate: renderScene });
    } else { routeMaterial.opacity = safe ? 1 : .12; fastMaterial.opacity = safe ? .12 : 1; renderScene(); }
  }
  document.querySelectorAll('[data-route]').forEach(function (button) { button.addEventListener('click', function () { chooseRoute(button.dataset.route); }); });
  if (!window.THREE || !canvas) return;
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, .1, 85);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    var sky = new THREE.HemisphereLight(0xffefd7, 0x526c63, 2);
    var sun = new THREE.DirectionalLight(0xffe4bd, 2.2);
    sun.position.set(-7, 9, 4); scene.add(sky, sun);
    var city = window.buildFarolNeighborhood(THREE, scene);
    routeMaterial = city.safe.material; fastMaterial = city.fast.material;
    var cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 18.5, 7.0),
      new THREE.Vector3(7.2, 11.8, 13.8),
      new THREE.Vector3(3.2, 5.8, 11.8),
      new THREE.Vector3(.07, 1.24, 6.2)
    ]);
    var targetPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, .28, 0),
      new THREE.Vector3(0, .4, .6), new THREE.Vector3(-.04, .73, -3.1)
    ]);
    var markerPosition = new THREE.Vector3(), target = new THREE.Vector3();
    renderScene = function () {
      var progress = reduced.matches ? 0 : sceneState.progress;
      cameraPath.getPoint(progress, camera.position);
      targetPath.getPoint(progress, target);
      camera.position.sub(target).multiplyScalar(Math.max(1, .97 / camera.aspect) * (1 - .23 * progress)).add(target);
      camera.lookAt(target);
      sun.intensity = 2.2 - progress * .8;
      sky.intensity = 2 - progress * .48;
      city.animate(progress);
      var route = stage.dataset.route === 'fast' ? city.fast : city.safe;
      var markerT = Math.min(.97, .035 + progress * .84);
      route.curve.getPointAt(markerT, markerPosition);
      city.marker.position.copy(markerPosition);
      city.marker.position.y += .18;
      city.marker.material.color.setHex(route === city.safe ? 0xffffff : 0xffd2a1);
      if (!contextLost) renderer.render(scene, camera);
    };
    function resize() { var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false); renderScene(); }
    var observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    stage.classList.add('has-webgl');
    if (!reduced.matches && gs && trigger) stage.closest('.journey-track').classList.add('is-cinematic');
    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault(); contextLost = true;
      stage.classList.remove('has-webgl'); suspendScene();
    });
    canvas.addEventListener('webglcontextrestored', function () {
      contextLost = false; stage.classList.add('has-webgl');
      if (cinematic) { stage.closest('.journey-track').classList.add('is-cinematic'); cinematic.scrollTrigger.enable(); trigger.refresh(); }
      resize();
    });
    window.addEventListener('pagehide', function (event) { if (event.persisted) return; if (motion) motion.revert(); observer.disconnect(); scene.traverse(function (object) { if (object.geometry) object.geometry.dispose(); if (object.material) object.material.dispose(); }); renderer.dispose(); });
  } catch (error) { if (renderer) renderer.dispose(); canvas.hidden=true; }
})();
