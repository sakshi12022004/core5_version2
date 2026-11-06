/* ==========================================================================
   Core5 · Diwali 2026 — "Lighting up the future"
   Decorations, interactions and the first-visit intro.
   Loaded only by diwali.config.js while the layer is active. The fireworks
   engine (diwali.fx.js) loads just before this file and is optional here.
   Everything added is tracked so teardown() restores the original page.
   No existing element is edited, moved or restyled.
   ========================================================================== */
(function (w, d) {
  'use strict';

  var API = w.C5_DIWALI;
  if (!API || !API.isActive() || d.documentElement.classList.contains('c5-diwali')) return;

  var cfg = API.config;
  var F = cfg.FEATURES || {};
  var G = cfg.GREETING || {};

  function mq(q) { return !!(w.matchMedia && w.matchMedia(q).matches); }
  var reduceMotion = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var mobile = w.innerWidth < 768;

  var added = [];
  var undo = [];
  function put(parent, node, before) { parent.insertBefore(node, before || null); added.push(node); return node; }
  function make(tag, cls, html) {
    var n = d.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function deco(cls, html) { var n = make('div', cls, html); n.setAttribute('aria-hidden', 'true'); return n; }
  function on(t, type, fn, o) { t.addEventListener(type, fn, o); undo.push(function () { t.removeEventListener(type, fn, o); }); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function fx() { return API.fx || null; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Places a decoration layer inside a section without changing its layout.
     Positioned sections get the layer directly; static ones get a zero-height anchor. */
  function layerIn(host, cls, html) {
    var layer = deco(cls, html);
    if (getComputedStyle(host).position !== 'static') { layer.classList.add('c5d-fill'); put(host, layer); return layer; }
    var anchor = deco('c5d-anchor');
    anchor.appendChild(layer);
    put(host, anchor, host.firstChild);
    return layer;
  }

  /* ======================= Artwork ======================= */

  var DEFS =
    '<svg xmlns="http://www.w3.org/2000/svg" class="c5d-defs" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="c5d-g-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6a13"/><stop offset=".42" stop-color="#ffab2e"/><stop offset=".82" stop-color="#ffe39a"/><stop offset="1" stop-color="#fff6dc"/></linearGradient>' +
      '<radialGradient id="c5d-g-halo"><stop offset="0" stop-color="#ffc35a" stop-opacity=".62"/><stop offset=".45" stop-color="#f0b020" stop-opacity=".2"/><stop offset="1" stop-color="#f0b020" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="c5d-g-clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9682b"/><stop offset=".55" stop-color="#9a4318"/><stop offset="1" stop-color="#5e230d"/></linearGradient>' +
      '<linearGradient id="c5d-g-rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9781c"/><stop offset=".5" stop-color="#ffd27a"/><stop offset="1" stop-color="#c9932a"/></linearGradient>' +
      '<radialGradient id="c5d-g-petal" cx=".5" cy=".85" r=".9"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".55"/><stop offset=".6" stop-color="#e86a8a" stop-opacity=".22"/><stop offset="1" stop-color="#e86a8a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="c5d-g-lantern" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9622a"/><stop offset=".5" stop-color="#f59a32"/><stop offset=".85" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffeab0"/></linearGradient>' +
      '<radialGradient id="c5d-g-lglow"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9a3c" stop-opacity=".14"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>' +
      /* ---- floral installation: marigold, jasmine, mango leaf, brass and gold ---- */
      '<radialGradient id="c5d-g-mgo" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#ffcf4a"/><stop offset=".45" stop-color="#f8a01d"/><stop offset=".8" stop-color="#e2700e"/><stop offset="1" stop-color="#b5440b"/></radialGradient>' +
      '<radialGradient id="c5d-g-mgy" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#fff3a0"/><stop offset=".45" stop-color="#ffd12e"/><stop offset=".8" stop-color="#f0aa0a"/><stop offset="1" stop-color="#c58300"/></radialGradient>' +
      '<radialGradient id="c5d-g-jas" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f6f1e2"/><stop offset="1" stop-color="#d9cfb0"/></radialGradient>' +
      '<linearGradient id="c5d-g-leaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#245a32"/><stop offset=".5" stop-color="#4f9a55"/><stop offset="1" stop-color="#1f4d2b"/></linearGradient>' +
      '<radialGradient id="c5d-g-gold" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#e8b437"/><stop offset="1" stop-color="#8c5f12"/></radialGradient>' +
      '<linearGradient id="c5d-g-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5110"/><stop offset=".35" stop-color="#f6d27a"/><stop offset=".62" stop-color="#d2a040"/><stop offset="1" stop-color="#6e4a0e"/></linearGradient>' +
      '<g id="c5d-bead"><circle r="2.3" fill="url(#c5d-g-gold)"/><circle cx="-.7" cy="-.8" r=".7" fill="#fff6d6"/></g>' +
      '<g id="c5d-bellshape"><circle cy="-1" r="2" fill="none" stroke="url(#c5d-g-brass)" stroke-width="1.1"/><path d="M0 1C4.4 1 5.6 5 5.9 9C6.1 12 7.6 13.6 8.6 15H-8.6C-7.6 13.6-6.1 12-5.9 9C-5.6 5-4.4 1 0 1Z" fill="url(#c5d-g-brass)"/><ellipse cy="15" rx="8.6" ry="1.7" fill="#7a5410"/><circle cy="17.2" r="1.7" fill="#a8741c"/><path d="M-3 4C-4 7-4.4 10-4.6 12" stroke="#fff3c8" stroke-width="1" opacity=".55" fill="none" stroke-linecap="round"/></g>' +
      '<g id="c5d-ornshape"><circle r="1.6" fill="url(#c5d-g-gold)"/><path d="M0 2C4.6 7 5.6 12.5 0 19C-5.6 12.5-4.6 7 0 2Z" fill="url(#c5d-g-gold)"/><path d="M0 4.5C2.2 8 2.6 12 0 16C-2.6 12-2.2 8 0 4.5Z" fill="none" stroke="#fff1b8" stroke-width=".5" opacity=".7"/><circle cy="21" r="1.9" fill="#fffaf0"/></g>' +
      '<radialGradient id="c5d-g-redpom" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#ff6b81"/><stop offset=".45" stop-color="#dc2626"/><stop offset=".8" stop-color="#b91c1c"/><stop offset="1" stop-color="#7f1d1d"/></radialGradient>' +
      '<g id="c5d-red-pom"><circle r="10.5" fill="url(#c5d-g-redpom)"/><circle r="9.6" fill="none" stroke="#991b1b" stroke-width="2.2" stroke-dasharray="1.5 1.1" opacity=".7"/><circle r="7.6" fill="none" stroke="#b91c1c" stroke-width="2.6" stroke-dasharray="1.4 .9"/><circle r="5.2" fill="none" stroke="#dc2626" stroke-width="2.4" stroke-dasharray="1.2 .8"/><circle r="2.8" fill="#f87171"/><circle r="1.2" fill="#7f1d1d"/><ellipse cx="-3.4" cy="-3.8" rx="3.5" ry="2" fill="#fca5a5" opacity=".35"/></g>' +
      '<g id="c5d-white-tube"><rect x="-3" y="0" width="6" height="28" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width=".5"/><circle cx="0" cy="5" r="3.2" fill="#ffffff" stroke="#cbd5e1" stroke-width=".4"/><circle cx="0" cy="12" r="3.2" fill="#ffffff" stroke="#cbd5e1" stroke-width=".4"/><circle cx="0" cy="19" r="3.2" fill="#ffffff" stroke="#cbd5e1" stroke-width=".4"/><circle cx="0" cy="25" r="3.2" fill="#ffffff" stroke="#cbd5e1" stroke-width=".4"/></g>' +
      '<g id="c5d-leaf-cluster"><path d="M0 0C5 3 6 10 0 15C-6 10-5 3 0 0Z" fill="url(#c5d-g-leaf)" transform="rotate(-36)"/><path d="M0 0C5 3 6 10 0 15C-6 10-5 3 0 0Z" fill="url(#c5d-g-leaf)" transform="rotate(36)"/><circle r="1.8" fill="#ca8a04"/></g>' +
      '<g id="c5d-chakra"><line x1="0" y1="-34" x2="0" y2="0" stroke="#d4af37" stroke-width="1.2"/><circle cx="0" cy="-32" r="2.5" fill="#f59e0b"/><circle cx="0" cy="-16" r="3" fill="#dc2626"/><circle r="34" fill="#fffdf5" stroke="#f59e0b" stroke-width="2" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"/><circle r="31" fill="none" stroke="#d97706" stroke-width=".8" stroke-dasharray="2 1.5"/><circle r="20" fill="#fff9eb" stroke="#ca8a04" stroke-width=".8"/><g transform="rotate(0)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#ea580c"/></g><g transform="rotate(30)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#1d4ed8"/></g><g transform="rotate(60)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#dc2626"/></g><g transform="rotate(90)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#eab308"/></g><g transform="rotate(120)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#ea580c"/></g><g transform="rotate(150)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#1d4ed8"/></g><g transform="rotate(180)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#dc2626"/></g><g transform="rotate(210)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#eab308"/></g><g transform="rotate(240)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#ea580c"/></g><g transform="rotate(270)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#1d4ed8"/></g><g transform="rotate(300)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#dc2626"/></g><g transform="rotate(330)"><path d="M0 -6 C4 -11 7 -16 0 -19 C-4 -16 -2 -11 0 -6 Z" fill="#eab308"/></g><circle r="6.5" fill="#fbbf24" stroke="#b45309" stroke-width="1"/><circle r="2.8" fill="#b91c1c"/><circle cx="34" cy="0" r="3.2" fill="#dc2626"/><circle cx="30.7" cy="14.6" r="3.2" fill="#f59e0b"/><circle cx="21.6" cy="26.3" r="3.2" fill="#16a34a"/><circle cx="8.8" cy="32.8" r="3.2" fill="#dc2626"/><circle cx="-5.3" cy="33.6" r="3.2" fill="#f59e0b"/><circle cx="-18.8" cy="28.3" r="3.2" fill="#16a34a"/><circle cx="-29.2" cy="17.5" r="3.2" fill="#dc2626"/><circle cx="-33.9" cy="3.6" r="3.2" fill="#f59e0b"/><circle cx="-32.1" cy="-11.2" r="3.2" fill="#16a34a"/><circle cx="-24.3" cy="-23.8" r="3.2" fill="#dc2626"/><circle cx="-12.3" cy="-31.7" r="3.2" fill="#f59e0b"/><circle cx="1.8" cy="-33.9" r="3.2" fill="#16a34a"/><circle cx="15.7" cy="-30.2" r="3.2" fill="#dc2626"/><circle cx="27.1" cy="-20.6" r="3.2" fill="#f59e0b"/><circle cx="33.2" cy="-7.4" r="3.2" fill="#16a34a"/><line x1="0" y1="34" x2="0" y2="56" stroke="#d4af37" stroke-width="1.2"/><circle cx="0" cy="40" r="2.8" fill="#f59e0b"/><circle cx="0" cy="48" r="3" fill="#16a34a"/><path d="M0 56 C3 62 5 69 0 73 C-5 69 -3 62 0 56 Z" fill="#dc2626"/><circle cx="0" cy="56" r="2.2" fill="#fbbf24"/></g>' +
      '<g id="c5d-brass-deepam"><circle cy="-12" r="4.2" fill="none" stroke="url(#c5d-g-brass)" stroke-width="1.6"/><line x1="0" y1="-8" x2="0" y2="44" stroke="url(#c5d-g-brass)" stroke-width="1.5" stroke-dasharray="3 1.5"/><path d="M-8 8 C-7 14 7 14 8 8 Z" fill="url(#c5d-g-brass)"/><ellipse cx="0" cy="8" rx="8" ry="2" fill="#ffe066"/><circle cx="0" cy="6" r="2" fill="#ff9900" opacity=".8"/><path d="M0 2 C1.2 4 1.5 6 0 7 C-1.5 6 -1.2 4 0 2 Z" fill="#ffffff" class="c5d-fl-flame"/><path d="M-10 24 C-9 31 9 31 10 24 Z" fill="url(#c5d-g-brass)"/><ellipse cx="0" cy="24" rx="10" ry="2.2" fill="#ffe066"/><circle cx="0" cy="22" r="2.5" fill="#ff9900" opacity=".8"/><path d="M0 17 C1.5 20 1.8 22 0 23 C-1.8 22 -1.5 20 0 17 Z" fill="#ffffff" class="c5d-fl-flame"/><path d="M-12 40 C-10 49 10 49 12 40 Z" fill="url(#c5d-g-brass)"/><ellipse cx="0" cy="40" rx="12" ry="2.5" fill="#ffe066"/><circle cx="0" cy="38" r="2.8" fill="#ff9900" opacity=".8"/><path d="M0 32 C1.8 35 2 38 0 39 C-2 38 -1.8 35 0 32 Z" fill="#ffffff" class="c5d-fl-flame"/><path d="M-4 48 L4 48 L2 54 L-2 54 Z" fill="url(#c5d-g-brass)"/><circle cx="0" cy="57" r="2.5" fill="url(#c5d-g-gold)"/></g>' +
      '</defs></svg>';

  /* Clay diya, lip on the right; flame on the wick at the lip. */
  function diyaSVG(extraClass, style) {
    return '<svg class="c5d-diya ' + (extraClass || '') + '"' + (style ? ' style="' + style + '"' : '') +
      ' viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<circle class="c5d-diya__halo" cx="47" cy="23" r="24" fill="url(#c5d-g-halo)"/>' +
      '<g class="c5d-diya__flame">' +
        '<path d="M47 9c4.6 7.4 8.6 12.6 7.4 19.6-.9 5.2-4.1 7.6-7.4 7.6s-6.5-2.4-7.4-7.6C38.4 21.6 42.4 16.4 47 9z" fill="url(#c5d-g-flame)"/>' +
        '<path d="M47 19c2 3.6 3.6 6.4 3 9.8-.4 2.5-1.6 3.6-3 3.6s-2.6-1.1-3-3.6c-.6-3.4 1-6.2 3-9.8z" fill="#fffaf0" opacity=".88"/>' +
      '</g>' +
      '<path d="M47 34.6v2.4" stroke="#2b1004" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M5 37c10 2.2 38 2.4 54-3.6-1.6 10.2-12 17.8-27 17.8C17.6 51.2 7.4 45.4 5 37z" fill="url(#c5d-g-clay)"/>' +
      '<path d="M8 41.6c8 4.6 24 5.4 38 1.6" fill="none" stroke="#f0b020" stroke-width=".7" stroke-dasharray="1.2 2.6" stroke-linecap="round" opacity=".9"/>' +
      '<g fill="#f6c35a" opacity=".9"><circle cx="20" cy="46.2" r="1"/><circle cx="27" cy="47.6" r="1.1"/><circle cx="34" cy="47.6" r="1.1"/><circle cx="41" cy="46.4" r="1"/></g>' +
      '<path d="M5 37c10 2.2 38 2.4 54-3.6" fill="none" stroke="url(#c5d-g-rim)" stroke-width="1.8" stroke-linecap="round"/>' +
      '<ellipse cx="32" cy="52.4" rx="9.5" ry="1.9" fill="#3d1607"/>' +
    '</svg>';
  }

  /* Sky lantern (kandil): paper body lit from inside. */
  function lanternSVG() {
    // Wider at the top like a paper sky lantern, lit from the flame at its open base.
    return '<svg class="c5d-lantern__svg" viewBox="0 0 40 60" aria-hidden="true" focusable="false">' +
      '<circle cx="20" cy="34" r="22" fill="url(#c5d-g-lglow)"/>' +
      '<path d="M7 9.5C13 6.5 27 6.5 33 9.5C34.4 22 32.6 33 28.6 43.4C23 45.2 17 45.2 11.4 43.4C7.4 33 5.6 22 7 9.5Z" fill="url(#c5d-g-lantern)"/>' +
      '<path d="M13.4 8.2C12.6 21 13.4 33 15.6 44.6M26.6 8.2C27.4 21 26.6 33 24.4 44.6" fill="none" stroke="#c0601f" stroke-width=".5" opacity=".45"/>' +
      '<path d="M7.4 21C15 23 25 23 32.6 21" fill="none" stroke="#c0601f" stroke-width=".45" opacity=".35"/>' +
      '<ellipse cx="20" cy="43.6" rx="8.6" ry="1.8" fill="#fff1c9"/>' +
      '<path d="M20 36.5c1.6 2.4 2.4 4 2 5.6-.3 1.2-1 1.6-2 1.6s-1.7-.4-2-1.6c-.4-1.6.4-3.2 2-5.6z" fill="#fff8e6"/>' +
    '</svg>';
  }

  /* Rangoli: lotus centre, star lattice, double lotus petals, scalloped ring,
     a ring of paisleys (kalka) and an outer dot border. Every line can draw itself. */
  function rangoliSVG(extraClass) {
    var i, a, s = '';
    var D = ' pathLength="1"';
    function ring(delay, inner) { return '<g style="--rd:' + delay + 's">' + inner + '</g>'; }

    // centre lotus + bindu
    var c = '<circle class="c5d-rg-draw" r="9"' + D + '/>';
    for (i = 0; i < 8; i++) c += '<path class="c5d-rg-draw c5d-rg-fill" d="M0-10C5-13 5-18 0-21C-5-18-5-13 0-10Z" transform="rotate(' + (i * 45) + ')"' + D + '/>';
    c += '<circle class="c5d-rg-fade c5d-rg-dot--warm" r="3.4"/>';
    // star lattice
    var st = '<circle class="c5d-rg-draw" r="25"' + D + '/>' +
      '<rect class="c5d-rg-draw" x="-21" y="-21" width="42" height="42"' + D + '/>' +
      '<rect class="c5d-rg-draw" x="-21" y="-21" width="42" height="42" transform="rotate(45)"' + D + '/>';
    for (i = 0; i < 16; i++) st += '<circle class="c5d-rg-fade c5d-rg-dot" r=".9" cy="-30" transform="rotate(' + (i * 22.5) + ')"/>';
    // double lotus petals + leaves
    var lp = '';
    for (i = 0; i < 8; i++) {
      a = i * 45;
      lp += '<path class="c5d-rg-draw" d="M0-35C19-43 19-58 0-64C-19-58-19-43 0-35Z" transform="rotate(' + a + ')"' + D + '/>';
      lp += '<path class="c5d-rg-draw c5d-rg-fill" d="M0-40C11-46 11-55 0-59C-11-55-11-46 0-40Z" transform="rotate(' + a + ')"' + D + '/>';
      lp += '<path class="c5d-rg-draw c5d-rg-thin" d="M0-38C5-44 5-50 0-55C-5-50-5-44 0-38Z" transform="rotate(' + (a + 22.5) + ')"' + D + '/>';
      lp += '<circle class="c5d-rg-fade c5d-rg-dot--rose" r="1.5" cy="-47" transform="rotate(' + a + ')"/>';
    }
    // scalloped ring
    var sc = 'M0-66', N = 32;
    for (i = 1; i <= N; i++) {
      var a1 = (i - .5) / N * Math.PI * 2, a2 = i / N * Math.PI * 2;
      sc += 'Q' + (Math.sin(a1) * 71.5).toFixed(2) + ' ' + (-Math.cos(a1) * 71.5).toFixed(2) + ' ' + (Math.sin(a2) * 66).toFixed(2) + ' ' + (-Math.cos(a2) * 66).toFixed(2);
    }
    var sr = '<path class="c5d-rg-draw" d="' + sc + 'Z"' + D + '/>';
    // paisleys
    var pa = '';
    for (i = 0; i < 16; i++) {
      a = i * 22.5;
      pa += '<g transform="rotate(' + a + ')"><path class="c5d-rg-draw" d="M0-75C-8-77-10-85-5-90C-1-94 6-92 6-87C6-83 2-82 0-84"' + D + '/>' +
        '<circle class="c5d-rg-fade ' + (i % 2 ? 'c5d-rg-dot' : 'c5d-rg-dot--warm') + '" r="1.3" cx="-2" cy="-82"/></g>';
    }
    // outer dot border
    var dt = '';
    for (i = 0; i < 64; i++) {
      dt += '<circle class="c5d-rg-fade ' + (i % 4 === 0 ? 'c5d-rg-dot--warm' : 'c5d-rg-dot') + '" r="' + (i % 4 === 0 ? 1.5 : .8) +
        '" cy="-96" transform="rotate(' + (i * 5.625) + ')"/>';
    }
    return '<svg class="c5d-rangoli ' + (extraClass || '') + '" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">' +
      '<g class="c5d-rg-outer">' + ring(1.1, sr) + ring(1.4, pa) + ring(1.8, dt) + '</g>' +
      '<g class="c5d-rg-inner">' + ring(0, c) + ring(.3, st) + ring(.65, lp) + '</g>' +
    '</svg>';
  }

  function lanterns(count, cls) {
    var h = '';
    for (var i = 0; i < count; i++) {
      h += '<span class="c5d-lantern ' + (cls || '') + '" style="--x:' + rnd(4, 92).toFixed(1) + '%;--d:' + rnd(26, 38).toFixed(1) +
        's;--delay:-' + rnd(0, 30).toFixed(1) + 's;--s:' + rnd(.7, 1.15).toFixed(2) + ';--sw:' + rnd(5, 8).toFixed(1) + 's">' +
        '<span class="c5d-lantern__sway">' + lanternSVG() + '</span></span>';
    }
    return h;
  }

  /* ======================= Interactions ======================= */

  /* Reveal on scroll: rangoli draws itself, accents fade in. */
  var revealIO = 'IntersectionObserver' in w ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { threshold: .2 }) : null;
  if (revealIO) undo.push(function () { revealIO.disconnect(); });
  function reveal(el) { if (!revealIO || reduceMotion) el.classList.add('is-in'); else revealIO.observe(el); }

  /* Proximity glow for diyas and rangoli (mouse only, one rAF-throttled listener). */
  var prox = [];
  function proximity(el, radius) { prox.push({ el: el, r: radius || 220 }); }
  if (finePointer && !reduceMotion) {
    var mx = -1e4, my = -1e4, mq2 = false;
    on(d, 'pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!mq2) {
        mq2 = true;
        w.requestAnimationFrame(function () {
          mq2 = false;
          for (var i = 0; i < prox.length; i++) {
            var r = prox[i].el.getBoundingClientRect();
            if (r.bottom < -200 || r.top > w.innerHeight + 200) continue;
            var dist = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
            var near = Math.max(0, 1 - Math.max(0, dist - Math.min(r.width, r.height) * .35) / prox[i].r);
            prox[i].el.style.setProperty('--near', near.toFixed(3));
          }
        });
      }
    }, { passive: true });
  }

  /* The surprise: a diya flares, sparks rise, and its flame becomes a rocket. */
  var lastCelebrate = 0;
  function celebrate(diya) {
    var now = Date.now();
    if (now - lastCelebrate < 1100) return;
    lastCelebrate = now;
    diya.classList.remove('is-flare'); void diya.getBoundingClientRect(); diya.classList.add('is-flare');
    setTimeout(function () { diya.classList.remove('is-flare'); }, 1400);
    var f = fx();
    if (!f) return;
    var r = diya.getBoundingClientRect();
    var x = r.left + r.width * .73, y = r.top + r.height * .3;
    f.sparkle(x, y, 22);
    var top = Math.max(110, y - rnd(220, 340));
    setTimeout(function () { f.launch(x, y - 6, x + rnd(-60, 60), top, 'chrysanthemum', mobile ? .8 : 1); }, 180);
    setTimeout(function () { f.launch(x, y - 6, x + rnd(-200, -90), Math.max(100, top + rnd(-20, 50)), 'glitter', mobile ? .6 : .8); }, 520);
    setTimeout(function () { f.launch(x, y - 6, x + rnd(90, 200), Math.max(100, top + rnd(-20, 50)), 'peony', mobile ? .6 : .8); }, 760);
  }

  /* Clicks / taps on empty dark "sky" set off a small burst. Never blocks the click. */
  var INTERACTIVE = 'a,button,input,select,textarea,label,summary,option,video,iframe,[role="button"],[tabindex],[contenteditable],.hero-tabs,.c5d-greet';
  function hasOwnText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    return false;
  }
  function onSkyClick(e) {
    var f = fx();
    if (!f || e.button > 0) return;
    var t = e.target;
    if (!t || !t.closest || t.closest(INTERACTIVE) || hasOwnText(t)) return;
    var sel = w.getSelection && w.getSelection();
    if (sel && !sel.isCollapsed) return;
    if (!f.inStage(e.clientX, e.clientY)) return;
    f.burst(e.clientX, e.clientY, Math.random() < .5 ? 'mini' : 'peony', mobile ? .55 : .7);
  }

  /* ======================= Pieces ======================= */

  function mountToran() {
    var header = d.querySelector('.site-header');
    if (header) put(header, deco('c5d-toran'));
  }

  /* Festive red + gold header: tiled flower motif, mandalas at both ends, string lights below. */
  function mountFestiveHeader() {
    var header = d.querySelector('.site-header');
    if (!header) return;
    d.documentElement.classList.add('dw-home');

    // Flower motif tile (8-petal blooms and dotted rosettes), repeated across the bar.
    function bloom(cx, cy, r, rot) {
      var p = '';
      for (var i = 0; i < 8; i++) {
        p += '<path d="M0 0C' + (r * .38) + ' ' + (-r * .3) + ' ' + (r * .34) + ' ' + (-r * .82) + ' 0 ' + (-r) +
             'C' + (-r * .34) + ' ' + (-r * .82) + ' ' + (-r * .38) + ' ' + (-r * .3) + ' 0 0Z" transform="rotate(' + (i * 45) + ')"/>';
      }
      return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')">' + p +
        '<circle r="' + (r * .2).toFixed(1) + '"/><circle r="' + (r * .07).toFixed(1) + '" class="dw-dot"/></g>';
    }
    function rosette(cx, cy, r) {
      var dots = '';
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        dots += '<circle class="dw-dot" cx="' + (cx + Math.cos(a) * r).toFixed(1) + '" cy="' + (cy + Math.sin(a) * r).toFixed(1) + '" r="1.1"/>';
      }
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .55) + '"/>' + dots;
    }
    var tile = bloom(30, 22, 17, 10) + bloom(118, 70, 24, 30) + bloom(205, 16, 13, 0) + bloom(178, 92, 15, 22) +
      bloom(62, 96, 11, 5) + rosette(84, 30, 9) + rosette(232, 64, 8) + rosette(150, 26, 6);
    var pattern = deco('dw-head-pattern',
      '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>' +
        '<pattern id="dw-motif" width="350" height="154" patternUnits="userSpaceOnUse">' +
          '<g transform="scale(1.4)" fill="rgba(236,150,72,.12)" stroke="rgba(240,168,92,.36)" stroke-width=".8">' + tile + '</g>' +
        '</pattern>' +
        '<style>#dw-motif .dw-dot{fill:rgba(255,200,110,.6);stroke:none}</style>' +
      '</defs><rect width="100%" height="100%" fill="url(#dw-motif)"/></svg>');
    put(header, pattern, header.firstChild);

    // Gold mandala for each end of the bar.
    function mandala() {
      var s = '', i, a;
      s += '<circle r="46" fill="none" stroke="#ffcf5a" stroke-width="1" stroke-dasharray="1.5 3.5" stroke-linecap="round"/>';
      for (i = 0; i < 24; i++) { a = i * 15; s += '<circle r="1.6" cy="-40" fill="#ffcf5a" transform="rotate(' + a + ')"/>'; }
      s += '<circle r="34" fill="none" stroke="#ffcf5a" stroke-width=".9"/>';
      for (i = 0; i < 12; i++) { a = i * 30; s += '<path d="M0-14C6-19 6-26 0-31C-6-26-6-19 0-14Z" fill="none" stroke="#ffcf5a" stroke-width=".9" transform="rotate(' + a + ')"/>'; }
      for (i = 0; i < 12; i++) { a = i * 30 + 15; s += '<circle r="1.2" cy="-28" fill="#ffcf5a" transform="rotate(' + a + ')"/>'; }
      s += '<circle r="12" fill="none" stroke="#ffcf5a" stroke-width="1"/><circle r="9" fill="none" stroke="#ffcf5a" stroke-width=".6" stroke-dasharray="1 2"/>' +
           '<circle r="5" fill="none" stroke="#ffcf5a" stroke-width="1.2"/>';
      return '<svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">' + s + '</svg>';
    }
    put(header, deco('dw-head-mandala dw-l', mandala()), pattern.nextSibling);
    put(header, deco('dw-head-mandala dw-r', mandala()), pattern.nextSibling);

    // Keep the header content clean: the flower motif only shows outside the logo-to-quote-button
    // span, and each end mandala is pulled out so it never sits behind the logo or the button.
    var mL = header.querySelector('.dw-head-mandala.dw-l'), mR = header.querySelector('.dw-head-mandala.dw-r');
    function fitHeaderDecor() {
      var hr = header.getBoundingClientRect(), vw = hr.width;
      var brand = header.querySelector('.brand'), acts = header.querySelector('.header-actions');
      var L = brand ? brand.getBoundingClientRect().left - hr.left : 0;
      var R = acts ? hr.right - acts.getBoundingClientRect().right : 0;
      var m = 'linear-gradient(90deg,#000 0,#000 ' + Math.max(0, L - 34) + 'px,transparent ' + Math.max(0, L - 8) + 'px,transparent ' +
              Math.min(vw, vw - R + 8) + 'px,#000 ' + Math.min(vw, vw - R + 34) + 'px,#000 100%)';
      pattern.style.webkitMaskImage = m; pattern.style.maskImage = m;
      [[mL, L], [mR, R]].forEach(function (pair) {
        var el = pair[0], gap = pair[1];
        if (!el) return;
        var size = el.offsetWidth || 118;
        el.style.display = gap < 30 ? 'none' : '';
        el.style[el === mL ? 'left' : 'right'] = Math.min(-20, gap - 10 - size) + 'px';
      });
    }
    fitHeaderDecor();
    var hfT = 0;
    on(w, 'resize', function () { clearTimeout(hfT); hfT = setTimeout(fitHeaderDecor, 150); }, { passive: true });
    if (d.readyState !== 'complete') on(w, 'load', fitHeaderDecor);

    // String of coloured bulbs hanging just below the bar — removed per user request
    if (F.stringLights) {
      var COLORS = ['#ffcf5a', '#ff4d5e', '#57e389', '#4fc3ff', '#ff7ad9', '#ff9a3c'];
      var count = Math.max(12, Math.min(48, Math.floor(w.innerWidth / 42)));
      var bulbs = '';
      for (var b = 0; b < count; b++) {
        bulbs += '<span class="dw-bulb" style="color:' + COLORS[b % COLORS.length] + ';animation-delay:-' + ((b * 0.37) % 1.8).toFixed(2) + 's"></span>';
      }
      put(header, deco('dw-headlights', bulbs));
    }
  }

  function mountHero() {
    var hero = d.querySelector('.hero');
    if (!hero) return;
    if (F.heroLights) {
      var embers = '';
      if (!reduceMotion) {
        for (var e = 0; e < (mobile ? 0 : 10); e++) {
          embers += '<i class="c5d-ember" style="--x:' + rnd(54, 96).toFixed(1) + '%;--s:' + rnd(2, 4.2).toFixed(1) + 'px;--d:' +
            rnd(10, 18).toFixed(1) + 's;--delay:-' + rnd(0, 16).toFixed(1) + 's;--dx:' + rnd(-30, 30).toFixed(0) + 'px"></i>';
        }
      }
      var layer = deco('c5d-hero',
        '<div class="c5d-hero__warmth"></div><div class="c5d-hero__glow"></div>' +
        (F.lanterns ? '<div class="c5d-sky">' + lanterns(mobile ? 2 : 4, 'c5d-lantern--hero') + '</div>' : '') + embers);
      put(hero, layer);
      reveal(layer);
      // proximity hero rangoli removed
      put(hero, deco('c5d-hero__edge', '<span></span><i></i><span></span>'));

      if ('IntersectionObserver' in w) {
        var io = new IntersectionObserver(function (en) { layer.classList.toggle('c5d-paused', !en[0].isIntersecting); });
        io.observe(hero); undo.push(function () { io.disconnect(); });
      }
      if (finePointer && !reduceMotion) {
        var glow = layer.querySelector('.c5d-hero__glow'), gx = 0, gy = 0, q = false;
        on(hero, 'pointermove', function (ev) {
          var r = hero.getBoundingClientRect(); gx = ev.clientX - r.left; gy = ev.clientY - r.top;
          if (!q) { q = true; w.requestAnimationFrame(function () { q = false; glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; }); }
        }, { passive: true });
        on(hero, 'pointerenter', function () { layer.classList.add('c5d-hover'); });
        on(hero, 'pointerleave', function () { layer.classList.remove('c5d-hover'); });
      }
    }
    if (F.heroGreeting) {
      var pill = make('div', 'c5d-greet',
        '<button type="button" class="c5d-greet__btn" aria-label="Light the diya: a small Diwali surprise">' + diyaSVG('c5d-greet__diya is-lit') + '</button>' +
        '<span class="c5d-greet__text"><span class="c5d-greet__kicker">' + esc(G.kicker) + '</span>' +
        '<span class="c5d-greet__line">' + esc(G.heroLine) + '</span></span>' +
        '<span class="c5d-greet__hint" aria-hidden="true">Tap the diya</span>');
      pill.setAttribute('role', 'note');
      put(hero, pill);
      var btn = pill.querySelector('.c5d-greet__btn');
      on(btn, 'click', function () { celebrate(btn.querySelector('.c5d-diya')); });
      proximity(btn.querySelector('.c5d-diya'), 160);
    }
  }

  function mountBanner() {
    var banner = d.querySelector('.page-banner');
    if (!banner) return;
    var bl = deco('c5d-banner', rangoliSVG('c5d-banner__rangoli') +
      (F.lanterns ? '<div class="c5d-sky c5d-sky--right">' + lanterns(mobile ? 1 : 3, '') + '</div>' : ''));
    put(banner, bl);
    reveal(bl);
    proximity(bl.querySelector('.c5d-banner__rangoli'), 300);
  }

  /* Different treatment per section, never the same thing twice. */
  function mountSections() {
    // Services: a small rangoli medallion that draws itself in the empty top-right corner.
    var services = d.querySelector('.orbit-section') || d.querySelector('#cloud');
    if (services) {
      var s = layerIn(services, 'c5d-accent c5d-accent--services', rangoliSVG('c5d-medallion'));
      reveal(s); proximity(s.querySelector('.c5d-rangoli'), 240);
    }
    // About / approach: a large rangoli watermark in gold line art.
    // (About page: its story section has an image on the right, so a small medallion sits above the heading instead.)
    var manifesto = d.querySelector('.manifesto');
    var about = manifesto || d.querySelector('#story');
    if (about) {
      var a = manifesto
        ? layerIn(about, 'c5d-accent c5d-accent--about', rangoliSVG('c5d-watermark'))
        : layerIn(about, 'c5d-accent c5d-accent--story', rangoliSVG('c5d-medallion c5d-medallion--left'));
      reveal(a); proximity(a.querySelector('.c5d-rangoli'), 380);
    }
    // Projects: a few twinkling sparkles around the heading area.
    var work = d.querySelector('.stories') || d.querySelector('.case-grid');
    if (work) {
      var sp = '', spots = [[6, 9], [16, 24], [9, 34], [88, 12], [94, 27], [81, 33], [50, 4]];
      spots.forEach(function (p, i) {
        sp += '<i class="c5d-twinkle" style="left:' + p[0] + '%;top:' + p[1] + '%;--t:' + (i * .7).toFixed(1) + 's;--z:' + rnd(.6, 1.1).toFixed(2) + '"></i>';
      });
      reveal(layerIn(work, 'c5d-accent c5d-accent--work', sp));
    }
    // Closing CTA: lanterns drifting up the starry right side.
    var finale = d.querySelector('.finale');
    if (finale && F.lanterns) put(finale, deco('c5d-fill c5d-accent--finale', '<div class="c5d-sky c5d-sky--right">' + lanterns(mobile ? 2 : 4, '') + '</div>'));
  }

  /* ======================= Floral installation (left + right edges) =======================
     "Luxury Indian floral installation": a bouquet in each upper corner, a draped garland
     from it, and airy hanging strands. Each strand has separate "stations" (marigold
     bunches, single blooms, jasmine gajra, floral knots, leaf sprigs) on gold thread, and
     tapers to an ending: brass bell, gold ornament, jasmine tassel, leaf drop or a tiny diya.
     The two sides are composed differently. All of it stays in the empty band beside the
     page content, and strands stop above the hero arrows, the greeting pill and headings. */

  /* ---- artwork, built once ---- */
  function f2(n) { return (+n).toFixed(2); }
  function petal(L, W) {
    return 'M0 0C' + f2(-W * .55) + ' ' + f2(-L * .3) + ' ' + f2(-W * .62) + ' ' + f2(-L * .78) + ' ' + f2(-W * .3) + ' ' + f2(-L * .98) +
      'L' + f2(-W * .12) + ' ' + f2(-L * 1.06) + 'L0 ' + f2(-L * .96) + 'L' + f2(W * .12) + ' ' + f2(-L * 1.06) + 'L' + f2(W * .3) + ' ' + f2(-L * .98) +
      'C' + f2(W * .62) + ' ' + f2(-L * .78) + ' ' + f2(W * .55) + ' ' + f2(-L * .3) + ' 0 0Z';
  }
  // A marigold seen from the front: four rings of ruffled petals, darker outside, warm centre.
  function marigoldDef(id, c, stroke) {
    function ring(n, L, W, col, off) {
      var d0 = petal(L, W), s = '';
      for (var i = 0; i < n; i++) s += '<path d="' + d0 + '" transform="rotate(' + f2(off + i * 360 / n) + ')"/>';
      return '<g fill="' + col + '" stroke="' + stroke + '" stroke-width=".28">' + s + '</g>';
    }
    var dots = '';
    for (var i = 0; i < 7; i++) dots += '<circle cx="' + f2(Math.cos(i * .9) * 1.3) + '" cy="' + f2(Math.sin(i * .9) * 1.3) + '" r=".5"/>';
    return '<g id="' + id + '">' +
      '<circle cy="1.3" r="10.4" fill="rgba(40,10,0,.32)"/>' +
      ring(20, 10.2, 4.5, c[0], 0) + ring(16, 8.4, 4.3, c[1], 9) + ring(13, 6.5, 3.9, c[2], 4) + ring(9, 4.5, 3.3, c[3], 13) +
      '<circle r="2" fill="' + c[4] + '"/><g fill="' + c[0] + '">' + dots + '</g>' +
      '<circle r="10.4" fill="url(#c5d-g-mgshade)"/>' +
      '<ellipse cx="-3.6" cy="-4.2" rx="4.2" ry="2.6" fill="#fff6d8" opacity=".16"/>' +
    '</g>';
  }
  var FLORA_DEFS =
    '<svg xmlns="http://www.w3.org/2000/svg" class="c5d-defs" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="c5d-g-mgshade"><stop offset=".45" stop-color="#5a1500" stop-opacity="0"/><stop offset="1" stop-color="#5a1500" stop-opacity=".38"/></radialGradient>' +
      marigoldDef('c5d-mg-o', ['#c8500b', '#e2690e', '#f4881a', '#ffa92e', '#ffcf55'], '#8f3505') +
      marigoldDef('c5d-mg-y', ['#cf8c00', '#e8a80a', '#f7c21c', '#ffd84a', '#fff09a'], '#8c6000') +
      marigoldDef('c5d-mg-r', ['#a8350a', '#c4470c', '#dc5e0f', '#f07c1c', '#ffb347'], '#6d2304') +
      // side-view marigold: the bloom tilted, sitting in a green calyx
      ['o', 'y', 'r'].map(function (v) {
        return '<g id="c5d-mgs-' + v + '"><path d="M-5.6 3.2C-5 8.2 5 8.2 5.6 3.2C4 7 2 9.4 0 9.6C-2 9.4-4 7-5.6 3.2Z" fill="#3f7a35"/>' +
          '<path d="M-2.4 7.4L0 11L2.4 7.4Z" fill="#2f6328"/><use href="#c5d-mg-' + v + '" transform="scale(1 .6)"/></g>';
      }).join('') +
      // jasmine bud with a green base (points up)
      '<g id="c5d-bud"><path d="M0 0C1.7-1.6 1.9-5.2 0-7.8C-1.9-5.2-1.7-1.6 0 0Z" fill="url(#c5d-g-jas)" stroke="#d6c9aa" stroke-width=".25"/><path d="M-1 -.3L0 1.3L1 -.3Z" fill="#79a257"/></g>' +
      // open jasmine (mogra): two layers of pointed petals
      '<g id="c5d-jf2">' + [0, 60, 120, 180, 240, 300].map(function (a) {
        return '<path d="M0 0C1.5-1.5 1.7-3.9 0-5.6C-1.7-3.9-1.5-1.5 0 0Z" transform="rotate(' + a + ')" fill="url(#c5d-g-jas)" stroke="#d9cdb0" stroke-width=".2"/>';
      }).join('') + [30, 90, 150, 210, 270, 330].map(function (a) {
        return '<path d="M0 0C1-1 1.1-2.6 0-3.7C-1.1-2.6-1-1 0 0Z" transform="rotate(' + a + ')" fill="#fffdf7"/>';
      }).join('') + '<circle r=".9" fill="#e9d48a"/></g>' +
      // mango leaf (points down), slightly curved
      '<g id="c5d-lf"><path d="M0 0C4.8 4.5 6.4 13 1.6 24C-3.2 15-4.4 6.5 0 0Z" fill="url(#c5d-g-leaf)"/><path d="M0 1C1.6 8 1.9 15 1.4 22" fill="none" stroke="#c4e2a4" stroke-width=".5" opacity=".75"/></g>' +
      // leaf sprig: a short stem with leaves along it (points down)
      '<g id="c5d-sprig"><path d="M0 0C1 8 0 16-1 24" fill="none" stroke="#35652a" stroke-width=".8"/>' +
        '<use href="#c5d-lf" transform="translate(0 3) rotate(-62) scale(.55)"/><use href="#c5d-lf" transform="translate(.5 8) rotate(52) scale(.62)"/>' +
        '<use href="#c5d-lf" transform="translate(0 14) rotate(-40) scale(.68)"/><use href="#c5d-lf" transform="translate(-.5 19) rotate(25) scale(.64)"/>' +
        '<use href="#c5d-lf" transform="translate(-1 23) rotate(-4) scale(.5)"/></g>' +
    '</defs></svg>';

  function use(id, x, y, s, rot) {
    return '<use href="#' + id + '" transform="translate(' + f2(x) + ' ' + f2(y) + ')' +
      (rot ? ' rotate(' + f2(rot) + ')' : '') + (s && s !== 1 ? ' scale(' + f2(s) + ')' : '') + '"/>';
  }
  var MG = ['o', 'y', 'r'];
  function mg(k) { return 'c5d-mg-' + MG[k % 3]; }
  function mgs(k) { return 'c5d-mgs-' + MG[k % 3]; }

  // A small bouquet: leaves fanned behind, side-view blooms, a front bloom, jasmine tucked in.
  function bunch(x, y, s, k, flip) {
    var f = flip ? -1 : 1;
    return use('c5d-sprig', x - 3 * s * f, y - 2 * s, .82 * s, 48 * f) + use('c5d-sprig', x + 3 * s * f, y - 2 * s, .74 * s, -42 * f) +
      use('c5d-lf', x, y + 6 * s, .7 * s, 6 * f) +
      use(mgs(k + 1), x - 9 * s * f, y - 3 * s, .72 * s, -18 * f) + use(mgs(k + 2), x + 9.5 * s * f, y - 2 * s, .66 * s, 20 * f) +
      use('c5d-jf2', x - 12 * s * f, y + 6 * s, .62 * s) + use('c5d-bud', x + 12 * s * f, y + 7 * s, .7 * s, 150 * f) +
      use(mg(k), x, y + 2 * s, 1.08 * s, k * 37) +
      use('c5d-jf2', x + 6 * s * f, y + 12 * s, .5 * s);
  }
  // Jasmine gajra: buds packed along the thread, angled out, with a few seen face-on.
  function gajra(x, y, len, s) {
    var g = '', n = Math.max(3, Math.round(len / (2.1 * s)));
    for (var i = 0; i < n; i++) {
      var yy = y + i * len / n, side = i % 2 ? 1 : -1;
      g += use('c5d-bud', x + side * 1.6 * s, yy, .86 * s, 180 + side * 42);
      if (i % 2 === 1) g += '<circle cx="' + f2(x) + '" cy="' + f2(yy + 1.4 * s) + '" r="' + f2(1.8 * s) + '" fill="url(#c5d-g-jas)" stroke="#ddd1b4" stroke-width=".25"/>';
    }
    return g;
  }

  var FL_W = 52, FL_C = 26;   // strand canvas width and centre line

  /* One hanging strand. Stations taper (get smaller) toward the end. */
  function strandSVG(tokens, seed) {
    var y = 2, back = '', h = '', k = seed || 0, pts = [[FL_C, 0]];
    var n = tokens.length;
    tokens.forEach(function (t, i) {
      var sc = Math.max(.62, 1 - .38 * (i / Math.max(1, n - 1)));
      var x = FL_C + ((i % 3) - 1) * 1.6;           // a little natural drift
      switch (t) {
        case '-': y += 14 * sc; break;
        case '.': y += 5 * sc; h += use('c5d-bead', x, y, .8); y += 5 * sc; break;
        case 'k':                                       // floral knot
          y += 4 * sc; h += use('c5d-bead', x + 2.6, y + 1.5, .7) + use('c5d-jf2', x - 1.5, y, .55 * sc); y += 5 * sc; break;
        case 'M':                                       // single bloom with a jasmine collar
          y += 11 * sc;
          back += use('c5d-bud', x - 6 * sc, y + 5 * sc, .6 * sc, 140) + use('c5d-bud', x + 6 * sc, y + 5 * sc, .6 * sc, -140) +
                  use('c5d-bud', x - 8.5 * sc, y + .5 * sc, .55 * sc, 105) + use('c5d-bud', x + 8.5 * sc, y + .5 * sc, .55 * sc, -105);
          h += use(mg(k++), x, y, 1.1 * sc, k * 41);
          y += 12 * sc; break;
        case 'S':                                       // side-view bloom
          y += 7 * sc; h += use(mgs(k++), x, y, 1.08 * sc, (k % 2 ? 8 : -8)); y += 11 * sc; break;
        case 'B':                                       // bunch, with its own gentle movement
          y += 12 * sc;
          h += '<g class="c5d-fl-clu" style="animation-delay:-' + f2((k * 1.7) % 5) + 's">' + bunch(x, y, sc, k++, k % 2) + '</g>';
          y += 20 * sc; break;
        case 'G': h += gajra(x, y, 22 * sc, sc); y += 22 * sc; break;
        case 'L':                                       // leaf sprigs to both sides
          back += use('c5d-sprig', x, y, .62 * sc, -58) + use('c5d-sprig', x, y + 2, .56 * sc, 52); y += 6 * sc; break;
        case 'BELL':
          y += 3;
          h += '<g class="c5d-fl-bell" style="animation-delay:-' + f2((k * .9) % 3) + 's">' + use('c5d-bellshape', x, y, .95) + '</g>';
          y += 19; break;
        case 'ORN':
          y += 2;
          h += '<g class="c5d-fl-orn" style="animation-delay:-' + f2((k * 1.3) % 4) + 's">' + use('c5d-ornshape', x, y, .95) +
               '<ellipse class="c5d-fl-glint" cx="' + f2(x - 1.5) + '" cy="' + f2(y + 8.5) + '" rx="1.1" ry="2.8" fill="#fff8dc"/></g>';
          y += 21; break;
        case 'LEAFDROP':                                // hanging leaf arrangement with a jasmine tip
          h += use('c5d-sprig', x, y, .95, 0) + use('c5d-sprig', x - 1, y + 3, .7, 24) + use('c5d-sprig', x + 1, y + 3, .7, -24) +
               use('c5d-bead', x - 1, y + 25, .8) + use('c5d-bud', x - 1, y + 28, .7, 180);
          y += 34; break;
        case 'TASSEL':                                  // jasmine tassel under a small bloom
          y += 5; h += use(mgs(k++), x, y, .6, 0);
          for (var j = -2; j <= 2; j++) {
            var tx = x + j * 3.6, len = 12 + (2 - Math.abs(j)) * 4;
            h += '<path d="M' + f2(x) + ' ' + f2(y + 5) + 'L' + f2(tx) + ' ' + f2(y + 7 + len) + '" stroke="#e7d9bb" stroke-width=".45"/>' +
                 gajra(tx, y + 8, len - 3, .55);
          }
          y += 28; break;
        case 'DIYA':                                    // tiny diya on three fine chains, softly glowing
          var dy = y + 22, c = x;
          h += '<path d="M' + f2(c) + ' ' + f2(y) + 'L' + f2(c - 10) + ' ' + dy + 'M' + f2(c) + ' ' + f2(y) + 'L' + f2(c + 10) + ' ' + dy + 'M' + f2(c) + ' ' + f2(y) + 'L' + f2(c) + ' ' + (dy - 2) + '" stroke="#c9932a" stroke-width=".6" fill="none"/>' +
               '<circle class="c5d-fl-halo" cx="' + f2(c) + '" cy="' + (dy - 6) + '" r="16" fill="url(#c5d-g-halo)"/>' +
               '<path class="c5d-fl-flame" d="M' + f2(c) + ' ' + (dy - 13) + 'c2.4 3.8 4.4 6.4 3.8 10-.5 2.7-2.1 3.9-3.8 3.9s-3.3-1.2-3.8-3.9c-.6-3.6 1.4-6.2 3.8-10z" fill="url(#c5d-g-flame)"/>' +
               '<path d="M' + f2(c - 13) + ' ' + dy + 'c5 1.2 21 1.2 26 0-1 6-6.4 9.6-13 9.6S' + f2(c - 12) + ' ' + (dy + 6) + ' ' + f2(c - 13) + ' ' + dy + 'z" fill="url(#c5d-g-clay)"/>' +
               '<path d="M' + f2(c - 13) + ' ' + dy + 'c5 1.2 21 1.2 26 0" fill="none" stroke="url(#c5d-g-rim)" stroke-width="1.2" stroke-linecap="round"/>';
          y = dy + 12; break;
        case 'JHOOMAR':                                 // small ring with three jasmine drops and bells
          y += 4;
          h += '<ellipse cx="' + f2(x) + '" cy="' + f2(y) + '" rx="13" ry="3.2" fill="none" stroke="url(#c5d-g-brass)" stroke-width="1.6"/>' + use('c5d-bead', x, y - 3, 1);
          [-10, 0, 10].forEach(function (dx, j2) {
            var top = y + 2, l = j2 === 1 ? 22 : 15;
            h += '<path d="M' + f2(x + dx) + ' ' + f2(top) + 'V' + f2(top + l) + '" stroke="#e7d9bb" stroke-width=".45"/>' + gajra(x + dx, top + 1, l - 4, .55) +
                 '<g class="c5d-fl-bell" style="animation-delay:-' + (j2 * .8).toFixed(1) + 's">' + use('c5d-bellshape', x + dx, top + l + 2, .5) + '</g>';
          });
          y += 42; break;
      }
      pts.push([x, y]);
    });
    // gold thread through every station, as a soft curve
    var th = 'M' + f2(pts[0][0]) + ' 0';
    for (var p = 1; p < pts.length; p++) {
      var a = pts[p - 1], b = pts[p];
      th += 'Q' + f2(a[0]) + ' ' + f2((a[1] + b[1]) / 2) + ' ' + f2(b[0]) + ' ' + f2(b[1]);
    }
    var thread = '<path d="' + th + '" fill="none" stroke="#b8862b" stroke-width=".7" opacity=".9"/>';
    return { svg: thread + back + h, height: y + 6 };
  }
  function fitTokens(tokens, maxLen) {
    var t = tokens.slice();
    while (strandSVG(t).height > maxLen && t.length > 3) t.splice(Math.floor((t.length - 1) / 2), 1);
    return strandSVG(t).height <= maxLen ? t : null;
  }

  /* Corner arrangement. side 'left': a draped garland hugging the corner with a big bouquet.
     side 'right': a swag looping along the top, joined to a cascade down the edge. */
  function crownSVG(side, B, Hc, fs, dropsAt) {
    var segs = side === 'left'
      ? [[[B - 2, 4], [8, 6], [6, Hc]]]
      : [[[B - 2, 3], [B * .55, 48], [16, 8]], [[16, 8], [3, Hc * .45], [7, Hc]]];
    function qp(s, t) {
      var u = 1 - t;
      return [u * u * s[0][0] + 2 * u * t * s[1][0] + t * t * s[2][0], u * u * s[0][1] + 2 * u * t * s[1][1] + t * t * s[2][1]];
    }
    function yAt(x) {
      var s = segs[0], lo = 0, hi = 1;
      for (var i = 0; i < 26; i++) { var m = (lo + hi) / 2; if (qp(s, m)[0] > x) lo = m; else hi = m; }
      return qp(s, (lo + hi) / 2)[1];
    }
    var back = '', mid = '', front = '', k = side === 'left' ? 0 : 1;
    var all = [];
    segs.forEach(function (s, si) {
      var len = 0, pr = qp(s, 0);
      for (var i = 1; i <= 40; i++) { var q = qp(s, i / 40); len += Math.hypot(q[0] - pr[0], q[1] - pr[1]); pr = q; }
      var n = Math.max(3, Math.round(len / 17));
      for (var j = (si ? 1 : 0); j <= n; j++) all.push({ s: s, t: j / n, seg: si });
    });
    var total = all.length;
    all.forEach(function (it, i) {
      var q = qp(it.s, it.t), q2 = qp(it.s, Math.min(1, it.t + .02));
      var ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]) * 180 / Math.PI;
      var g = i / (total - 1);                                   // 0 at the top-inner end, 1 at the bottom
      var near = Math.exp(-Math.pow((g - (side === 'left' ? .42 : .38)) / .3, 2));
      var s = (.46 + .42 * near) * (side === 'right' ? .95 : 1);
      // leaves first (behind), then jasmine, then blooms
      if (i % 2 === 0) back += use('c5d-sprig', q[0], q[1], .55 + .35 * near, (side === 'left' ? -55 : -40) + (i % 4 ? 30 : -10));
      if (i % 3 === 1) back += use('c5d-sprig', q[0], q[1], .45 + .25 * near, 150 + (i % 2) * 25);
      mid += gajra(q[0] + 2, q[1] + 4, 10 + 6 * near, .65);
      if (i % 2 === 1 || near > .5) front += (near < .35 && i % 3 === 0) ? use(mgs(k + i), q[0], q[1] + 2, s * 1.05, ang - 90) : use(mg(k + i), q[0], q[1], s, i * 47);
    });
    // focal bouquet
    var F = side === 'left' ? qp(segs[0], .42) : qp(segs[1], .05);
    var focal = '';
    [-80, -40, 0, 38].forEach(function (a, i) { focal += use('c5d-sprig', F[0], F[1], (1.05 - i * .06) * fs, a * (side === 'left' ? 1 : -1)); });
    var blooms = side === 'left'
      ? [[-9, -7, .85, 1], [10, -8, .8, 2], [-12, 9, .78, 0], [13, 8, .9, 0], [1, 16, .72, 1], [0, 1, 1.38, 0]]
      : [[-10, -6, .8, 0], [11, -6, .86, 1], [-9, 10, .82, 2], [12, 11, .76, 1], [0, 2, 1.3, 1]];
    blooms.forEach(function (b, i) {
      focal += (i === 1 || i === 4) && side === 'left'
        ? use(mgs(b[3]), F[0] + b[0] * fs, F[1] + b[1] * fs, b[2] * fs, b[0] > 0 ? 18 : -18)
        : use(mg(b[3]), F[0] + b[0] * fs, F[1] + b[1] * fs, b[2] * fs, i * 53);
    });
    [[-17, 1], [18, -2], [-4, -14], [7, 21]].forEach(function (j) { focal += use('c5d-jf2', F[0] + j[0] * fs, F[1] + j[1] * fs, .72 * fs); });
    if (side === 'left') {
      // a tiny diya tucked into the bouquet, and a small bell below it
      focal += '<g transform="translate(' + f2(F[0] + 9 * fs) + ' ' + f2(F[1] + 13 * fs) + ') scale(' + f2(.36 * fs) + ')">' +
          '<circle class="c5d-fl-halo" cx="47" cy="23" r="24" fill="url(#c5d-g-halo)"/>' +
          '<path class="c5d-fl-flame" d="M47 9c4.6 7.4 8.6 12.6 7.4 19.6-.9 5.2-4.1 7.6-7.4 7.6s-6.5-2.4-7.4-7.6C38.4 21.6 42.4 16.4 47 9z" fill="url(#c5d-g-flame)"/>' +
          '<path d="M5 37c10 2.2 38 2.4 54-3.6-1.6 10.2-12 17.8-27 17.8C17.6 51.2 7.4 45.4 5 37z" fill="url(#c5d-g-clay)"/>' +
          '<path d="M5 37c10 2.2 38 2.4 54-3.6" fill="none" stroke="url(#c5d-g-rim)" stroke-width="1.8" stroke-linecap="round"/></g>' +
        '<g class="c5d-fl-bell" style="animation-delay:-1.2s">' + use('c5d-bellshape', F[0] - 3 * fs, F[1] + 26 * fs, .75 * fs) + '</g>';
    } else {
      // a gold ornament and a hanging leaf arrangement under the right bouquet
      focal += use('c5d-sprig', F[0] + 2, F[1] + 14 * fs, .9 * fs, 6) +
        '<g class="c5d-fl-orn" style="animation-delay:-2.1s">' + use('c5d-ornshape', F[0] - 6 * fs, F[1] + 22 * fs, .8 * fs) + '</g>';
    }
    // small separate clusters hanging between the strands
    var drops = '';
    (dropsAt || []).forEach(function (fx, j) {
      var x = fx * B, y0 = yAt(x) + 5, L = 18 + (j % 2) * 16;
      drops += '<g class="c5d-fl-orn" style="animation-delay:-' + f2(j * 1.4) + 's">' +
        '<path d="M' + f2(x) + ' ' + f2(y0) + 'V' + f2(y0 + L) + '" stroke="#b8862b" stroke-width=".6"/>' +
        gajra(x, y0 + 2, L * .55, .55) +
        use('c5d-sprig', x, y0 + L - 2, .5, j % 2 ? 40 : -40) + use(mgs(j + k), x, y0 + L + 2, .55, 0) +
        use('c5d-bead', x, y0 + L + 10, .8) + use('c5d-ornshape', x, y0 + L + 12, .5) +
        '<ellipse class="c5d-fl-glint" style="animation-delay:-' + f2(j * 1.9) + 's" cx="' + f2(x - .8) + '" cy="' + f2(y0 + L + 17) + '" rx=".7" ry="1.8" fill="#fff8dc"/></g>';
    });
    var thread = segs.map(function (s) { return 'M' + s[0].join(' ') + 'Q' + s[1].join(' ') + ' ' + s[2].join(' '); }).join('');
    var W = B + 16, H = Hc + 70;
    var body = '<path d="' + thread + '" fill="none" stroke="#9b6a1e" stroke-width="1"/>' + drops + back + mid + front + focal;
    if (side === 'right') body = '<g transform="translate(' + W + ' 0) scale(-1 1)">' + body + '</g>';
    return {
      svg: '<svg class="c5d-fl-crown" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' + body + '</svg>',
      yAt: yAt
    };
  }

  // Strand plans per side and tier: [position across the band, depth, length class, recipe].
  // Tokens: B bunch, M bloom, S side bloom, G jasmine gajra, k floral knot, L leaf sprigs,
  // . gold bead, - bare thread; endings BELL, ORN, DIYA, TASSEL, LEAFDROP, JHOOMAR.
  var FL_PLANS = {
    full: {
      left: [
        [.14, 'front', 'short', 'B G . M G k S BELL'],
        [.33, 'back', 'mid', 'M G - . S G k - M G . ORN'],
        [.53, 'front', 'long', 'B G k M - G . S L G - M k G - S . G DIYA'],
        [.73, 'back', 'long2', 'M G . S - G k M L - G . S G TASSEL'],
        [.91, 'front', 'mid2', 'S G k M G - . B G k BELL']
      ],
      right: [
        [.12, 'front', 'short', 'M G k S LEAFDROP'],
        [.3, 'front', 'long', 'B G k M - G . S G L - M G k JHOOMAR'],
        [.5, 'back', 'long2', 'S G . M - G k S G - . M ORN'],
        [.7, 'front', 'mid', 'M G k B G . LEAFDROP'],
        [.88, 'back', 'short2', 'S G k M TASSEL']
      ]
    },
    compact: {
      left: [[.2, 'front', 'short', 'B G . M k BELL'], [.5, 'back', 'mid', 'M G - S G k . ORN'], [.8, 'front', 'long', 'B G k M - G . S L G - M DIYA']],
      right: [[.2, 'back', 'short2', 'S G k M TASSEL'], [.5, 'front', 'long', 'B G k M - G . S G k JHOOMAR'], [.8, 'back', 'mid', 'M G k S LEAFDROP']]
    },
    slim: {
      left: [[.3, 'front', 'mid', 'B G k M - G . S BELL'], [.74, 'back', 'mid2', 'M G - S G k . ORN']],
      right: [[.3, 'back', 'mid2', 'S G k M - G . LEAFDROP'], [.74, 'front', 'mid', 'B G . M G k DIYA']]
    },
    mobile: {
      left: [[.55, 'front', 'short', 'M G k BELL']],
      right: [[.55, 'front', 'short', 'S G . TASSEL']]
    }
  };
  var FL_LEN = { short: .3, short2: .36, mid: .46, mid2: .52, long: .72, long2: .62 };
  var FL_DROPS = { full: { left: [.23, .43, .63, .82], right: [.21, .4, .79] }, compact: { left: [.35, .65], right: [.65] }, slim: { left: [.52], right: [.52] }, mobile: { left: [], right: [] } };

  function mountFlora() {
    var header = d.querySelector('.site-header');
    put(d.body, deco('c5d-defs-wrap', FLORA_DEFS));
    var root = deco('c5d-flora');
    put(d.body, root);

    function headerH() { return header ? header.offsetHeight : 0; }
    function setTop() { root.style.setProperty('--c5d-fl-top', headerH() + 'px'); }

    // Things at the page edges that strands must stop above (measured as if scrolled to the top).
    function obstacles() {
      var list = [], sy = w.scrollY, base = parseFloat(getComputedStyle(d.documentElement).getPropertyValue('--header-h')) || headerH();
      ['.hero-prev', '.hero-next', '.c5d-greet', '.hero-copy', '.page-banner .breadcrumb', '.page-banner h1', '.product-hero-text'].forEach(function (sel) {
        var el = d.querySelector(sel);
        if (!el) return;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        list.push({ l: r.left, r: r.right, top: r.top + sy - base });
      });
      return list;
    }

    var lastKey = '';
    function build() {
      var vw = d.documentElement.clientWidth, vh = w.innerHeight;
      var contentLeft = vw > 1280 ? (vw - 1280) / 2 + 32 : (vw >= 768 ? 32 : 20);
      var B = Math.max(24, Math.min(230, contentLeft - 14));
      var tier = vw < 1024 ? 'mobile' : B >= 150 ? 'full' : B >= 80 ? 'compact' : 'slim';
      var key = tier + '|' + Math.round(B) + '|' + Math.round(vh / 40);
      if (key === lastKey) return;
      lastKey = key;
      setTop();
      var avail = vh - headerH();
      var obs = obstacles();
      var crownH = tier === 'full' ? 150 : tier === 'compact' ? 118 : tier === 'slim' ? 104 : 54;
      var focal = tier === 'full' ? 1 : tier === 'compact' ? .82 : tier === 'slim' ? .72 : .5;
      var html = '';
      ['left', 'right'].forEach(function (side) {
        var SB = side === 'right' && tier !== 'mobile' ? Math.round(B * .8) : B;   // right side kept lighter over the hero photo
        var crown = crownSVG(side, SB, crownH * (side === 'right' ? .9 : 1), focal, FL_DROPS[tier][side]);
        var strands = '';
        FL_PLANS[tier][side].forEach(function (pl, idx) {
          var x = pl[0] * SB;
          var top = crown.yAt(x) - 2;
          var maxLen = avail * FL_LEN[pl[2]] * (tier === 'compact' ? .85 : 1);
          if (tier === 'slim') maxLen = Math.min(maxLen, 290);
          if (tier === 'mobile') maxLen = Math.min(maxLen, 92);
          var x0 = x - FL_W / 2 + 8, x1 = x + FL_W / 2 - 8;
          obs.forEach(function (o) {
            var ol = side === 'left' ? o.l : vw - o.r, orr = side === 'left' ? o.r : vw - o.l;
            if (orr > x0 && ol < x1) maxLen = Math.min(maxLen, o.top - 18 - top);
          });
          var t = fitTokens(pl[3].split(' '), maxLen);
          if (!t) return;
          var st = strandSVG(t, idx * 2 + (side === 'right' ? 1 : 0));
          var amp = (pl[1] === 'back' ? .9 : 1.4) + (idx % 2) * .5;
          strands += '<div class="c5d-fl-strand c5d-fl-' + pl[1] + '" style="' + side + ':' + (x - FL_W / 2).toFixed(1) + 'px;top:' + top.toFixed(1) +
            'px;--a:' + amp.toFixed(1) + 'deg;--d:' + (7 + idx * 1.3 + (side === 'right' ? .7 : 0)).toFixed(1) + 's;--dl:-' + (idx * 1.7 + (side === 'right' ? 2.3 : 0)).toFixed(1) + 's">' +
            '<svg width="' + FL_W + '" height="' + st.height.toFixed(0) + '" viewBox="0 0 ' + FL_W + ' ' + st.height.toFixed(0) + '" aria-hidden="true" focusable="false">' + st.svg + '</svg></div>';
        });
        var petals = '';
        if (tier === 'full' || tier === 'compact') {
          var PC = ['#f39a1e', '#ffc94a', '#fff6e6', '#e8730f'];
          for (var p = 0; p < 3; p++) {
            petals += '<i class="c5d-fl-petal" style="' + side + ':' + (SB * (.2 + p * .28)).toFixed(0) + 'px;background:' + PC[(p + (side === 'right' ? 1 : 0)) % 4] +
              ';--d:' + (18 + p * 5) + 's;--dl:-' + (p * 7 + (side === 'right' ? 4 : 0)) + 's;--dx:' + (side === 'left' ? 1 : -1) * (14 + p * 8) + 'px"></i>';
          }
        }
        html += '<div class="c5d-fl-side c5d-fl-' + side + ' c5d-fl-' + tier + '" style="width:' + (SB + 16) + 'px">' + strands + crown.svg + petals + '</div>';
      });
      root.innerHTML = html;
    }

    build();
    if (header && 'ResizeObserver' in w) {
      var ro = new ResizeObserver(setTop);
      ro.observe(header);
      undo.push(function () { ro.disconnect(); });
    }
    var rt = 0;
    on(w, 'resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); }, { passive: true });
    if (d.readyState !== 'complete') on(w, 'load', function () { lastKey = ''; build(); });
  }

  function mountFooter() {
    var footer = d.querySelector('.site-footer');
    var wrap = d.querySelector('.site-footer > .container');
    if (!footer || !wrap) return;
    if (F.footerGarland) put(footer, deco('c5d-garland'));
    if (F.lanterns) put(footer, deco('c5d-fill c5d-accent--footer', '<div class="c5d-sky">' + lanterns(mobile ? 2 : 5, 'c5d-lantern--far') + '</div>'));

    var diyas = '';
    for (var k = 0; k < 5; k++) {
      diyas += '<button type="button" class="c5d-blessing__lamp" style="--i:' + k + '" aria-label="Light diya ' + (k + 1) + ' of 5">' +
        diyaSVG('c5d-blessing__diya', '--i:' + k) + '</button>';
    }
    var band = make('div', 'c5d-blessing',
      '<div class="c5d-blessing__bg" aria-hidden="true">' + rangoliSVG('c5d-blessing__rangoli') + '</div>' +
      '<div class="c5d-blessing__ornament" aria-hidden="true"><b></b><span></span><i></i><span></span><b></b></div>' +
      '<div class="c5d-blessing__diyas">' + diyas + '</div>' +
      '<p class="c5d-blessing__kicker">' + esc(G.kicker) + '</p>' +
      '<p class="c5d-blessing__title">' + esc(G.titleBefore) + '<em>' + esc(G.titleEm) + '</em>' + esc(G.titleAfter) + '</p>' +
      '<p class="c5d-blessing__text">' + esc(G.message) + '</p>' +
      '<p class="c5d-blessing__hint" aria-hidden="true">Tap a diya to celebrate</p>');
    band.setAttribute('role', 'note');
    band.setAttribute('aria-label', 'Diwali greeting from Core5');
    put(wrap, band, wrap.querySelector('.footer-bottom'));
    reveal(band);

    var lamps = band.querySelectorAll('.c5d-blessing__diya');
    Array.prototype.forEach.call(band.querySelectorAll('.c5d-blessing__lamp'), function (b) {
      var dy = b.querySelector('.c5d-diya');
      on(b, 'click', function () { dy.classList.add('is-lit'); celebrate(dy); });
      proximity(dy, 200);
    });
    function lightAll() {
      Array.prototype.forEach.call(lamps, function (l, i) {
        if (reduceMotion) l.classList.add('is-lit');
        else setTimeout(function () { l.classList.add('is-lit'); }, 250 + i * 300);
      });
    }
    if ('IntersectionObserver' in w && !reduceMotion) {
      var bio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          lightAll(); bio.disconnect();
          // When the last lamp lights, the sky above the footer answers.
          var f = fx();
          if (f) setTimeout(function () {
            var r = band.getBoundingClientRect();
            if (r.top < w.innerHeight && r.bottom > 0) {
              var cx = r.left + r.width / 2, y0 = r.top + 120;
              f.sparkle(cx, y0, 16);
            }
          }, 250 + 5 * 300);
        }
      }, { threshold: .35 });
      bio.observe(band); undo.push(function () { bio.disconnect(); });
    } else lightAll();
  }

  /* ---------- First-visit intro (once per browser session) ---------- */
  function seenIntro() { try { return sessionStorage.getItem('c5d-intro-2026') === '1'; } catch (e) { return true; } }
  function markIntro() { try { sessionStorage.setItem('c5d-intro-2026', '1'); } catch (e) { /* ignore */ } }

  function playIntro(done) {
    markIntro();
    var el = make('div', 'c5d-intro',
      '<div class="c5d-intro__veil"></div>' +
      '<div class="c5d-intro__card">' + diyaSVG('c5d-intro__diya') +
        '<p class="c5d-intro__kicker">' + esc(G.introKicker) + '</p>' +
        '<p class="c5d-intro__title">' + esc(G.introTitle) + '</p>' +
        '<p class="c5d-intro__from">' + esc(G.introFrom) + '</p>' +
      '</div>' +
      '<button type="button" class="c5d-intro__skip" tabindex="-1">Skip</button>');
    el.setAttribute('aria-hidden', 'true');
    put(d.body, el);
    var f = fx();
    if (f) f.canvas.classList.add('c5d-fx--top');
    var timers = [], closed = false;
    function close() {
      if (closed) return; closed = true;
      timers.forEach(clearTimeout);
      el.classList.add('is-out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (f) f.canvas.classList.remove('c5d-fx--top');
        done();
      }, 700);
      d.removeEventListener('keydown', onKey); w.removeEventListener('wheel', close); w.removeEventListener('touchmove', close);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    el.querySelector('.c5d-intro__skip').addEventListener('click', close);
    d.addEventListener('keydown', onKey);
    w.addEventListener('wheel', close, { passive: true });
    w.addEventListener('touchmove', close, { passive: true });
    undo.push(close);

    w.requestAnimationFrame(function () { el.classList.add('is-in'); });
    var diya = el.querySelector('.c5d-intro__diya');
    timers.push(setTimeout(function () { diya.classList.add('is-lit'); }, 450));
    timers.push(setTimeout(function () {
      if (!f) return;
      var r = diya.getBoundingClientRect(), x = r.left + r.width * .73, y = r.top + r.height * .3;
      var W = w.innerWidth, H = w.innerHeight;
      f.sparkle(x, y, 18);
      // Short-lived patterns, kept to the centre-top and the right so nothing lingers over the hero text.
      f.launch(x, y, W * .5, H * .15, 'chrysanthemum', mobile ? .9 : 1.2);
      timers.push(setTimeout(function () { f.launch(W * .96, H, W * rnd(.76, .84), H * .18, 'glitter', mobile ? .7 : 1); }, 380));
      timers.push(setTimeout(function () { f.launch(W * .7, H, W * rnd(.62, .68), H * .1, 'starburst', mobile ? .6 : .85); }, 700));
    }, 1500));
    timers.push(setTimeout(close, 4300));
  }

  /* ======================= Mount / teardown ======================= */

  function mount() {
    d.documentElement.classList.add('c5-diwali');
    if (reduceMotion) d.documentElement.classList.add('c5d-still');
    put(d.body, deco('c5d-defs-wrap', DEFS));

    if (F.festiveHeader) mountFestiveHeader();
    if (F.toran) mountToran();
    mountHero();
    if (F.bannerRangoli) mountBanner();
    if (F.sectionAccents) mountSections();
    if (F.footerBlessing) mountFooter();
    if (F.floralInstallation) mountFlora();
    if (F.clickBursts) on(d, 'click', onSkyClick);

    var f = fx();
    var intro = F.intro && !reduceMotion && !seenIntro();
    if (f && F.fireworks) {
      if (intro) playIntro(function () { f.start({ opening: false }); });
      else f.start({ opening: true, bigOpening: false });
    } else if (intro) playIntro(function () {});

    on(d, 'visibilitychange', function () {
      if (d.visibilityState === 'visible' && !API.isActive()) teardown();
    });
  }

  function teardown() {
    undo.splice(0).forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    if (API.fx) { API.fx.destroy(); API.fx = null; }
    added.splice(0).forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    Array.prototype.forEach.call(d.querySelectorAll('[data-c5d]'), function (n) { n.parentNode.removeChild(n); });
    d.documentElement.classList.remove('c5-diwali', 'c5d-still', 'dw-home');
  }
  API.teardown = teardown;

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})(window, document);
