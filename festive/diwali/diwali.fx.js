/* ==========================================================================
   Core5 · Diwali 2026 — fireworks + sparks engine (one canvas)
   --------------------------------------------------------------------------
   • One fixed, transparent, click-through canvas.
   • Rockets climb (fast, then easing out near the top), leave an ember trail
     and burst in one of six patterns. Sparks fall with drag and gravity.
   • Fireworks are clipped to the dark "night sky" sections of the page and
     aimed at their empty areas, so they never sit over headings or buttons.
   • Pooled particles, a hard particle cap, adaptive quality, and the loop
     only runs while something is moving. Pauses when the tab is hidden.
   ========================================================================== */
(function (w, d) {
  'use strict';

  var API = w.C5_DIWALI;
  if (!API || !API.isActive() || API.fx) return;
  if (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- Device tier ---------- */
  var vw = w.innerWidth;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cores = navigator.hardwareConcurrency || 4;
  var mem = navigator.deviceMemory || 4;
  var lowPower = cores <= 2 || mem <= 2 || !!(navigator.connection && navigator.connection.saveData);
  var tier = vw >= 1024 ? 'desktop' : vw >= 768 ? 'tablet' : 'mobile';
  var TIERS = {
    desktop: { cap: 1500, scale: 1, dpr: 1.5, major: [8000, 14000], mini: [3500, 7000], petals: 5 },
    tablet:  { cap: 800,  scale: .7, dpr: 1.5, major: [10000, 17000], mini: [5000, 9000], petals: 3 },
    mobile:  { cap: 480,  scale: .5, dpr: 1.25, major: [12000, 20000], mini: [7000, 12000], petals: 2 }
  };
  var T = TIERS[tier];
  if (lowPower) { T.cap = Math.round(T.cap * .6); T.scale *= .75; }
  var MIN_CAP = Math.round(T.cap * .45);

  /* ---------- Palette (rgb) ---------- */
  var C = {
    gold: [255, 196, 92], amber: [255, 158, 54], champagne: [255, 233, 196],
    white: [255, 250, 236], rose: [255, 122, 150], violet: [190, 156, 255], green: [140, 230, 170]
  };
  var WARM = ['gold', 'amber', 'champagne', 'gold', 'white'];
  var ACCENT = ['rose', 'violet', 'green'];

  /* ---------- Canvas ---------- */
  var cv = d.createElement('canvas');
  cv.className = 'c5d-fx';
  cv.setAttribute('aria-hidden', 'true');
  cv.setAttribute('data-c5d', '');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  function resize() {
    W = w.innerWidth; H = w.innerHeight;
    DPR = Math.min(w.devicePixelRatio || 1, T.dpr);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* Soft glow sprites, one per colour, drawn once. */
  var sprites = {};
  function sprite(name) {
    if (sprites[name]) return sprites[name];
    var s = d.createElement('canvas'); s.width = s.height = 64;
    var g = s.getContext('2d'), c = C[name];
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(.18, 'rgba(' + c + ',.95)');
    grd.addColorStop(.45, 'rgba(' + c + ',.28)');
    grd.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return (sprites[name] = s);
  }
  var flashSprite = (function () {
    var s = d.createElement('canvas'); s.width = s.height = 128;
    var g = s.getContext('2d');
    var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,214,140,.55)');
    grd.addColorStop(.4, 'rgba(255,170,70,.16)');
    grd.addColorStop(1, 'rgba(255,170,70,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return s;
  })();

  /* ---------- Particle pool ---------- */
  var live = [], pool = [];
  function P() { return pool.pop() || {}; }
  function spawn(o) {
    if (live.length >= T.cap) return null;
    var p = P();
    p.x = o.x; p.y = o.y; p.vx = o.vx || 0; p.vy = o.vy || 0;
    p.life = 0; p.max = o.max || 1; p.size = o.size || 1.6;
    p.col = o.col || 'gold'; p.drag = o.drag == null ? 1.6 : o.drag; p.g = o.g == null ? 90 : o.g;
    p.kind = o.kind || 'spark';         // spark | trail | glitter | willow | rocket | petal | cursor | flash
    p.clip = !!o.clip; p.streak = o.streak == null ? .085 : o.streak;
    p.twinkle = !!o.twinkle; p.emit = o.emit || 0; p.emitT = 0;
    p.crackle = !!o.crackle; p.rot = o.rot || 0; p.vr = o.vr || 0; p.sway = o.sway || 0;
    p.r = o.r || 0;                      // flash radius
    p.ty = o.ty; p.sy = o.y; p.dur = o.dur; p.burst = o.burst; p.bx = o.x; p.tx = o.tx;
    live.push(p);
    wake();
    return p;
  }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------- Burst patterns ---------- */
  function n(k) { return Math.max(6, Math.round(k * T.scale)); }

  function flash(x, y, r, clip) { spawn({ x: x, y: y, kind: 'flash', max: .55, r: r, clip: clip, g: 0, drag: 0 }); }

  var PATTERNS = {
    chrysanthemum: function (x, y, s, clip) {
      var col = Math.random() < .2 ? pick(ACCENT) : pick(WARM), k = n(90), sp = 210 * s;
      for (var i = 0; i < k; i++) {
        var a = (i / k) * Math.PI * 2 + rnd(-.05, .05), v = sp * (i % 3 ? rnd(.86, 1) : rnd(.45, .75));
        spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, max: rnd(1.4, 1.9), col: col, size: 1.7,
          drag: 1.5, g: 80, emit: .05, clip: clip, crackle: Math.random() < .12 });
      }
      flash(x, y, 170 * s, clip);
    },
    peony: function (x, y, s, clip) {
      var c1 = pick(WARM), c2 = Math.random() < .35 ? pick(ACCENT) : 'champagne', k = n(80), sp = 190 * s;
      for (var i = 0; i < k; i++) {
        var a = Math.random() * Math.PI * 2, v = sp * Math.sqrt(Math.random()) * rnd(.9, 1.1);
        spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, max: rnd(1.1, 1.6),
          col: i % 3 ? c1 : c2, size: 2.1, drag: 1.9, g: 70, streak: .02, clip: clip });
      }
      flash(x, y, 150 * s, clip);
    },
    glitter: function (x, y, s, clip) {
      var k = n(70), sp = 180 * s;
      for (var i = 0; i < k; i++) {
        var a = Math.random() * Math.PI * 2, v = sp * rnd(.5, 1);
        spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, max: rnd(1.8, 2.6), col: 'gold', size: 1.5,
          drag: 1.8, g: 60, kind: 'glitter', emit: .07, twinkle: true, clip: clip });
      }
      flash(x, y, 140 * s, clip);
    },
    willow: function (x, y, s, clip) {
      var k = n(60), sp = 170 * s;
      for (var i = 0; i < k; i++) {
        var a = (i / k) * Math.PI * 2 + rnd(-.08, .08), v = sp * rnd(.55, 1);
        spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, max: rnd(2.6, 3.6), col: 'gold', size: 1.4,
          drag: 2.4, g: 34, kind: 'willow', emit: .035, streak: .07, clip: clip });
      }
      flash(x, y, 160 * s, clip);
    },
    starburst: function (x, y, s, clip) {
      var rays = Math.max(8, Math.round(14 * Math.min(1, T.scale + .2))), col = pick(['champagne', 'gold', 'white']);
      var off = Math.random() * Math.PI;
      for (var r = 0; r < rays; r++) {
        var a = off + (r / rays) * Math.PI * 2;
        for (var j = 0; j < 5; j++) {
          var v = 230 * s * (.45 + j * .14);
          spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, max: rnd(.9, 1.2), col: col, size: 1.8 - j * .15,
            drag: 2.2, g: 40, streak: .06, clip: clip });
        }
      }
      flash(x, y, 140 * s, clip);
    },
    mini: function (x, y, s, clip) {
      var col = Math.random() < .25 ? pick(ACCENT) : pick(WARM), k = n(26), sp = 110 * s;
      for (var i = 0; i < k; i++) {
        var a = Math.random() * Math.PI * 2, v = sp * rnd(.6, 1);
        spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, max: rnd(.7, 1.1), col: col, size: 1.3,
          drag: 2, g: 60, streak: .03, clip: clip });
      }
      flash(x, y, 70 * s, clip);
    }
  };
  var MAJOR = ['chrysanthemum', 'peony', 'glitter', 'willow', 'starburst', 'chrysanthemum', 'peony'];

  function burst(x, y, type, size, clip) {
    (PATTERNS[type] || PATTERNS.peony)(x, y, size || 1, !!clip);
  }

  /* Rocket: climbs from (x, y) to apex (tx, ty) with ease-out timing, then bursts. */
  function launch(x, y, tx, ty, type, size, clip) {
    var dist = Math.abs(y - ty);
    spawn({ x: x, y: y, tx: tx, ty: ty, kind: 'rocket', max: 99, dur: Math.min(1.5, .7 + dist / 900),
      col: 'champagne', size: 2, clip: clip, burst: { type: type, size: size }, g: 0, drag: 0 });
  }

  /* ---------- Stages: the dark sections fireworks may appear in ---------- */
  // zone = [x0, x1, y0, y1] as fractions of the stage's visible width / first screen height.
  // launchY: where rockets start, as a fraction of the stage's first screen (default: its visible bottom).
  // size: scales bursts for tighter skies.
  var STAGES = [
    // phone: on narrow screens text spans the full width, so bursts use the empty band above it.
    { sel: '.hero', zones: [[.56, .94, .1, .46]], phone: [[.3, .9, .05, .15]], launch: 'right' },
    { sel: '.page-banner', zones: [[.6, .95, .1, .55]], phone: [[.4, .9, .06, .16]], launch: 'right' },
    { sel: '.product-hero', zones: [[.6, .95, .12, .5]], phone: [[.4, .9, .06, .14]], launch: 'right' },
    { sel: '.stories', zones: [[.04, .22, .08, .3], [.78, .96, .08, .3]], phone: [[.2, .8, .03, .07]], launch: 'both', launchY: .62, size: .85 },
    { sel: '.finale', zones: [[.7, .95, .06, .38]], phone: [[.4, .9, .04, .13]], launch: 'right' },
    { sel: '.site-footer', zones: [[.66, .95, .05, .1]], phone: [[.5, .9, .03, .05]], launch: 'right', launchY: .5, size: .6 }
  ];
  var stageEls = [];
  function zonesOf(c) { return (tier === 'mobile' && c.phone) || c.zones; }
  function collectStages() {
    stageEls = [];
    STAGES.forEach(function (s) {
      Array.prototype.forEach.call(d.querySelectorAll(s.sel), function (el) { stageEls.push({ el: el, cfg: s }); });
    });
  }
  function visibleRects() {
    var out = [];
    for (var i = 0; i < stageEls.length; i++) {
      var r = stageEls[i].el.getBoundingClientRect();
      var top = Math.max(r.top, 0), bot = Math.min(r.bottom, H);
      if (bot - top > 40 && r.right > 0 && r.left < W) out.push({ s: stageEls[i], r: r, top: top, bot: bot });
    }
    return out;
  }
  function inStage(x, y) {
    var v = visibleRects();
    for (var i = 0; i < v.length; i++) {
      var r = v[i].r;
      if (x >= r.left && x <= r.right && y >= v[i].top && y <= v[i].bot) return v[i];
    }
    return null;
  }

  /* Pick an empty spot in the most visible stage and launch toward it. */
  function scheduledLaunch(type, size) {
    var v = visibleRects();
    v.sort(function (a, b) { return (b.bot - b.top) - (a.bot - a.top); });
    // Use the first stage whose empty "sky" zone is actually on screen; otherwise skip.
    for (var i = 0; i < v.length; i++) {
      var st = v[i], r = st.r, z = pick(zonesOf(st.s.cfg));
      var h = Math.min(r.height, H);
      var tx = r.left + r.width * rnd(z[0], z[1]);
      var ty = r.top + h * rnd(z[2], z[3]);
      if (ty < st.top + 30 || ty > st.bot - 60) continue;
      return fireAt(st, r, tx, ty, type, size);
    }
    return false;
  }
  function fireAt(st, r, tx, ty, type, size) {
    var c = st.s.cfg;
    var fromRight = c.launch === 'right' || (c.launch === 'both' && tx > r.left + r.width / 2);
    var sx = fromRight ? r.left + r.width * rnd(.88, .99) : r.left + r.width * rnd(.01, .12);
    var sy = st.bot + 10;
    if (c.launchY) sy = Math.min(sy, r.top + Math.min(r.height, H) * c.launchY);
    if (sy - ty < 120) return false;
    launch(sx, sy, tx, ty, type, size * (c.size || 1), true);
    return true;
  }

  /* ---------- Petals (canvas, a few at a time, from the top) ---------- */
  var PETAL = ['#f39a1e', '#f7b733', '#e8730f', '#ffc94a'];
  function petal() {
    var count = 0;
    for (var i = 0; i < live.length; i++) if (live[i].kind === 'petal') count++;
    if (count >= T.petals) return;
    spawn({ x: rnd(.05, .95) * W, y: -14, vx: rnd(-14, 14), vy: rnd(26, 40), max: rnd(11, 16), kind: 'petal',
      col: pick(PETAL), size: rnd(5, 8), rot: rnd(0, 6.28), vr: rnd(-1.6, 1.6), sway: rnd(.6, 1.4), g: 0, drag: 0 });
  }

  /* ---------- Cursor sparks ---------- */
  var lastX = -1, lastY = -1;
  function cursorTrail(x, y) {
    if (lastX < 0) { lastX = x; lastY = y; return; }
    var dx = x - lastX, dy = y - lastY, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 14) return;
    lastX = x; lastY = y;
    var k = Math.min(3, 1 + (dist / 40) | 0);
    for (var i = 0; i < k; i++) {
      spawn({ x: x + rnd(-3, 3), y: y + rnd(-3, 3), vx: rnd(-22, 22) - dx * .3, vy: rnd(-30, 6) - dy * .3,
        max: rnd(.45, .85), col: Math.random() < .7 ? 'gold' : 'champagne', size: rnd(.9, 1.6), kind: 'cursor', drag: 2.6, g: 70 });
    }
  }
  function sparkle(x, y, k) {
    for (var i = 0; i < (k || 14); i++) {
      var a = Math.random() * Math.PI * 2, v = rnd(40, 130);
      spawn({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, max: rnd(.5, 1), col: pick(['gold', 'champagne', 'white']),
        size: rnd(1, 1.8), kind: 'cursor', drag: 2.4, g: 90, twinkle: true });
    }
  }

  /* ---------- Simulation + render ---------- */
  var raf = 0, last = 0, running = false, hidden = false, slow = 0;

  function wake() {
    if (running || hidden) return;
    running = true; last = 0;
    raf = w.requestAnimationFrame(frame);
  }

  function update(p, dt) {
    p.life += dt;
    if (p.kind === 'rocket') {
      var t = Math.min(1, p.life / p.dur), e = 1 - Math.pow(1 - t, 2.4);
      var ox = p.x, oy = p.y;
      p.x = p.bx + (p.tx - p.bx) * e + Math.sin(p.life * 22) * .6;
      p.y = p.sy + (p.ty - p.sy) * e;
      p.vx = (p.x - ox) / dt; p.vy = (p.y - oy) / dt;
      if (Math.random() < .9) spawn({ x: p.x + rnd(-1, 1), y: p.y + 2, vx: rnd(-14, 14), vy: rnd(10, 50),
        max: rnd(.35, .7), col: Math.random() < .5 ? 'amber' : 'gold', size: rnd(.8, 1.4), kind: 'trail', drag: 2, g: 60, clip: p.clip });
      if (t >= 1) { burst(p.x, p.y, p.burst.type, p.burst.size, p.clip); p.life = p.max; }
      return;
    }
    if (p.kind === 'petal') {
      p.x += (p.vx + Math.sin(p.life * p.sway * 1.8) * 22) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > H + 20) p.life = p.max;
      return;
    }
    if (p.kind === 'flash') return;
    var dr = Math.exp(-p.drag * dt);
    p.vx *= dr; p.vy = p.vy * dr + p.g * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.emit) {
      p.emitT += dt;
      if (p.emitT >= p.emit && p.life < p.max * .85) {
        p.emitT = 0;
        spawn({ x: p.x, y: p.y, vx: rnd(-6, 6), vy: rnd(0, 14), max: p.kind === 'willow' ? rnd(.6, 1.1) : rnd(.25, .5),
          col: p.kind === 'willow' ? 'amber' : p.col, size: p.size * .6, kind: 'trail', drag: 3, g: 40, clip: p.clip });
      }
    }
    if (p.crackle && p.life >= p.max) {
      for (var i = 0; i < 4; i++) spawn({ x: p.x, y: p.y, vx: rnd(-50, 50), vy: rnd(-40, 30), max: rnd(.2, .45),
        col: 'white', size: .9, drag: 2, g: 120, clip: p.clip, twinkle: true });
    }
  }

  function draw(p) {
    var k = p.life / p.max, a;
    if (p.kind === 'flash') {
      a = 1 - k; ctx.globalAlpha = a * a;
      ctx.drawImage(flashSprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      return;
    }
    if (p.kind === 'petal') {
      a = k < .1 ? k / .1 : k > .85 ? (1 - k) / .15 : 1;
      ctx.globalAlpha = a * .85;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, .55 + .35 * Math.sin(p.life * 3 + p.sway));
      ctx.fillStyle = p.col; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * .55, 0, 0, 6.283); ctx.fill();
      ctx.restore();
      return;
    }
    a = p.kind === 'rocket' ? 1 : Math.pow(1 - k, p.kind === 'willow' ? .9 : 1.25);
    if (p.twinkle && Math.random() < .35) a *= .2;
    var s = p.size * (p.kind === 'rocket' ? 1 : (1 - k * .5));
    var c = C[p.col];
    // Motion streak
    var sx = p.vx * p.streak, sy = p.vy * p.streak;
    if (p.kind !== 'trail' && p.kind !== 'cursor' && (sx * sx + sy * sy) > 1) {
      ctx.globalAlpha = a * .7;
      ctx.strokeStyle = 'rgb(' + c + ')'; ctx.lineWidth = s * 1.1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x - sx, p.y - sy); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    // Glowing head
    ctx.globalAlpha = a;
    var g = s * (p.kind === 'rocket' ? 6 : 4);
    ctx.drawImage(sprite(p.col), p.x - g, p.y - g, g * 2, g * 2);
  }

  function frame(ts) {
    if (!last) last = ts;
    var dt = Math.min(.05, (ts - last) / 1000); last = ts;

    // Adaptive quality: after ~1s of consistently slow frames, lower the particle cap (never below 45%).
    // One-off stalls (tab switches, long tasks) are ignored.
    if (dt > .028 && dt < .05) { if (++slow > 60) { T.cap = Math.max(MIN_CAP, Math.round(T.cap * .8)); slow = 0; } }
    else slow = 0;

    ctx.clearRect(0, 0, W, H);

    var i, p, vis = null, hasClip = false;
    for (i = live.length - 1; i >= 0; i--) {
      p = live[i];
      update(p, dt);
      if (p.life >= p.max) { live[i] = live[live.length - 1]; live.pop(); pool.push(p); }
    }
    for (i = 0; i < live.length; i++) if (live[i].clip) { hasClip = true; break; }

    if (hasClip) {
      vis = visibleRects();
      ctx.save();
      ctx.beginPath();
      for (i = 0; i < vis.length; i++) ctx.rect(vis[i].r.left, vis[i].top, vis[i].r.width, vis[i].bot - vis[i].top);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < live.length; i++) if (live[i].clip) draw(live[i]);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < live.length; i++) { p = live[i]; if (!p.clip && p.kind !== 'petal' && p.kind !== 'cursor') draw(p); }
    ctx.globalCompositeOperation = 'source-over';
    for (i = 0; i < live.length; i++) { p = live[i]; if (p.kind === 'petal' || p.kind === 'cursor') draw(p); }
    ctx.globalAlpha = 1;

    if (live.length) raf = w.requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  /* ---------- Scheduler ---------- */
  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function majorLoop() {
    later(function () {
      if (!hidden) {
        var t = pick(MAJOR), ok = scheduledLaunch(t, rnd(.85, 1.15));
        // Sometimes a companion rocket follows, never a barrage.
        if (ok && Math.random() < .35) later(function () { scheduledLaunch(pick(MAJOR), rnd(.7, .95)); }, rnd(450, 900));
      }
      majorLoop();
    }, rnd(T.major[0], T.major[1]));
  }
  function miniLoop() {
    later(function () {
      if (!hidden) {
        var v = visibleRects();
        if (v.length) {
          var st = pick(v), z = pick(zonesOf(st.s.cfg)), h = Math.min(st.r.height, H);
          var y = st.r.top + h * rnd(z[2], z[3]);
          if (y > st.top + 20 && y < st.bot - 40) burst(st.r.left + st.r.width * rnd(z[0], z[1]), y, 'mini', rnd(.7, 1.1) * (st.s.cfg.size || 1), true);
        }
      }
      miniLoop();
    }, rnd(T.mini[0], T.mini[1]));
  }
  function petalLoop() {
    later(function () { if (!hidden) petal(); petalLoop(); }, rnd(4500, 9000));
  }

  /* Opening moment: a short volley over the first visible stage. */
  function opening(big) {
    var plan = big ? [['chrysanthemum', 1.1], ['willow', 1], ['peony', .95], ['glitter', 1], ['starburst', .9]]
                   : [['peony', 1]];
    if (tier === 'mobile' && big) plan = plan.slice(0, 3);
    plan.forEach(function (it, i) { later(function () { scheduledLaunch(it[0], it[1]); }, 350 + i * rnd(380, 620)); });
  }

  /* ---------- Public API ---------- */
  var fx = {
    tier: tier,
    burst: function (x, y, type, size) { burst(x, y, type || 'peony', size || 1, false); },
    launch: function (x, y, tx, ty, type, size) { launch(x, y, tx, ty, type || 'peony', size || 1, false); },
    sparkle: sparkle,
    inStage: inStage,
    // Launch one rocket at the most visible dark section (same as the scheduler does).
    fire: function (type, size) { return scheduledLaunch(type || pick(MAJOR), size || 1); },
    start: function (opts) {
      opts = opts || {};
      collectStages();
      if (opts.opening !== false) opening(!!opts.bigOpening);
      later(majorLoop, 4000);
      later(miniLoop, 2500);
      later(petalLoop, 3000);
    },
    destroy: function () {
      clearTimers();
      w.cancelAnimationFrame(raf); running = false;
      live.length = 0;
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      w.removeEventListener('resize', onResize);
      d.removeEventListener('visibilitychange', onVis);
      d.removeEventListener('pointermove', onMove);
    },
    canvas: cv,
    stats: function () { return { live: live.length, cap: T.cap, tier: tier, lowPower: !!lowPower, running: running }; }
  };

  var rt = 0;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { resize(); collectStages(); }, 150); }
  function onVis() {
    hidden = d.visibilityState === 'hidden';
    if (hidden) { w.cancelAnimationFrame(raf); running = false; }
    else if (live.length) wake();
  }
  function onMove(e) { if (e.pointerType === 'mouse') cursorTrail(e.clientX, e.clientY); }

  function mount() {
    d.body.appendChild(cv);
    resize();
    w.addEventListener('resize', onResize, { passive: true });
    d.addEventListener('visibilitychange', onVis);
    if (fine) d.addEventListener('pointermove', onMove, { passive: true });
  }
  if (d.body) mount(); else d.addEventListener('DOMContentLoaded', mount, { once: true });

  API.fx = fx;
})(window, document);
