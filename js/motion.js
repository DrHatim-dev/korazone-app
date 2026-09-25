/* KoraZone — mouvement : transitions de page, photo partagée, révélations, micro-interactions.
   Chargé avant app.js, qui appelle KZMotion.navigate() au changement de route et
   KZMotion.rendered() après chaque rendu. N'anime que transform et opacity ; rien ne se
   déclenche si l'utilisateur a demandé moins d'animations. */
(function () {
  'use strict';
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => mq.matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const OUT = 'cubic-bezier(.23,1,.32,1)', BACK = 'cubic-bezier(.34,1.56,.64,1)';
  const STEPS = ['taille', 'contact', 'adresse', 'envoi', 'confirmation'];

  const parse = h => {
    h = (h || '').replace(/^#/, '') || '/';
    const i = h.indexOf('?');
    return { raw: h, path: i < 0 ? h : h.slice(0, i), q: new URLSearchParams(i < 0 ? '' : h.slice(i + 1)) };
  };
  const slugOf = path => (path.match(/^\/maillot\/([^/]+)$/) || [])[1] || null;
  const onScreen = el => {
    if (!el || el.offsetParent === null) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };

  let last = null, first = true, pendingShot = null;
  // app.js remonte déjà en haut à chaque changement de page. Sans cela, « Retour » fait d'abord
  // sauter la page quittée à l'ancienne position, avant même l'événement hashchange.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function kindOf(prev, next) {
    if (!prev) return 'first';
    if (prev.raw === next.raw) return 'refresh';
    if (prev.path !== next.path) return 'page';
    if (next.path === '/commande') {
      const a = STEPS.indexOf(prev.q.get('etape') || 'taille'), b = STEPS.indexOf(next.q.get('etape') || 'taille');
      if (a === b) return next.q.get('err') ? 'error' : 'refresh';
      return b > a ? 'fwd' : 'back';
    }
    return 'filter';
  }

  /* ---------- photo partagée entre la vignette et la fiche ---------- */
  const galleryMain = () => [$('#gal-main > *'), $('#gal-track .gal-slide > *')].find(onScreen) || null;
  const hostImg = a => { const h = a.closest('.card,.strip-card,.feed-card,.xs'); return h ? h.querySelector('.img') : null; };
  function shotFrom(prev, next) {
    const to = slugOf(next.path), from = slugOf(prev.path);
    if (to && pendingShot && pendingShot.slug === to && onScreen(pendingShot.el)) return { el: pendingShot.el, slug: to, into: 'product' };
    if (from && !to) { const g = galleryMain(); if (g) return { el: g, slug: from, into: 'list' }; }
    return null;
  }
  function shotTo(s) {
    if (s.into === 'product') return galleryMain();
    return $$(`a[href="#/maillot/${s.slug}"]`).map(hostImg).find(onScreen) || null;
  }

  /* ---------- navigation ---------- */
  function navigate(render) {
    const next = parse(location.hash), kind = kindOf(last, next);
    if (still() || !document.startViewTransition || document.visibilityState !== 'visible' || kind === 'first' || kind === 'refresh' || kind === 'error') { pendingShot = null; render(); return; }
    const root = document.documentElement, step = kind === 'fwd' || kind === 'back';
    root.dataset.kzVt = step ? kind : 'page';
    const shot = kind === 'page' ? shotFrom(last, next) : null;
    if (shot) shot.el.style.viewTransitionName = 'kz-shot';
    const nameStep = () => { const s = $('.order > div'); if (s) s.style.viewTransitionName = 'kz-step'; return s; };
    if (step) nameStep();
    let target = null;
    const vt = document.startViewTransition(() => {
      if (shot) shot.el.style.viewTransitionName = '';
      render();
      if (shot) { target = shotTo(shot); if (target) target.style.viewTransitionName = 'kz-shot'; }
      if (step) nameStep();
    });
    vt.ready.catch(() => {}); // le navigateur peut sauter la transition (onglet masqué, double clic) : le rendu a lieu quand même
    vt.finished.finally(() => {
      delete root.dataset.kzVt;
      if (target) target.style.viewTransitionName = '';
      const s = $('.order > div'); if (s) s.style.viewTransitionName = '';
    });
    pendingShot = null;
  }

  /* ---------- titres révélés mot à mot sous un masque ---------- */
  function split(h) {
    const walk = node => Array.from(node.childNodes).forEach(n => {
      if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('kz-w')) return walk(n);
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'), inner = document.createElement('span');
        w.className = 'kz-w'; inner.textContent = p; w.appendChild(inner); frag.appendChild(w);
      });
      n.replaceWith(frag);
    });
    walk(h);
  }
  function words(list, o = {}) {
    list.filter(Boolean).forEach(h => {
      if (!h.querySelector('.kz-w')) split(h);
      $$('.kz-w > span', h).forEach((w, i) => w.animate(
        [{ transform: 'translateY(110%)' }, { transform: 'none' }],
        { duration: o.dur || 820, delay: (o.base || 80) + i * (o.step || 45), easing: OUT, fill: 'backwards' }));
    });
  }

  /* ---------- entrée de l'accueil ---------- */
  function heroIntro(full) {
    const hero = $('.hero'); if (!hero || hero.offsetParent === null) return;
    const k = full ? 1 : .55;
    const img = $('.hero-img img');
    if (img) img.animate([{ transform: 'scale(1.14)' }, { transform: 'none' }], { duration: 1900 * k, easing: OUT, fill: 'backwards' });
    words([$('#hero-title')], { base: 140 * k, step: 60 * k, dur: 1050 * k });
    const seq = [$('.hero .eyebrow'), $('.hero-lead'), ...$$('.hero .promises li'), ...$$('.hero-cta .btn'), $('.hero .strip-head'), ...$$('.hero .strip > *')].filter(Boolean);
    seq.forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
      { duration: 760 * k, delay: (i === 0 ? 0 : 420 + i * 55) * k, easing: OUT, fill: 'backwards' }));
  }

  /* ---------- révélation au défilement ---------- */
  const RV = ['.sec-head', '.grid > .card', '.steps > li', '.psteps > li', '.duo-band > div:first-child > *', '.duo-figs > *',
    '.sec .prose > *', '.faq .acc', '.pdp-more > .acc', '.page-head .crumbs', '.page-head .lead',
    '.page-head .chips', '.review', '.empty', '.summary', '.buy > *', '.gal-desk', '.gal-mob', '.item-edit', '.pick-list', '.order-nav'];
  const RV_FTR = ['.ftr-grid > *', '.ftr-disc'];
  const observers = {};
  function observer(zone, fresh) {
    if (fresh && observers[zone]) { observers[zone].disconnect(); observers[zone] = null; }
    return observers[zone] || (observers[zone] = new IntersectionObserver((entries, io) => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el); el.classList.add('in');
      const i = parseFloat(el.style.getPropertyValue('--rv-i')) || 0;
      setTimeout(() => el.classList.remove('rv', 'rv-img', 'in'), i * 90 + 1100);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }));
  }
  function reveal(root, sels, zone = 'main') {
    if (!root) return;
    const seen = new Map();
    $$(sels.join(','), root)
      .filter(el => !el.closest('.acc-body, .hero, .feed, dialog'))
      .slice(0, 90)
      .forEach(el => {
        const p = el.parentElement, i = seen.get(p) || 0; seen.set(p, i + 1);
        el.style.setProperty('--rv-i', Math.min(i, 8));
        el.classList.add(el.matches('.duo-figs > *') ? 'rv-img' : 'rv');
        observer(zone).observe(el);
      });
  }

  /* ---------- fil vertical (téléphone) ---------- */
  function feed(root) {
    const f = $('.feed', root); if (!f || f.offsetParent === null) return;
    f.classList.add('fx-feed');
    $$('.feed-card', f).forEach(c => $$('.feed-in > *', c).forEach((el, i) => el.style.setProperty('--rv-i', i)));
    const o = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-live', e.isIntersecting)), { threshold: 0.55 });
    $$('.feed-card', f).forEach(c => o.observe(c));
  }

  /* ---------- après chaque rendu ---------- */
  function rendered() {
    const next = parse(location.hash), kind = first ? 'first' : kindOf(last, next), wasFirst = first;
    last = next; first = false;
    if (still()) return;
    const main = $('#main');
    observer('main', true);
    if (kind === 'refresh') return;
    if (kind === 'error') { shake(); return; }
    if (kind === 'fwd' || kind === 'back') { if (kind === 'fwd') fillProgress(); reveal(main, ['.item-edit', '.pick-list']); return; }
    if (kind === 'filter') { reveal(main, ['.grid > .card']); $$('.hero .strip > *').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: i * 50, easing: OUT, fill: 'backwards' })); return; }
    if (next.path === '/') heroIntro(wasFirst);
    words($$('.page-head h1, .buy h1, .order h1', main).filter(h => h.offsetParent !== null), { base: 60, step: 38, dur: 760 });
    reveal(main, RV);
    if (wasFirst) reveal($('.ftr'), RV_FTR, 'footer');
    feed(main);
  }

  /* ---------- micro-interactions ---------- */
  const pop = el => el && el.animate([{ transform: 'scale(.9)' }, { transform: 'scale(1.06)', offset: .55 }, { transform: 'none' }], { duration: 340, easing: OUT });
  const rise = (el, i = 0) => el && el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 45, easing: OUT, fill: 'backwards' });
  function roll(el) { if (el) el.animate([{ opacity: 0, transform: 'translateY(60%)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: OUT }); }
  function shake() {
    $$('.field.is-err, #err-sum, .size-msg.is-err').forEach(el => el.animate(
      [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }],
      { duration: 380, easing: 'ease-out' }));
  }
  function fillProgress() {
    const on = $$('.prog span.on'), el = on[on.length - 1];
    if (el) el.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 520, delay: 160, easing: OUT, fill: 'backwards' });
  }
  function burst(el) {
    if (!el) return;
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, n = 14;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'), a = (i / n) * Math.PI * 2 + Math.random() * .4, d = 24 + Math.random() * 30;
      s.className = 'kz-burst'; s.style.left = (cx - 3) + 'px'; s.style.top = (cy - 3) + 'px';
      document.body.appendChild(s);
      s.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${Math.random() * 180}deg) scale(.4)`, opacity: 0 }],
        { duration: 620 + Math.random() * 260, easing: OUT }).onfinish = () => s.remove();
    }
  }
  const priceText = () => { const b = $('.price-block b'); return b ? b.textContent : ''; };

  function afterAct(act, el, before) {
    const size = el.dataset.size;
    switch (act) {
      case 'size':
        pop($(`.size[data-act="size"][data-size="${size}"]`)); rise($('#size-msg'));
        break;
      case 'duo-size':
        pop($(`.size[data-act="duo-size"][data-size="${size}"]`));
        break;
      case 'item-size':
        pop($(`.size[data-act="item-size"][data-i="${el.dataset.i}"][data-size="${size}"]`));
        break;
      case 'duo-model':
        pop($(`.duo-model[data-slug="${el.dataset.slug}"]`));
        if (!before.duoSizes) $$('.duo-sizes .size').forEach(rise);
        break;
      case 'duo-toggle': case 'xsell':
        if ($('.duo-box.is-on') && !before.duo) { $$('.duo-body > *').forEach(rise); $$('.duo-model').forEach((m, i) => rise(m, i)); burst($('.duo-check')); }
        break;
      case 'shot':
        { const m = $('#gal-main > *'); if (m) m.animate([{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: OUT }); }
        break;
      case 'add-item':
        { const items = $$('.item-edit'); rise(items[items.length - 1]); }
        break;
      case 'order':
        if ($('#size-msg.is-err')) { shake(); $$('#sizes .size').forEach((b, i) => b.animate([{ transform: 'none' }, { transform: 'translateY(-4px)' }, { transform: 'none' }], { duration: 360, delay: 200 + i * 40, easing: OUT })); }
        break;
      case 'copy-msg':
        pop(el.isConnected ? el : null);
        break;
    }
    if (before.price && priceText() && priceText() !== before.price) { roll($('.price-block b')); roll($('#sticky .sticky-info b')); }
  }

  document.addEventListener('click', e => {
    if (still()) return;
    const link = e.target.closest('a[href^="#/maillot/"]');
    if (link) { const im = hostImg(link); pendingShot = im ? { slug: link.getAttribute('href').slice('#/maillot/'.length), el: im } : null; }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const before = { price: priceText(), duo: !!$('.duo-box.is-on'), duoSizes: !!$('.duo-sizes') };
    requestAnimationFrame(() => afterAct(a.dataset.act, a, before));
  }, true);

  window.KZMotion = { navigate, rendered };
})();
