/* KoraZone — application (routes par hash, aucune dépendance, aucun build). */
(function () {
  'use strict';
  const C = window.KZ_CONTENT, K = window.KZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const main = $('#main');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const WA = '<svg class="wa-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><use href="#wa"></use></svg>';
  const WA_URL = 'https://wa.me/' + K.wa;
  const DISC = 'Reproduction non officielle. KoraZone est une boutique indépendante, sans affiliation avec les clubs ou leurs équipementiers.';
  const isDesk = () => window.matchMedia('(min-width:1024px)').matches;
  const store = {
    get(k, d) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- données produit ---------- */
  const P = slug => K.products.find(p => p.slug === slug);
  const PC = slug => (C.products && C.products[slug]) || {};
  const nameOf = slug => PC(slug).title || slug;
  const colorOf = slug => { const r = (PC(slug).table || []).find(x => x[0] === 'Couleur'); return r ? r[1] : ''; };
  const photoKey = slug => { const p = P(slug); return p && p.photos[0] ? p.photos[0].key : null; };
  const metaLine = slug => { const p = P(slug); return [p.club, '2026/2027', p.edition, colorOf(slug)].filter(Boolean).join(' · '); };
  const stockOf = (slug, s) => { const st = K.live.stock[slug]; return st ? (st[s] == null ? null : st[s]) : null; };
  const totalStock = slug => { const st = K.live.stock[slug]; return st ? Object.values(st).reduce((a, b) => a + b, 0) : null; };
  const scarcity = (slug, paper) => {
    const t = totalStock(slug);
    if (t == null) return '';
    if (t === 0) return '<span class="scar scar--out">Modèle épuisé</span>';
    if (t <= K.live.lowThreshold) return `<span class="scar ${paper ? 'scar--paper' : ''}">Reste ${t} pièce${t > 1 ? 's' : ''}</span>`;
    return '';
  };
  const priceOf = i => (i === 0 ? K.price : K.duoSecond);
  const totalOf = items => items.reduce((a, _, i) => a + priceOf(i), 0);

  /* ---------- images ---------- */
  const ph = (label, o = {}) => `<div class="ph ${o.ink ? 'ph--ink' : ''} ${o.cls || ''}" role="img" aria-label="${esc(label)}"><span>[${esc(label)}]</span></div>`;
  const img = (key, alt, o = {}) => {
    if (!key) return ph(o.label || 'Photo à fournir', o);
    return `<div class="img ${o.paper ? 'img--paper' : ''} ${o.cls || ''}"><picture><source srcset="assets/img/${key}.webp" type="image/webp"><img src="assets/img/${key}.jpg" alt="${esc(alt)}" width="1000" height="1000" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="KZloaded(this)" onerror="KZbroken(this)"></picture></div>`;
  };
  window.KZloaded = el => { el.classList.add('is-in'); const b = el.closest('.img'); if (b) b.classList.add('is-loaded'); };
  window.KZbroken = el => { const b = el.closest('.img'); if (b) b.outerHTML = ph('Photo indisponible : ' + el.alt, { ink: !b.classList.contains('img--paper') }); };
  const productImg = (slug, o = {}) => img(photoKey(slug), nameOf(slug) + ', vue de face', Object.assign({ label: 'Photo à fournir : ' + nameOf(slug) + ', face' }, o));

  const PROMISES = '<li>Contrôlé pièce par pièce à Oujda</li><li>Colis ouvert devant le livreur, payé après</li><li>Échange de taille sous 7 jours</li>';

  /* ---------- en-tête : clôture du jour (données live) ---------- */
  function cutoffInfo() {
    const c = K.live.cutoff; if (!c) return null;
    const [h, m] = c.split(':').map(Number), now = new Date(), end = new Date();
    end.setHours(h, m, 0, 0);
    if (end <= now) return { text: 'Prochaine clôture des commandes :', val: 'demain ' + c };
    const mins = Math.floor((end - now) / 60000);
    return { text: 'Commandes du jour closes dans', val: Math.floor(mins / 60) + ' h ' + String(mins % 60).padStart(2, '0') };
  }
  function paintCutoff() {
    const el = $('#cutoff'), i = cutoffInfo();
    if (!i) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false; el.innerHTML = `${esc(i.text)} <b>${esc(i.val)}</b>`;
  }

  /* ---------- composants ---------- */
  const chips = (active, base) => K.clubs.map(c => `<a class="chip" href="${base}${c.key === 'all' ? '' : '?club=' + c.key}" aria-pressed="${active === c.key}">${c.thumb ? `<span class="chip-thumb" aria-hidden="true"><img src="assets/img/${c.thumb}.jpg" alt="" width="60" height="60" loading="lazy"></span>` : ''}${esc(c.label)}</a>`).join('');
  const filtered = club => K.products.filter(p => club === 'all' || p.clubKey === club);
  const emptyFilter = ink => `<div class="empty" ${ink ? 'style="background:transparent;border-color:rgba(251,250,247,.3);color:#FBFAF7"' : ''}><h3>Aucun résultat avec ces filtres</h3><p ${ink ? 'style="color:rgba(251,250,247,.8)"' : ''}>Aucun maillot ne correspond à votre sélection pour le moment. Essayez une autre taille ou retirez un filtre.</p><a class="btn ${ink ? 'btn--paper' : 'btn--primary'}" href="#/maillots">Réinitialiser les filtres</a></div>`;
  const card = p => `<a class="card" href="#/maillot/${p.slug}">${productImg(p.slug, { paper: true })}<p class="m">${esc(p.club)} · 2026/2027 · ${esc(p.edition)}</p><h3>${esc(nameOf(p.slug))}</h3>${scarcity(p.slug, true)}<div class="row"><span class="p">259 DH</span><span class="go">Voir le maillot →</span></div></a>`;
  const stripCard = p => `<a class="strip-card" href="#/maillot/${p.slug}">${productImg(p.slug, { ink: true })}<span class="m">${esc(p.clubShort)} · ${esc(p.edition)}</span><span class="t">${esc(p.club)}</span>${scarcity(p.slug)}</a>`;
  const acc = (title, body, o = {}) => `<details class="acc" ${o.open ? 'open' : ''} ${o.id ? `id="${o.id}"` : ''}><summary>${esc(title)}</summary><div class="acc-body prose">${body}</div></details>`;
  const splitQA = html => html.split('<h3>').slice(1).map(ch => { const i = ch.indexOf('</h3>'); return { q: ch.slice(0, i), a: ch.slice(i + 5) }; });
  const sizeTable = hit => `<div class="table-wrap"><table><thead><tr><th>Taille</th><th>Largeur à plat</th><th>Longueur</th></tr></thead><tbody>${K.sizes.map(s => `<tr class="${hit === s.s ? 'is-hit' : ''}"><td>${s.s}</td><td>${s.w} cm</td><td>${s.l} cm</td></tr>`).join('')}</tbody></table></div>`;
  const reco = (w, l) => { const i1 = K.sizes.findIndex(s => s.w >= w), i2 = K.sizes.findIndex(s => s.l >= l); const a = i1 < 0 ? 4 : i1, b = i2 < 0 ? 4 : i2; return K.sizes[Math.max(a, b)].s; };
  const pageSection = (slug, h) => { const pg = C.pages[slug]; const s = pg && pg.sections.find(x => x.h === h); return s ? s.html : ''; };
  const reviewsBlock = slug => {
    const list = slug ? K.live.reviews[slug] : [].concat(...Object.values(K.live.reviews));
    if (!list || !list.length) return `<div class="empty"><h3>Aucun avis publié pour le moment</h3><p>Les avis affichés ici sont uniquement ceux de clients ayant reçu leur maillot : ville, taille achetée et ressenti sur la taille.</p><a class="btn btn--ghost" href="${WA_URL}?text=${encodeURIComponent('Bonjour KoraZone, je souhaite laisser un avis sur mon maillot.')}" target="_blank" rel="noopener">Laisser un avis sur WhatsApp</a></div>`;
    return `<div class="reviews">${list.map(r => `<article class="review">${r.photo ? img(r.photo, 'Photo envoyée par un client', { paper: true }) : ''}<p class="review-meta">${esc(r.city)} · Taille ${esc(r.size)} · ${esc(r.fit)}</p><p>${esc(r.text)}</p></article>`).join('')}</div>`;
  };

  /* ---------- SEO ---------- */
  const abs = p => new URL(p, location.origin + location.pathname).href;
  function setMeta(o) {
    document.title = o.title || 'KoraZone';
    $('meta[name="description"]').setAttribute('content', o.desc || '');
    $('meta[property="og:title"]').setAttribute('content', o.title || 'KoraZone');
    $('#ld-json').textContent = JSON.stringify(o.ld || { '@context': 'https://schema.org', '@type': 'Store', name: 'KoraZone', telephone: '+212601122488', address: { '@type': 'PostalAddress', addressLocality: 'Oujda', addressCountry: 'MA' } });
  }
  const crumbsLd = items => ({ '@type': 'BreadcrumbList', itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: abs(c[1]) })) });
  const crumbs = items => `<nav class="crumbs" aria-label="Fil d’Ariane">${items.map((c, i) => i === items.length - 1 ? `<span aria-current="page">${esc(c[0])}</span>` : `<a href="${c[1]}">${esc(c[0])}</a><span aria-hidden="true">/</span>`).join('')}</nav>`;

  /* ================= VUES ================= */
  function home(r) {
    const club = r.q.get('club') || 'all', list = filtered(club), f = K.products[0];
    const qa = (C.home.sections.find(s => s.h === 'Vos questions avant de commander') || { html: '' }).html;
    const html = `
<section class="hero on-ink" aria-labelledby="hero-title">
  ${productImg(f.slug, { eager: true, cls: 'hero-img' })}
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="eyebrow">Livraison offerte partout au Maroc</p>
      <h1 id="hero-title">${esc(C.home.title).replace(/,\s+/, ',<br>')}</h1>
      <p class="hero-lead">Retrouvez les modèles FC Barcelone, Real Madrid et Bayern Munich de la saison 2026/2027. Choisissez votre taille, vérifiez le colis devant le livreur et payez à la réception.</p>
      <ul class="promises">${PROMISES}</ul>
      <div class="hero-cta"><a class="btn btn--paper btn--lg" href="#/maillots">Choisir mon maillot</a><a class="btn btn--ghost-ink btn--lg" href="#/duo">2 maillots à 499 DH</a></div>
    </div>
    <div class="strip-head"><div class="chips" role="group" aria-label="Filtrer par club">${chips(club, '#/')}</div><p class="hero-legal">Reproductions non officielles. Tailles S à XXL selon les modèles et les stocks.</p></div>
    ${list.length ? `<div class="strip">${list.map(stripCard).join('')}</div>` : emptyFilter(true)}
  </div>
</section>
<section class="feed on-ink" aria-label="Les maillots 2026/2027">
  <div class="feed-bar"><div class="chips" role="group" aria-label="Filtrer par club">${chips(club, '#/')}</div></div>
  <article class="feed-card feed-intro">
    ${productImg(f.slug)}
    <div class="feed-in">
      <p class="eyebrow">Livraison offerte partout au Maroc</p>
      <h2 style="font-size:clamp(30px,9vw,40px)">${esc(C.home.title)}</h2>
      <p style="color:var(--on-ink-2);font-size:14.5px">Retrouvez les modèles FC Barcelone, Real Madrid et Bayern Munich de la saison 2026/2027. Choisissez votre taille, vérifiez le colis devant le livreur et payez à la réception.</p>
      <ul class="promises" style="flex-direction:column;gap:6px">${PROMISES}</ul>
      <p style="font-size:12.5px;color:var(--on-ink-3)">Faites défiler pour voir les ${list.length} modèles ↓</p>
    </div>
  </article>
  ${list.length ? list.map(p => `
  <article class="feed-card">
    ${productImg(p.slug, { ink: true })}
    <div class="feed-in">
      ${scarcity(p.slug)}
      <p class="m">${esc(p.club)} · 2026/2027 · ${esc(p.edition)}</p>
      <h2>${esc(nameOf(p.slug))}</h2>
      <div class="feed-price"><b>259 DH</b><span>tout compris, réglés au livreur après vérification du colis</span></div>
      <div class="feed-cta"><a class="btn btn--paper btn--lg" href="#/maillot/${p.slug}">Voir le maillot</a><a class="btn btn--ghost-ink btn--lg" href="#/guide-des-tailles">Tailles</a></div>
    </div>
  </article>`).join('') : `<div class="wrap" style="padding:32px var(--gut)">${emptyFilter(true)}</div>`}
</section>
<section class="sec home-grid-wrap" aria-labelledby="h-coll">
  <div class="wrap">
    <div class="sec-head"><div><h2 id="h-coll">Les maillots 2026/2027</h2><p class="sec-lead">Chaque fiche présente le maillot photographié, le guide des tailles et les disponibilités. Tous les modèles sont à <strong>259 DH, livraison offerte</strong>.</p></div><a class="btn btn--ghost" href="#/maillots">Voir tous les maillots</a></div>
    ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : emptyFilter()}
  </div>
</section>
${duoBand()}
<section class="sec" aria-labelledby="h-steps">
  <div class="wrap">
    <div class="sec-head"><div><p class="eyebrow">Garantie Colis Ouvert</p><h2 id="h-steps" style="margin-top:10px">Vous voyez le maillot avant de payer</h2></div><a class="btn btn--ghost" href="#/livraison">Comprendre la livraison et le paiement</a></div>
    ${payStepsGrid()}
  </div>
</section>
<section class="sec sec--inset"><div class="wrap two">
  <div class="prose"><h2>Livraison offerte partout au Maroc</h2>${(C.home.sections.find(s => s.h === 'Livraison offerte partout au Maroc') || {}).html || ''}</div>
  <div class="prose"><h2>Une hésitation sur la taille ?</h2>${(C.home.sections.find(s => s.h === 'Une hésitation sur la taille ?') || {}).html || ''}</div>
</div></section>
<section class="sec faq" aria-labelledby="h-qa"><div class="wrap narrow">
  <h2 id="h-qa" style="margin-bottom:20px">Vos questions avant de commander</h2>
  ${splitQA(qa).map(x => acc(x.q.replace(/<[^>]+>/g, ''), x.a)).join('')}
  <p style="margin-top:22px"><a href="#/faq">Toutes les questions fréquentes →</a></p>
</div></section>`;
    return { html, bodyClass: 'is-home', title: C.home.seoTitle, desc: C.home.meta };
  }

  const duoBand = () => `
<section class="sec sec--ink on-ink" aria-labelledby="h-duo"><div class="wrap duo-band">
  <div>
    <p class="eyebrow">Offre duo</p>
    <h2 id="h-duo" style="margin-top:10px">Deux maillots, les modèles et les tailles de votre choix</h2>
    <div class="duo-price"><b>499 DH</b><span>les deux, livraison comprise<br>le deuxième maillot à 240 DH</span></div>
    <ul class="promises" style="flex-direction:column;gap:8px;margin-bottom:26px"><li>Un seul colis, la même garantie</li><li>Clubs, éditions et tailles mélangeables</li><li>Colis ouvert devant le livreur, payé après</li></ul>
    <a class="btn btn--paper btn--lg" href="#/duo">Composer mon duo</a>
  </div>
  <div class="duo-figs">${productImg('barca-domicile', { ink: true })}${productImg('real-domicile', { ink: true })}</div>
</div></section>`;

  const payStepsGrid = () => `<ol class="steps"><li><b>Appel de confirmation</b><span>Nous vous appelons sous 24h pour confirmer le modèle, la taille et l’adresse.</span></li><li><b>Livraison offerte</b><span>24 à 72 h après l’appel, partout au Maroc, depuis Oujda.</span></li><li><b>Vous ouvrez le colis</b><span>Devant le livreur, avant de payer quoi que ce soit.</span></li><li><b>Vous payez, ou vous refusez</b><span>En espèces au livreur. Si le colis ne vous convient pas, vous le refusez et ne payez rien.</span></li></ol>`;
  const paySteps = () => `<ol class="psteps"><li><b>Appel de confirmation sous 24h</b><span>Nous vérifions avec vous le modèle, la taille et l’adresse.</span></li><li><b>Livraison</b><span>Offerte partout au Maroc, 24 à 72 h après la confirmation.</span></li><li><b>Vous ouvrez devant le livreur</b><span>Vous vérifiez le maillot avant de payer.</span></li><li><b>Vous payez en espèces, ou vous refusez</b><span>Si le colis ne vous convient pas, vous le refusez sans rien payer.</span></li></ol>`;

  function collection(r) {
    const club = r.q.get('club') || 'all', list = filtered(club);
    const title = club === 'barca' ? 'Maillots FC Barcelone au Maroc' : club === 'real' ? 'Maillots Real Madrid au Maroc' : club === 'bayern' ? 'Maillots Bayern Munich au Maroc' : 'Maillots de football 2026/2027';
    const html = `
<section class="page-head on-ink"><div class="wrap">${crumbs([['Accueil', '#/'], [title, '#/maillots']])}
  <h1>${esc(title)}</h1>
  <div class="lead"><p>Reproductions non officielles. Les tailles disponibles sont indiquées sur chaque fiche. Tous les modèles sont à 259 DH, livraison offerte.</p></div>
  <div class="chips" role="group" aria-label="Filtrer par club" style="margin-top:24px">${chips(club, '#/maillots')}</div>
</div></section>
<section class="sec" style="padding-top:clamp(28px,4vw,48px)"><div class="wrap">
  <p class="sr" aria-live="polite">${list.length} modèle${list.length > 1 ? 's' : ''}</p>
  ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : emptyFilter()}
</div></section>${duoBand()}`;
    return { html, title: title + ' | KoraZone', desc: 'Maillots ' + (club === 'all' ? 'Barça, Real Madrid et Bayern' : title.replace('Maillots ', '')) + ' à 259 DH livrés au Maroc. Reproductions non officielles. Vérifiez avant de payer.' };
  }

  /* ---------- fiche produit ---------- */
  let PS = null;
  function galleryItems(slug) {
    const p = P(slug), items = p.photos.map(ph => ({ key: ph.key, shot: ph.shot }));
    K.shots.forEach(s => { if (!items.some(i => i.shot === s)) items.push({ key: null, shot: s }); });
    return items;
  }
  const galItem = (slug, it, o = {}) => it.key ? img(it.key, nameOf(slug) + ' — ' + it.shot.toLowerCase(), Object.assign({ paper: true }, o)) : ph('Photo à fournir : ' + it.shot.toLowerCase(), o);

  function buyHTML() {
    const slug = PS.slug, p = P(slug);
    const others = K.products.filter(x => x.slug !== slug);
    const sizeBtn = (s, sel, forDuo, dslug) => {
      const n = stockOf(dslug || slug, s.s), out = n === 0, low = n != null && n > 0 && n <= K.live.lowThreshold;
      const note = out ? 'épuisée' : low ? 'reste ' + n : '';
      return `<button type="button" class="size ${low ? 'is-low' : ''}" data-act="${forDuo ? 'duo-size' : 'size'}" data-size="${s.s}" aria-pressed="${sel === s.s}" ${out ? 'disabled aria-label="Taille ' + s.s + ' épuisée"' : 'aria-label="Taille ' + s.s + (note ? ', ' + note : '') + '"'}>${s.s}${note ? `<small>${note}</small>` : ''}</button>`;
    };
    const items = PS.duo ? 2 : 1, total = items === 2 ? K.duoTotal : K.price;
    const sizeInfo = PS.size ? (() => { const s = K.sizes.find(x => x.s === PS.size); return `Taille ${s.s} · largeur à plat ${s.w} cm, longueur ${s.l} cm`; })() : (totalStock(slug) == null ? 'Les disponibilités sont confirmées lors de l’appel de confirmation.' : 'Choisissez une taille.');
    return `
<p class="buy-meta">${esc(metaLine(slug))}</p>
<h1>${esc(nameOf(slug))}</h1>
${scarcity(slug, true)}
<div class="price-block"><b>${total} DH</b><span>${items === 2 ? 'les deux maillots, tout compris, réglés au livreur après vérification du colis' : 'tout compris, réglés au livreur après vérification du colis'}</span></div>
<fieldset class="sizes" id="sizes"><legend><span>Taille</span><button type="button" data-act="size-help">Aide à la taille</button></legend>
  <div class="size-row">${K.sizes.map(s => sizeBtn(s, PS.size)).join('')}</div>
</fieldset>
<p class="size-msg ${PS.err ? 'is-err' : ''}" id="size-msg" aria-live="polite">${PS.err ? esc(PS.err) : esc(sizeInfo)}</p>
<div class="duo-box ${PS.duo ? 'is-on' : ''}">
  <button type="button" class="duo-head" data-act="duo-toggle" aria-expanded="${PS.duo}"><span class="duo-check" aria-hidden="true">${PS.duo ? '✓' : ''}</span><span><b>Ajouter un 2e maillot pour 240 DH</b><span>499 DH les deux, un seul colis, la même garantie.</span></span></button>
  ${PS.duo ? `<div class="duo-body">
    <div class="duo-models" role="group" aria-label="Deuxième maillot">${others.map(o => `<button type="button" class="duo-model" data-act="duo-model" data-slug="${o.slug}" aria-pressed="${PS.duoSlug === o.slug}">${productImg(o.slug, { paper: true })}<span>${esc(o.clubShort)} ${esc(o.edition.toLowerCase())}</span></button>`).join('')}</div>
    ${PS.duoSlug ? `<div><p class="eyebrow" style="margin-bottom:8px">Taille du 2e maillot</p><div class="duo-sizes">${K.sizes.map(s => sizeBtn(s, PS.duoSize, true, PS.duoSlug)).join('')}</div></div>` : ''}
  </div>` : ''}
</div>
<div class="buy-cta">
  <button type="button" class="btn btn--primary btn--lg btn--block" id="main-cta" data-act="order">Commander — ${total} DH à la réception</button>
  <a class="btn btn--ghost btn--block" href="${WA_URL}?text=${encodeURIComponent('Bonjour KoraZone, j’ai une question sur le maillot ' + nameOf(slug) + (PS.size ? ', taille ' + PS.size : '') + '. Pouvez-vous m’aider ?')}" target="_blank" rel="noopener">${WA} Une question ? WhatsApp</a>
  <p class="buy-note">Aucun paiement maintenant. Vous réglez en espèces à la réception, après vérification du colis.</p>
</div>
<ul class="promises">${PROMISES}</ul>
<p class="disclosure">« ${DISC} »</p>`;
  }

  function product(r, slug) {
    const p = P(slug); if (!p) return null;
    if (!PS || PS.slug !== slug) PS = { slug, size: null, duo: false, duoSlug: null, duoSize: null, shot: 0, err: '' };
    const pc = PC(slug), items = galleryItems(slug);
    const clubHref = p.clubKey === 'bayern' ? '#/maillots?club=bayern' : '#/maillots?club=' + p.clubKey;
    const qc = K.live.qcDate[slug];
    const details = (pc.table || []).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('') +
      K.details.map(d => `<tr><td>${esc(d[0])}</td><td>${d[1] ? esc(d[1]) : `<span class="ph-inline">[${esc(d[0])} — à fournir, ex. ${esc(d[2])}]</span>`}</td></tr>`).join('');
    const guide = C.pages['guide-des-tailles'];
    const faqs = (pc.faq || []).concat([
      { q: 'Puis-je ouvrir le colis avant de payer ?', a: '<p>Oui. Vous ouvrez le colis devant le livreur et vous vérifiez le maillot. Si vous le refusez à ce moment-là, vous ne payez rien.</p>' },
      { q: 'Quand vais-je recevoir mon maillot ?', a: '<p>Nous vous appelons sous 24h pour confirmer la commande. La livraison est ensuite offerte partout au Maroc, en 24 à 72 h.</p>' }
    ]);
    const xs = K.products.filter(x => x.slug !== slug).sort((a, b) => (b.clubKey === p.clubKey) - (a.clubKey === p.clubKey)).slice(0, 3);
    const html = `
<div class="wrap">${crumbs([['Accueil', '#/'], [p.club, clubHref], [nameOf(slug), '#/maillot/' + slug]])}
<section class="pdp">
  <div>
    <div class="gal-desk">
      <div class="gal-thumbs" role="group" aria-label="Vues du maillot">${items.map((it, i) => `<button type="button" data-act="shot" data-i="${i}" aria-current="${i === PS.shot}" aria-label="Voir : ${esc(it.shot)}">${galItem(slug, it)}</button>`).join('')}</div>
      <div><div class="gal-main" id="gal-main">${galItem(slug, items[PS.shot], { eager: PS.shot === 0 })}</div><p class="gal-cap" id="gal-cap">${esc(items[PS.shot].shot)}${items[PS.shot].key ? '' : ' — photo à fournir'}</p></div>
    </div>
    <div class="gal-mob">
      <div class="gal-track" id="gal-track" tabindex="0" aria-label="Galerie, faites glisser">${items.map((it, i) => `<div class="gal-slide">${galItem(slug, it, { eager: i === 0 })}</div>`).join('')}</div>
      <span class="gal-count" id="gal-count">1 / ${items.length}</span>
    </div>
  </div>
  <div class="buy" id="buy">${buyHTML()}</div>
</section>
<section class="pdp-more" aria-label="Informations détaillées">
  ${acc('Galerie', `<div class="gallery-all">${items.map(it => `<figure>${galItem(slug, it)}<figcaption>${esc(it.shot)}</figcaption></figure>`).join('')}</div>`)}
  ${acc('Détails du produit', `${(pc.story || []).map(s => `<h3>${esc(s.h)}</h3>${s.html}`).join('')}<div class="table-wrap"><table><tbody>${details}</tbody></table></div>`)}
  ${acc('Guide des tailles', `<p>Mesurez un maillot qui vous va déjà, posé à plat et sans étirer le tissu. Comparez sa largeur et sa longueur aux valeurs ci-dessous. Une tolérance de 1 cm est possible pour ces mesures manuelles.</p>${sizeTable(PS.size)}<p>La largeur correspond à la distance d’une aisselle à l’autre. La longueur se mesure du haut de l’épaule au bas du maillot.</p>${pageSection('guide-des-tailles', 'Si vous êtes entre deux tailles') ? '<h3>Si vous êtes entre deux tailles</h3>' + pageSection('guide-des-tailles', 'Si vous êtes entre deux tailles') : ''}<p><button type="button" class="btn btn--ghost" data-act="size-help">Calculer ma taille</button></p>`)}
  ${acc('L’Édition Vérifiée', `<p>Chaque maillot est contrôlé pièce par pièce à Oujda avant l’expédition.</p>${K.qcChecklist ? `<ul class="check">${K.qcChecklist.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : `<ul class="check"><li><span class="ph-inline">[Point de contrôle 1 — à fournir, ex. coutures]</span></li><li><span class="ph-inline">[Point de contrôle 2 — à fournir, ex. blason]</span></li><li><span class="ph-inline">[Point de contrôle 3 — à fournir, ex. mesures à plat]</span></li></ul>`}<div class="qc-stamp"><span class="qc-ring">ÉDITION<br>VÉRIFIÉE</span><span>Contrôlé le ${qc ? esc(new Date(qc).toLocaleDateString('fr-MA')) : '<span class="ph-inline">[date du contrôle qualité]</span>'}</span></div>`)}
  ${acc('Livraison', `${pc.livraison || ''}<p>Heure limite des commandes du jour : ${K.live.cutoff ? esc(K.live.cutoff) : '<span class="ph-inline">[heure limite — à fournir]</span>'}</p>`)}
  ${acc('Paiement et Garantie Colis Ouvert', paySteps())}
  ${acc('Échange de taille sous 7 jours', `${pc.echange || ''}<h3>Comment le demander</h3>${pageSection('contact', 'Pour un échange ou un retour')}<p><a class="btn btn--ghost" href="${WA_URL}?text=${encodeURIComponent('Bonjour KoraZone, je souhaite demander un échange de taille. Ma référence : ')}" target="_blank" rel="noopener">${WA} Demander un échange</a></p>`)}
  ${acc('Questions sur ce maillot', `<div class="faq">${faqs.map(f => acc(f.q, f.a)).join('')}</div>`)}
  ${acc('Avis clients', reviewsBlock(slug))}
  ${acc('Complétez avec…', `<p>Deux maillots dans la même commande : <strong>499 DH au total, livraison comprise</strong>. Le deuxième est à 240 DH.</p><div class="xsell">${xs.map(x => `<div class="xs">${productImg(x.slug, { paper: true })}<a href="#/maillot/${x.slug}">${esc(nameOf(x.slug))}</a><button type="button" data-act="xsell" data-slug="${x.slug}">Ajouter en duo · 240 DH</button></div>`).join('')}</div>`)}
</section>
<p class="disclosure" style="margin-bottom:48px">« ${DISC} »</p>
</div>`;
    const avail = totalStock(slug);
    const ld = { '@context': 'https://schema.org', '@graph': [
      Object.assign({ '@type': 'Product', name: nameOf(slug), sku: slug, description: pc.meta, color: colorOf(slug), image: p.photos.map(x => abs('assets/img/' + x.key + '.jpg')),
        offers: Object.assign({ '@type': 'Offer', price: '259.00', priceCurrency: 'MAD', url: abs('#/maillot/' + slug), seller: { '@type': 'Organization', name: 'KoraZone' } }, avail == null ? {} : { availability: avail > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }) }),
      crumbsLd([['Accueil', '#/'], [p.club, clubHref], [nameOf(slug), '#/maillot/' + slug]])
    ] };
    return { html, title: pc.seoTitle || nameOf(slug), desc: pc.meta, ld, sticky: true, after: afterProduct };
  }

  function afterProduct() {
    const track = $('#gal-track');
    if (track) track.addEventListener('scroll', () => { const i = Math.round(track.scrollLeft / track.clientWidth); $('#gal-count').textContent = (i + 1) + ' / ' + track.children.length; }, { passive: true });
    syncAcc();
  }
  function syncAcc() { $$('.pdp-more > .acc').forEach(d => { if (isDesk()) d.open = true; }); }
  function refreshBuy() { const b = $('#buy'); if (b) b.innerHTML = buyHTML(); stickyPaint(); observeCta(); }

  /* ---------- barre d’achat collante (mobile) ---------- */
  let io = null;
  function stickyPaint() {
    const el = $('#sticky'); if (!PS || !$('#buy')) return;
    const total = PS.duo ? K.duoTotal : K.price;
    el.innerHTML = `<div class="sticky-info"><b>${total} DH</b><span>${esc(P(PS.slug).clubShort + ' ' + P(PS.slug).edition.toLowerCase())} · ${PS.size ? 'Taille ' + PS.size : 'Taille à choisir'}${PS.duo ? ' · duo' : ''}</span></div><button type="button" class="btn btn--primary" data-act="${PS.size ? 'order' : 'goto-sizes'}">${PS.size ? 'Commander' : 'Choisir ma taille'}</button>`;
  }
  function observeCta() {
    const el = $('#sticky'), cta = $('#main-cta');
    if (io) io.disconnect();
    if (!cta) return;
    io = new IntersectionObserver(([e]) => { el.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0); }, { threshold: 0 });
    io.observe(cta);
  }
  function stickyInit(on) {
    const el = $('#sticky');
    if (!on) { el.hidden = true; el.classList.remove('is-on'); if (io) io.disconnect(); return; }
    el.hidden = false; stickyPaint(); observeCta();
  }

  /* ---------- aide à la taille (dialog) ---------- */
  function openSizeHelp() {
    const d = $('#size-dlg'), w0 = 50, l0 = 72;
    const guide = C.pages['guide-des-tailles'];
    const how = guide ? (guide.sections.find(s => s.h === 'Mesurez en deux étapes') || {}).html || '' : '';
    d.innerHTML = `<div class="dlg-head"><h2 id="size-dlg-title">Aide à la taille</h2><button class="dlg-x" data-act="dlg-close" aria-label="Fermer">✕</button></div>
<div class="dlg-body prose">${how}
  <div class="fitter"><label>Largeur à plat (cm)<input id="fit-w" type="number" inputmode="numeric" min="40" max="60" value="${w0}"></label><label>Longueur (cm)<input id="fit-l" type="number" inputmode="numeric" min="60" max="82" value="${l0}"></label></div>
  <div class="fit-out" aria-live="polite"><b id="fit-s">${reco(w0, l0)}</b><span>Taille conseillée pour ces mesures. Une tolérance de 1 cm est possible.</span></div>
  <div id="fit-table">${sizeTable(reco(w0, l0))}</div>
  ${PS && location.hash.indexOf('#/maillot/') === 0 ? `<button class="btn btn--primary btn--block" data-act="fit-apply">Choisir la taille <span id="fit-s2">${reco(w0, l0)}</span></button>` : ''}
</div>`;
    const upd = () => { const s = reco(+$('#fit-w').value || 0, +$('#fit-l').value || 0); $('#fit-s').textContent = s; $('#fit-table').innerHTML = sizeTable(s); const s2 = $('#fit-s2'); if (s2) s2.textContent = s; };
    $('#fit-w').addEventListener('input', upd); $('#fit-l').addEventListener('input', upd);
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }

  /* ---------- commande ---------- */
  const STEPS = [['taille', 'Taille et duo'], ['contact', 'Coordonnées'], ['adresse', 'Adresse'], ['envoi', 'Envoi WhatsApp'], ['confirmation', 'Confirmation']];
  const cart = () => store.get('kz-cart', { items: [] });
  const setCart = c => store.set('kz-cart', c);
  const ord = () => store.get('kz-order', { name: '', phone: '', city: '', cityOther: '', addr: '', notes: '', ref: '' });
  const setOrd = o => store.set('kz-order', o);
  const normPhone = v => String(v || '').replace(/[\s.\-()]/g, '');
  const validPhone = v => /^0[67]\d{8}$/.test(normPhone(v)) || /^\+212[67]\d{8}$/.test(normPhone(v));
  function errorsFor(step, o) {
    const e = {};
    if (step === 'contact') {
      if (o.name.trim().length < 3) e.name = 'Indiquez votre nom complet.';
      if (!validPhone(o.phone)) e.phone = 'Indiquez un numéro marocain valide commençant par 06, 07 ou +212.';
    }
    if (step === 'adresse') {
      if (!o.city) e.city = 'Sélectionnez votre ville.';
      if (o.city === 'Autre ville' && o.cityOther.trim().length < 2) e.cityOther = 'Indiquez le nom de votre ville.';
      if (o.addr.trim().length < 10) e.addr = 'Ajoutez une adresse suffisamment précise pour le livreur.';
    }
    return e;
  }
  const mkRef = () => { const d = new Date(); return 'KZ-' + String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'); };
  function waMessage(c, o) {
    const lines = ['Bonjour KoraZone, je souhaite commander :', 'Référence : ' + o.ref, ''];
    c.items.forEach((it, i) => lines.push((i + 1) + '. ' + nameOf(it.slug) + ' — Taille ' + it.size + ' — ' + priceOf(i) + ' DH'));
    lines.push('', 'Total à régler au livreur : ' + totalOf(c.items) + ' DH (livraison offerte)', '', 'Nom : ' + o.name.trim(), 'Téléphone : ' + normPhone(o.phone), 'Ville : ' + (o.city === 'Autre ville' ? o.cityOther.trim() : o.city), 'Adresse : ' + o.addr.trim());
    if (o.notes.trim()) lines.push('Instructions : ' + o.notes.trim());
    return lines.join('\n');
  }
  const waLink = (c, o) => WA_URL + '?text=' + encodeURIComponent(waMessage(c, o));

  function applyDemo(demo) {
    if (!demo) return;
    setCart({ items: [{ slug: 'barca-domicile', size: 'L' }, { slug: 'real-domicile', size: 'M' }] });
    const full = { name: 'Youssef El Amrani', phone: '06 12 34 56 78', city: 'Casablanca', cityOther: '', addr: 'Maârif, rue Ibnou Mounir, n° 14, 2e étage', notes: '', ref: 'KZ-2509-0417' };
    if (demo === 'errors') setOrd({ name: 'Yo', phone: '06 12', city: '', cityOther: '', addr: 'Maârif', notes: '', ref: '' });
    else if (demo === 'vide') setCart({ items: [] });
    else setOrd(full);
  }

  function order(r) {
    applyDemo(r.q.get('demo'));
    const c = cart(), o = ord();
    let step = r.q.get('etape') || (c.items.length && c.items.every(i => i.size) ? 'contact' : 'taille');
    if (!c.items.length && step !== 'taille') step = 'taille';
    const idx = STEPS.findIndex(s => s[0] === step);
    const showErr = r.q.get('demo') === 'errors' || r.q.get('err') === '1';
    const errs = showErr ? errorsFor(step === 'taille' ? 'contact' : step, o) : {};
    if (step === 'envoi' && !o.ref) { o.ref = mkRef(); setOrd(o); }
    const field = (k, label, input, hint) => `<div class="field ${errs[k] ? 'is-err' : ''}"><label for="f-${k}">${label}</label>${input}<p class="hint" id="h-${k}">${esc(errs[k] || hint || '')}</p></div>`;
    const inAttr = k => `id="f-${k}" data-f="${k}" aria-describedby="h-${k}" ${errs[k] ? 'aria-invalid="true"' : ''}`;
    const errSum = Object.keys(errs).length ? `<div class="err-sum" role="alert" tabindex="-1" id="err-sum">Vérifiez ${Object.keys(errs).length > 1 ? 'les champs suivants' : 'le champ suivant'} :<ul>${Object.keys(errs).map(k => `<li><a href="javascript:void(0)" data-act="focus" data-k="${k}">${esc(errs[k])}</a></li>`).join('')}</ul></div>` : '';
    const total = totalOf(c.items);
    const summary = `<aside class="summary" aria-label="Récapitulatif"><h2>Votre commande</h2>${c.items.length ? c.items.map((it, i) => `<div class="sum-item">${productImg(it.slug, { paper: true })}<div><b>${esc(nameOf(it.slug))}</b><span>Taille ${esc(it.size || '—')}</span></div><span class="pr">${priceOf(i)} DH</span></div>`).join('') : '<p class="sum-row">Aucun maillot pour le moment.</p>'}<div class="sum-row"><span>Livraison</span><span>offerte</span></div><div class="sum-total"><span>Total à régler au livreur</span><b>${total} DH</b></div><p class="sum-row" style="font-size:12.5px">Vous payez en espèces après avoir ouvert le colis devant le livreur.</p></aside>`;
    let body = '';
    if (step === 'taille') {
      body = `<h1>${c.items.length ? 'Vérifiez vos maillots' : 'Choisissez votre maillot'}</h1><p class="lead">Modèles et tailles mélangeables. Le deuxième maillot est à 240 DH : 499 DH les deux, livraison comprise.</p><div class="form">
        ${c.items.map((it, i) => `<div class="item-edit"><div class="item-edit-head">${productImg(it.slug, { paper: true })}<b>${esc(nameOf(it.slug))}</b><button type="button" class="btn btn--ghost" style="margin-left:auto;min-height:44px" data-act="rm-item" data-i="${i}">Retirer</button></div><div class="size-row">${K.sizes.map(s => { const out = stockOf(it.slug, s.s) === 0; return `<button type="button" class="size" data-act="item-size" data-i="${i}" data-size="${s.s}" aria-pressed="${it.size === s.s}" ${out ? 'disabled' : ''}>${s.s}${out ? '<small>épuisée</small>' : ''}</button>`; }).join('')}</div>${!it.size && showErr ? '<p class="size-msg is-err">Choisissez une taille avant de continuer.</p>' : ''}</div>`).join('')}
        ${c.items.length < 2 ? `<div><p class="eyebrow" style="margin-bottom:10px">${c.items.length ? 'Ajouter un 2e maillot · 240 DH' : 'Nos 6 modèles'}</p><div class="pick-list">${K.products.map(p => `<button type="button" class="pick" data-act="add-item" data-slug="${p.slug}" aria-pressed="false">${productImg(p.slug, { paper: true })}<span>${esc(nameOf(p.slug))}</span></button>`).join('')}</div></div>` : ''}
        <div class="order-nav"><button type="button" class="btn btn--primary btn--lg" data-act="step-next" data-from="taille" ${c.items.length ? '' : 'aria-disabled="true"'}>Continuer</button></div></div>`;
    } else if (step === 'contact') {
      body = `<h1>Comment vous joindre ?</h1><p class="lead">Nous vous appelons sous 24h pour confirmer votre commande avant l’expédition.</p><div class="form">${errSum}
        ${field('name', 'Nom complet', `<input ${inAttr('name')} autocomplete="name" value="${esc(o.name)}" placeholder="Nom et prénom">`, 'Le nom à communiquer au livreur.')}
        ${field('phone', 'Téléphone', `<input ${inAttr('phone')} type="tel" inputmode="tel" autocomplete="tel" value="${esc(o.phone)}" placeholder="06 12 34 56 78">`, 'Un numéro marocain : 06 ou 07 suivi de 8 chiffres, ou +212.')}
        <div class="order-nav"><a class="btn btn--ghost btn--lg" href="#/commande?etape=taille">Retour</a><button type="button" class="btn btn--primary btn--lg" data-act="step-next" data-from="contact">Continuer</button></div></div>`;
    } else if (step === 'adresse') {
      body = `<h1>Où souhaitez-vous recevoir vos maillots ?</h1><p class="lead">Livraison offerte partout au Maroc, 24 à 72 h après l’appel de confirmation.</p><div class="form">${errSum}
        <div class="form-row">${field('city', 'Ville', `<select ${inAttr('city')} autocomplete="address-level2"><option value="">Choisissez votre ville</option>${K.cities.map(v => `<option ${o.city === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>`, '')}
        ${o.city === 'Autre ville' ? field('cityOther', 'Nom de la ville', `<input ${inAttr('cityOther')} value="${esc(o.cityOther)}">`, '') : '<div></div>'}</div>
        ${field('addr', 'Adresse complète', `<textarea ${inAttr('addr')} autocomplete="street-address" placeholder="Quartier, rue, numéro, immeuble, étage…">${esc(o.addr)}</textarea>`, 'Le livreur vous appelle avant de passer.')}
        ${field('notes', 'Instructions pour le livreur — facultatif', `<input ${inAttr('notes')} value="${esc(o.notes)}" placeholder="Un point de repère utile">`, '')}
        <div class="order-nav"><a class="btn btn--ghost btn--lg" href="#/commande?etape=contact">Retour</a><button type="button" class="btn btn--primary btn--lg" data-act="step-next" data-from="adresse">Voir le récapitulatif</button></div></div>`;
    } else if (step === 'envoi') {
      const fallback = window.matchMedia('(pointer:fine)').matches || r.q.get('demo') === 'fallback';
      body = `<h1>Envoyez votre commande sur WhatsApp</h1><p class="lead">Le bouton ouvre WhatsApp avec votre commande déjà rédigée. <strong>Elle ne nous parvient qu’une fois que vous appuyez sur Envoyer.</strong></p>
        <p class="eyebrow" style="margin-top:22px">Référence</p><p class="ref">${esc(o.ref)}</p>
        <pre class="msg-preview" aria-label="Message qui sera envoyé">${esc(waMessage(c, o))}</pre>
        <div class="form" style="margin-top:0">
          <a class="btn btn--wa btn--lg btn--block" href="${waLink(c, o)}" target="_blank" rel="noopener" data-act="sent">${WA} Envoyer ma commande sur WhatsApp</a>
          ${fallback ? `<div class="note"><b>Sur ordinateur :</b> le bouton ouvre WhatsApp Web dans un nouvel onglet. Connectez-vous en scannant le code avec votre téléphone, puis appuyez sur Envoyer. Pas de WhatsApp ? Copiez le message et envoyez-le au ${K.waDisplay}.</div>` : ''}
          <div class="order-nav"><a class="btn btn--ghost btn--lg" href="#/commande?etape=adresse">Modifier</a><button type="button" class="btn btn--ghost btn--lg" data-act="copy-msg">Copier le message</button></div>
        </div>`;
    } else {
      body = `<h1>Votre commande est prête dans WhatsApp</h1><p class="lead">Elle ne nous parvient qu’une fois que vous avez appuyé sur <strong>Envoyer</strong> dans WhatsApp. Si la conversation ne s’est pas ouverte, ou si vous l’avez fermée avant l’envoi, rouvrez-la ci-dessous.</p>
        <p class="eyebrow" style="margin-top:22px">Référence</p><p class="ref">${esc(o.ref || '—')}</p>
        <div class="form"><a class="btn btn--wa btn--lg btn--block" href="${waLink(c, o)}" target="_blank" rel="noopener">${WA} Rouvrir WhatsApp</a><button type="button" class="btn btn--ghost btn--block" data-act="copy-msg">Copier le message</button></div>
        <h2 style="font-size:22px;margin:36px 0 16px">Après l’envoi</h2>${paySteps()}
        <p style="margin-top:12px"><a href="#/maillots">Revenir à la boutique</a></p>`;
    }
    const html = `<div class="wrap"><div class="order"><div>
      <p class="prog-label">Étape ${Math.min(idx + 1, 5)} sur 5 · ${esc(STEPS[idx][1])}</p>
      <div class="prog" aria-hidden="true">${STEPS.map((s, i) => `<span class="${i <= idx ? 'on' : ''}"></span>`).join('')}</div>
      ${body}</div>${summary}</div></div>`;
    return { html, title: 'Commande | KoraZone', desc: 'Commandez votre maillot KoraZone : paiement en espèces à la réception, après vérification du colis.', after: () => { const s = $('#err-sum'); if (s) s.focus(); } };
  }

  /* ---------- pages de contenu ---------- */
  const LEGAL = { cgv: 1, confidentialite: 1, 'mentions-legales': 1 };
  function page(r, slug) {
    const pg = C.pages[slug]; if (!pg) return null;
    const legal = LEGAL[slug] ? `<div class="legal-note">[Structure à valider par KoraZone et son conseil. Les champs entre crochets sont à compléter.${slug === 'cgv' ? ' Ce texte décrit un parcours avec panier : il doit être adapté à la commande envoyée sur WhatsApp.' : ''}${slug === 'confidentialite' ? ' Données personnelles traitées selon la loi n° 09-08 : ajoutez le numéro de déclaration ou d’autorisation CNDP.' : ''}]</div>` : '';
    let extra = '';
    if (slug === 'guide-des-tailles') extra = `<p><button type="button" class="btn btn--primary" data-act="size-help">Calculer ma taille</button></p>`;
    if (slug === 'livraison') extra = paySteps();
    const html = `<section class="page-head on-ink"><div class="wrap">${crumbs([['Accueil', '#/'], [pg.title, '#/' + slug]])}<h1>${esc(pg.title)}</h1>${pg.lead ? `<div class="lead">${pg.lead}</div>` : ''}</div></section>
<section class="sec"><div class="wrap narrow prose">${legal}${pg.sections.map(s => `<h2>${esc(s.h)}</h2>${s.html}`).join('')}${extra ? '<div style="margin-top:28px">' + extra + '</div>' : ''}</div></section>`;
    return { html, title: pg.seoTitle || pg.title + ' | KoraZone', desc: pg.meta || '' };
  }
  function faq() {
    const groups = C.faq.map(g => ({ group: g.group, items: g.items.map(i => i.q === 'Les maillots sont-ils officiels ?' ? { q: 'Est-ce un maillot officiel ?', a: i.a + '<p>Une reproduction reprend le dessin du maillot du club, sans licence du club ni de son équipementier. Ce que l’Édition Vérifiée garantit : chaque maillot est contrôlé pièce par pièce à Oujda avant l’expédition, vous ouvrez le colis devant le livreur avant de payer, et vous pouvez demander un échange de taille sous 7 jours.</p>' } : i).concat(K.extraFaq[g.group] || []) }));
    const all = [].concat(...groups.map(g => g.items));
    const html = `<section class="page-head on-ink"><div class="wrap">${crumbs([['Accueil', '#/'], ['Questions fréquentes', '#/faq']])}<h1>${esc(C.faqMeta.title)}</h1></div></section>
<section class="sec faq"><div class="wrap narrow">${groups.map(g => `<h2 style="font-size:clamp(22px,2.4vw,28px);margin:36px 0 12px">${esc(g.group)}</h2>${g.items.map(i => acc(i.q, i.a)).join('')}`).join('')}
<div class="note" style="margin-top:36px">Une autre question ? <a href="${WA_URL}" target="_blank" rel="noopener">Écrivez-nous sur WhatsApp au ${K.waDisplay}</a>.</div></div></section>`;
    const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: all.filter(i => i.a.indexOf('ph-text') < 0).map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() } })) };
    return { html, title: C.faqMeta.seoTitle || 'Questions fréquentes | KoraZone', desc: C.faqMeta.meta, ld };
  }
  function contact() {
    const pg = C.pages.contact;
    const html = `<section class="page-head on-ink"><div class="wrap">${crumbs([['Accueil', '#/'], ['Contact', '#/contact']])}<h1>${esc(pg.title)}</h1>${pg.lead ? `<div class="lead">${pg.lead}</div>` : ''}
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px"><a class="btn btn--wa btn--lg" href="${WA_URL}" target="_blank" rel="noopener">${WA} Écrire au ${K.waDisplay}</a></div></div></section>
<section class="sec"><div class="wrap narrow prose">${pg.sections.map(s => `<h2>${esc(s.h)}</h2>${s.html}`).join('')}${K.email ? '' : '<p><span class="ph-inline">[Email de contact — à fournir]</span></p>'}</div></section>`;
    return { html, title: pg.seoTitle || 'Contact | KoraZone', desc: pg.meta };
  }
  function avis() {
    const pg = C.pages.avis;
    const html = `<section class="page-head on-ink"><div class="wrap">${crumbs([['Accueil', '#/'], ['Avis', '#/avis']])}<h1>${esc(pg.title)}</h1>${pg.lead ? `<div class="lead">${pg.lead}</div>` : ''}</div></section>
<section class="sec"><div class="wrap">${reviewsBlock(null)}<div class="narrow prose" style="margin-top:36px">${pg.sections.map(s => `<h2>${esc(s.h)}</h2>${s.html}`).join('')}</div></div></section>`;
    return { html, title: pg.seoTitle || 'Avis | KoraZone', desc: pg.meta };
  }
  function duoPage() {
    const pg = C.pages.duo;
    const html = `<section class="page-head on-ink"><div class="wrap">${crumbs([['Accueil', '#/'], ['2 maillots à 499 DH', '#/duo']])}<h1>${esc(pg.title)}</h1><div class="lead"><p>Le deuxième maillot est à 240 DH : 499 DH les deux, livraison comprise, un seul colis et la même garantie.</p></div>
  <a class="btn btn--paper btn--lg" href="#/maillots" style="margin-top:24px">Choisir mes deux maillots</a></div></section>
<section class="sec"><div class="wrap"><div class="grid">${K.products.map(card).join('')}</div></div></section>
<section class="sec sec--inset"><div class="wrap narrow prose">${pg.sections.map(s => `<h2>${esc(s.h)}</h2>${s.html}`).join('')}</div></section>`;
    return { html, title: pg.seoTitle || '2 maillots à 499 DH | KoraZone', desc: pg.meta };
  }
  function donnees() {
    const html = `<section class="page-head on-ink"><div class="wrap"><h1>Données à fournir par KoraZone</h1><div class="lead"><p>Chaque donnée ci-dessous apparaît sur le site entre crochets tant qu’elle n’est pas fournie. Les composants de rareté (pièces restantes, clôture du jour) restent masqués sans données réelles.</p></div></div></section>
<section class="sec"><div class="wrap"><div class="table-wrap"><table><thead><tr><th>Donnée</th><th>Où elle apparaît</th><th>Exemple de format</th></tr></thead><tbody>${K.missing.map(m => `<tr><td>${esc(m[0])}</td><td>${esc(m[1])}</td><td><code>${esc(m[2])}</code></td></tr>`).join('')}</tbody></table></div></div></section>`;
    return { html, title: 'Données à fournir | KoraZone', desc: '' };
  }
  function states() {
    const long = 'Maillot FC Barcelone third édition spéciale anniversaire 2026/2027, coupe homme, manches courtes';
    const demoSize = (label, note, attrs, cls) => `<button type="button" class="size ${cls || ''}" ${attrs || ''}>${label}${note ? `<small>${note}</small>` : ''}</button>`;
    const html = `<section class="page-head on-ink"><div class="wrap"><span class="demo-tag">Données de démonstration — page non publiée</span><h1>États de l’interface</h1><div class="lead"><p>Chaque composant avec et sans donnée. Les valeurs chiffrées de cette page sont fictives.</p></div></div></section>
<section class="sec"><div class="wrap state-grid">
  <div class="state"><h3>Chargement</h3><div class="grid" style="grid-template-columns:1fr 1fr"><div class="card"><div class="img img--paper" style="aspect-ratio:1/1"></div><div class="skel" style="width:40%;margin-top:14px"></div><div class="skel" style="width:80%"></div><div class="skel" style="width:30%"></div></div><div class="card"><div class="img img--paper" style="aspect-ratio:1/1"></div><div class="skel" style="width:40%;margin-top:14px"></div><div class="skel" style="width:70%"></div><div class="skel" style="width:30%"></div></div></div></div>
  <div class="state"><h3>Filtre sans résultat</h3>${emptyFilter()}</div>
  <div class="state"><h3>Tailles : sans donnée de stock / avec stock live</h3><p class="size-msg">Sans donnée : aucune mention de rareté.</p><div class="size-row">${K.sizes.map(s => demoSize(s.s, '', 'aria-pressed="false"')).join('')}</div><p class="size-msg" style="margin-top:14px">Avec stock (fictif) : S 5 · M 0 · L 2 · XL 4 · XXL 1</p><div class="size-row">${demoSize('S', '', 'aria-pressed="false"')}${demoSize('M', 'épuisée', 'disabled')}${demoSize('L', 'reste 2', 'aria-pressed="true"', 'is-low')}${demoSize('XL', '', 'aria-pressed="false"')}${demoSize('XXL', 'reste 1', 'aria-pressed="false"', 'is-low')}</div><p class="size-msg is-err" style="margin-top:12px">${(C.states['Taille épuisée'] || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 140) || 'Cette taille est épuisée pour le moment.'}</p></div>
  <div class="state"><h3>Rareté et clôture : masquées sans donnée</h3><p style="font-size:13.5px;color:var(--muted);margin-bottom:12px">Sans donnée live : rien ne s’affiche. Avec donnée (fictive) :</p><div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;background:var(--ink-deep);padding:16px"><span class="scar">Reste 2 pièces</span><span class="scar scar--out">Modèle épuisé</span><span class="cutoff" style="display:flex">Commandes du jour closes dans <b>3 h 40</b></span></div></div>
  <div class="state"><h3>Photo manquante</h3><div style="max-width:260px">${card(P('real-exterieur')).replace('<a ', '<div ').replace(/<\/a>$/, '</div>')}</div></div>
  <div class="state"><h3>Nom de produit très long</h3><div style="max-width:300px"><div class="card" style="border:1px solid var(--hair)">${productImg('barca-third', { paper: true })}<p class="m">FC Barcelone · 2026/2027 · Third</p><h3>${esc(long)}</h3><div class="row"><span class="p">259 DH</span><span class="go">Voir le maillot →</span></div></div></div></div>
  <div class="state"><h3>Erreurs de formulaire</h3><div class="err-sum">Vérifiez les champs suivants :<ul><li>Indiquez votre nom complet.</li><li>Indiquez un numéro marocain valide commençant par 06, 07 ou +212.</li></ul></div><div class="form" style="margin-top:14px"><div class="field is-err"><label>Téléphone</label><input value="06 12" aria-invalid="true"><p class="hint">Indiquez un numéro marocain valide commençant par 06, 07 ou +212.</p></div></div><p style="margin-top:10px"><a href="#/commande?demo=errors&amp;etape=contact">Voir dans le parcours →</a></p></div>
  <div class="state"><h3>WhatsApp non installé (ordinateur)</h3><div class="note"><b>Sur ordinateur :</b> le bouton ouvre WhatsApp Web dans un nouvel onglet. Connectez-vous en scannant le code avec votre téléphone, puis appuyez sur Envoyer. Pas de WhatsApp ? Copiez le message et envoyez-le au ${K.waDisplay}.</div><p style="margin-top:10px"><a href="#/commande?demo=fallback&amp;etape=envoi">Voir dans le parcours →</a></p></div>
  <div class="state"><h3>Avis : vide / avec avis réels</h3>${reviewsBlock('barca-domicile')}<div class="reviews" style="margin-top:12px"><article class="review"><p class="review-meta">[Ville] · Taille [L] · [Taille conforme]</p><p>[Texte de l’avis tel que publié par le client]</p></article></div></div>
  <div class="state"><h3>Page introuvable</h3><div class="prose">${C.states['Page introuvable'] || '<p>Cette page n’existe pas ou n’est plus disponible.</p>'}</div></div>
</div></section>`;
    return { html, title: 'États | KoraZone', desc: '' };
  }
  function notFound() {
    return { html: `<section class="page-head on-ink"><div class="wrap"><h1>Page introuvable</h1><div class="lead">${C.states['Page introuvable'] || ''}</div><a class="btn btn--paper btn--lg" href="#/maillots" style="margin-top:24px">Voir tous les maillots</a></div></section>`, title: 'Page introuvable | KoraZone', desc: '' };
  }

  /* ================= ROUTEUR ================= */
  const routes = [
    [/^\/$/, home], [/^\/maillots$/, collection], [/^\/maillot\/([\w-]+)$/, product], [/^\/commande$/, order],
    [/^\/faq$/, faq], [/^\/contact$/, contact], [/^\/avis$/, avis], [/^\/duo$/, duoPage], [/^\/etats$/, states], [/^\/donnees$/, donnees],
    [/^\/(guide-des-tailles|livraison|echanges|a-propos|guide-editions|cgv|confidentialite|mentions-legales)$/, page]
  ];
  const parse = () => { const h = location.hash.replace(/^#/, '') || '/'; const i = h.indexOf('?'); return { path: i < 0 ? h : h.slice(0, i), q: new URLSearchParams(i < 0 ? '' : h.slice(i + 1)) }; };
  let lastPath = null;
  function render() {
    const r = parse();
    let out = null;
    for (const [re, fn] of routes) { const m = r.path.match(re); if (m) { out = fn(r, ...m.slice(1)); break; } }
    if (!out) out = notFound();
    main.innerHTML = out.html;
    document.body.className = (out.bodyClass || '') + ($('#rail').hidden ? '' : ' has-rail');
    document.documentElement.classList.toggle('snap', out.bodyClass === 'is-home');
    setMeta(out);
    const samePage = r.path === lastPath;
    if (!samePage) { window.scrollTo(0, 0); if (lastPath !== null) main.focus({ preventScroll: true }); }
    lastPath = r.path;
    const key = r.path === '/maillots' ? (r.q.get('club') || 'maillots') : r.path.replace(/^\//, '').replace(/^maillot\/bayern.*/, 'bayern');
    $$('.nav a').forEach(a => a.setAttribute('aria-current', a.dataset.nav === key ? 'page' : 'false'));
    closeMenu();
    stickyInit(!!out.sticky);
    if (out.after) out.after();
    fitTitles();
    if (window.KZMotion) window.KZMotion.rendered();
  }

  /* ---------- titres : deux lignes au plus à partir de 768 px ---------- */
  function fitTitles() {
    $$('main h1').forEach(h => {
      h.style.fontSize = '';
      if (innerWidth < 768 || !h.offsetParent) return;
      let size = parseFloat(getComputedStyle(h).fontSize);
      while (h.getBoundingClientRect().height > parseFloat(getComputedStyle(h).lineHeight) * 2.5 && size > 24) {
        size -= 1; h.style.fontSize = size + 'px';
      }
    });
  }
  let fitFrame = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitTitles); });
  if (document.fonts) document.fonts.ready.then(fitTitles);

  /* ---------- menu, rail ---------- */
  function openMenu() { $('#menu').hidden = false; $('#burger').setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('#menu-close').focus(); }
  function closeMenu() { if ($('#menu').hidden) return; $('#menu').hidden = true; $('#burger').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  function rail(show) { $('#rail').hidden = !show; $('#rail-tab').hidden = show; document.documentElement.classList.toggle('rail-on', show); document.body.classList.toggle('has-rail', show); try { localStorage.setItem('kz-rail', show ? '1' : '0'); } catch (e) {} }

  /* ---------- actions ---------- */
  const ACT = {
    size(el) { PS.size = el.dataset.size; PS.err = ''; refreshBuy(); },
    'duo-toggle'() { PS.duo = !PS.duo; if (PS.duo && !PS.duoSlug) { const o = K.products.find(x => x.slug !== PS.slug && x.photos.length); PS.duoSlug = o.slug; } PS.err = ''; refreshBuy(); },
    'duo-model'(el) { PS.duoSlug = el.dataset.slug; refreshBuy(); },
    'duo-size'(el) { PS.duoSize = el.dataset.size; PS.err = ''; refreshBuy(); },
    xsell(el) { PS.duo = true; PS.duoSlug = el.dataset.slug; refreshBuy(); window.scrollTo({ top: $('#buy').getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); },
    order() {
      if (!PS.size) { PS.err = 'Choisissez une taille avant de commander ce maillot.'; refreshBuy(); ACT['goto-sizes'](); return; }
      if (PS.duo && !PS.duoSize) { PS.err = 'Choisissez la taille du deuxième maillot pour compléter votre duo.'; refreshBuy(); return; }
      const items = [{ slug: PS.slug, size: PS.size }]; if (PS.duo) items.push({ slug: PS.duoSlug, size: PS.duoSize });
      setCart({ items }); location.hash = '#/commande?etape=contact';
    },
    'goto-sizes'() { const s = $('#sizes'); if (s) window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 100, behavior: 'smooth' }); },
    shot(el) {
      PS.shot = +el.dataset.i; const items = galleryItems(PS.slug), it = items[PS.shot];
      $('#gal-main').innerHTML = galItem(PS.slug, it, { eager: true });
      $('#gal-cap').textContent = it.shot + (it.key ? '' : ' — photo à fournir');
      $$('.gal-thumbs button').forEach((b, i) => b.setAttribute('aria-current', i === PS.shot));
    },
    'size-help'() { openSizeHelp(); },
    'dlg-close'() { $('#size-dlg').close(); },
    'fit-apply'() { PS.size = $('#fit-s').textContent; PS.err = ''; $('#size-dlg').close(); refreshBuy(); },
    'item-size'(el) { const c = cart(); c.items[+el.dataset.i].size = el.dataset.size; setCart(c); render(); },
    'rm-item'(el) { const c = cart(); c.items.splice(+el.dataset.i, 1); setCart(c); render(); },
    'add-item'(el) { const c = cart(); if (c.items.length < 2) c.items.push({ slug: el.dataset.slug, size: null }); setCart(c); render(); },
    'step-next'(el) {
      const from = el.dataset.from, next = { taille: 'contact', contact: 'adresse', adresse: 'envoi' }[from];
      if (from === 'taille') { const c = cart(); if (!c.items.length || c.items.some(i => !i.size)) { location.hash = '#/commande?etape=taille&err=1'; render(); return; } }
      else { const e = errorsFor(from, ord()); if (Object.keys(e).length) { const h = '#/commande?etape=' + from + '&err=1'; if (location.hash === h) render(); else location.hash = h; return; } }
      location.hash = '#/commande?etape=' + next;
    },
    sent() { setTimeout(() => { location.hash = '#/commande?etape=confirmation'; }, 500); return true; },
    'copy-msg'(el) { const t = waMessage(cart(), ord()); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { el.textContent = 'Message copié'; }).catch(() => { el.textContent = 'Copie impossible : sélectionnez le message'; }); },
    focus(el) { const f = $('#f-' + el.dataset.k); if (f) f.focus(); }
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a || !ACT[a.dataset.act]) return;
    if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    const keep = ACT[a.dataset.act](a, e);
    if (!keep && a.tagName === 'A') e.preventDefault();
  });
  document.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.f; if (!k) return;
    const o = ord(); o[k] = e.target.value; setOrd(o);
    const f = e.target.closest('.field'); if (f && f.classList.contains('is-err')) { const err = errorsFor(k === 'name' || k === 'phone' ? 'contact' : 'adresse', o)[k]; if (!err) { f.classList.remove('is-err'); e.target.removeAttribute('aria-invalid'); } }
    if (k === 'city') render();
  });
  $('#burger').addEventListener('click', openMenu);
  $('#menu-close').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $('#rail-hide').addEventListener('click', () => rail(false));
  $('#rail-tab').addEventListener('click', () => rail(true));
  window.matchMedia('(min-width:1024px)').addEventListener('change', syncAcc);
  window.addEventListener('hashchange', () => (window.KZMotion ? window.KZMotion.navigate(render) : render()));

  let railPref = '1'; try { railPref = localStorage.getItem('kz-rail') || '1'; } catch (e) {}
  rail(railPref !== '0');
  const qs = new URLSearchParams(location.search);
  if (qs.get('menu') === '1') setTimeout(openMenu, 50);
  paintCutoff(); setInterval(paintCutoff, 30000);
  render();
})();
