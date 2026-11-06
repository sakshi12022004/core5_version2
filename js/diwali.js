/**
 * DIWALI CELEBRATION ANIMATION
 * Auto-expires: 10 November 2026
 * Features: Fireworks, Diyas, String Lights, Mithai, Sparkles, Banner
 */
(function () {
  'use strict';

  // ── Auto-expire check ──────────────────────────────────────────────
  const EXPIRE_DATE = new Date('2026-11-11T00:00:00+05:30');
  if (new Date() > EXPIRE_DATE) return;

  // ── State ──────────────────────────────────────────────────────────
  let animRunning = true;
  let fireworksRAF = null;

  // ── Inject CSS ─────────────────────────────────────────────────────
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/diwali.css';
  document.head.appendChild(link);

  // ── Helpers ────────────────────────────────────────────────────────
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max)); }
  function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── 1. Happy Diwali Banner ─────────────────────────────────────────
  function createBanner() {
    const wrap = document.createElement('div');
    wrap.className = 'diwali-banner';
    wrap.innerHTML = `
      <div class="diwali-banner-inner">
        <span class="diwali-banner-emoji">🪔</span>
        <div>
          <div class="diwali-banner-title">✨ Happy Diwali 2026 ✨</div>
          <div class="diwali-banner-sub">From the Core5 Team — Wishing you light, joy &amp; prosperity</div>
        </div>
        <span class="diwali-banner-emoji">🎆</span>
      </div>`;
    document.body.appendChild(wrap);

    // fade out banner after 7 seconds
    setTimeout(() => {
      wrap.style.transition = 'opacity 1.5s ease';
      wrap.style.opacity = '0';
      setTimeout(() => wrap.remove(), 1600);
    }, 7000);
  }

  // ── 2. String Lights (SVG) ─────────────────────────────────────────
  function createStringLights() {
    const colors = [
      '#FF3B30','#FF9500','#FFCC00','#30D158','#5AC8FA',
      '#BF5AF2','#FF2D55','#FF6B00','#FFD60A','#34C759',
    ];

    const W = window.innerWidth;
    const bulbCount = Math.max(14, Math.floor(W / 70));
    const svgNS = 'http://www.w3.org/2000/svg';

    const wrap = document.createElement('div');
    wrap.className = 'diwali-lights-top';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} 110`);
    svg.setAttribute('preserveAspectRatio', 'none');

    // Draw wire/rope as a catenary-like polyline
    const pts = [];
    for (let i = 0; i <= bulbCount; i++) {
      const x = (W / bulbCount) * i;
      const sag = Math.sin((i / bulbCount) * Math.PI) * 22 + 8;
      pts.push([x, sag]);
    }

    const wirePath = document.createElementNS(svgNS, 'polyline');
    wirePath.setAttribute('class', 'diwali-wire');
    wirePath.setAttribute('points', pts.map(p => p.join(',')).join(' '));
    svg.appendChild(wirePath);

    // Draw bulbs
    pts.forEach((pt, idx) => {
      if (idx === 0 || idx === pts.length - 1) return;
      const color = colors[idx % colors.length];
      const cx = pt[0];
      const cy = pt[1];

      // bulb body (teardrop-ish using ellipse)
      const ell = document.createElementNS(svgNS, 'ellipse');
      ell.setAttribute('cx', cx);
      ell.setAttribute('cy', cy + 14);
      ell.setAttribute('rx', 8);
      ell.setAttribute('ry', 11);
      ell.setAttribute('fill', color);
      ell.setAttribute('class', 'diwali-bulb');
      ell.style.animationDelay = `${rand(0, 1.2)}s`;
      ell.style.filter = `drop-shadow(0 0 6px ${color})`;
      svg.appendChild(ell);

      // bulb cap
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', cx - 4);
      rect.setAttribute('y', cy + 2);
      rect.setAttribute('width', 8);
      rect.setAttribute('height', 5);
      rect.setAttribute('fill', '#888');
      rect.setAttribute('rx', 2);
      svg.appendChild(rect);

      // glow circle
      const glow = document.createElementNS(svgNS, 'ellipse');
      glow.setAttribute('cx', cx);
      glow.setAttribute('cy', cy + 14);
      glow.setAttribute('rx', 14);
      glow.setAttribute('ry', 18);
      glow.setAttribute('fill', color);
      glow.setAttribute('opacity', '0.18');
      glow.setAttribute('class', 'diwali-bulb');
      glow.style.animationDelay = `${rand(0, 1.2)}s`;
      svg.insertBefore(glow, ell);
    });

    wrap.appendChild(svg);
    document.body.appendChild(wrap);
  }

  // ── 3. Floating Diyas ─────────────────────────────────────────────
  function createDiyas() {
    const diyas = ['🪔', '🕯️', '🪔', '🕯️', '🪔'];
    const positions = [
      { left: '4%', bottom: '12%' },
      { left: '10%', bottom: '25%' },
      { right: '4%', bottom: '15%' },
      { right: '10%', bottom: '28%' },
      { left: '50%', bottom: '8%' },
    ];
    positions.forEach((pos, i) => {
      const el = document.createElement('div');
      el.className = 'diwali-diya';
      el.textContent = diyas[i % diyas.length];
      Object.assign(el.style, pos, {
        animationDelay: `${rand(0, 3)}s`,
        animationDuration: `${rand(4, 7)}s`,
        fontSize: `${rand(28, 46)}px`,
      });
      document.body.appendChild(el);
    });
  }

  // ── 4. Floating Mithai ─────────────────────────────────────────────
  function createMithai() {
    const items = ['🍬', '🍭', '🧁', '🍮', '🍯', '🎁', '🍮'];
    const positions = [
      { left: '15%', top: '70%' },
      { right: '15%', top: '65%' },
      { left: '30%', top: '80%' },
      { right: '28%', top: '75%' },
      { left: '7%',  top: '50%' },
    ];
    positions.forEach((pos, i) => {
      const el = document.createElement('div');
      el.className = 'diwali-mithai';
      el.textContent = randItem(items);
      Object.assign(el.style, pos, {
        animationDelay: `${rand(0, 4)}s`,
        animationDuration: `${rand(6, 10)}s`,
      });
      document.body.appendChild(el);
    });
  }

  // ── 5. Sparkle Stars ──────────────────────────────────────────────
  function createSparkles() {
    const sparkles = ['✨', '⭐', '🌟', '💫', '✨', '🌠'];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('div');
      el.className = 'diwali-sparkle';
      el.textContent = randItem(sparkles);
      el.style.left = `${rand(5, 95)}%`;
      el.style.top = `${rand(10, 90)}%`;
      el.style.fontSize = `${rand(14, 28)}px`;
      el.style.animationDelay = `${rand(0, 2)}s`;
      el.style.animationDuration = `${rand(1, 2.5)}s`;
      document.body.appendChild(el);
    }
  }

  // ── 6. Fireworks Canvas ────────────────────────────────────────────
  function createFireworks() {
    const canvas = document.createElement('canvas');
    canvas.id = 'diwali-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
      constructor(x, y, color, angle, speed, life) {
        this.x = x; this.y = y;
        this.color = color;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = life;
        this.maxLife = life;
        this.radius = rand(1.5, 3.5);
        this.gravity = 0.045;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 7) this.trail.shift();
        this.vx *= 0.97;
        this.vy = this.vy * 0.97 + this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
      }
      draw(ctx) {
        const alpha = this.life / this.maxLife;
        // trail
        for (let t = 0; t < this.trail.length; t++) {
          const a = (t / this.trail.length) * alpha * 0.5;
          ctx.beginPath();
          ctx.arc(this.trail[t].x, this.trail[t].y, this.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = this.color.replace('1)', `${a})`);
          ctx.fill();
        }
        // main dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('1)', `${alpha})`);
        ctx.shadowColor = this.color.replace('1)', '0.8)');
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      isDead() { return this.life <= 0; }
    }

    // Rocket class
    class Rocket {
      constructor() {
        this.x = rand(canvas.width * 0.1, canvas.width * 0.9);
        this.y = canvas.height + 10;
        this.targetY = rand(canvas.height * 0.08, canvas.height * 0.42);
        this.speed = rand(10, 18);
        this.color = randItem(COLORS);
        this.exploded = false;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        this.y -= this.speed;
        this.speed *= 0.98;
        if (this.y <= this.targetY) this.explode();
      }
      explode() {
        this.exploded = true;
        const count = randInt(90, 140);
        const shape = randItem(['circle', 'star', 'heart', 'chrysanthemum']);
        for (let i = 0; i < count; i++) {
          let angle = (i / count) * Math.PI * 2;
          let speed = rand(2.5, 7);
          if (shape === 'star') {
            angle = (Math.round(i / (count / 10)) / 10) * Math.PI * 2;
            speed = (i % 2 === 0) ? rand(5, 8) : rand(1.5, 3);
          } else if (shape === 'heart') {
            const t = (i / count) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            angle = Math.atan2(hy, hx);
            speed = rand(2, 5);
          } else if (shape === 'chrysanthemum') {
            angle = (i / count) * Math.PI * 2;
            speed = rand(3, 8) * (0.5 + 0.5 * Math.sin(angle * 6));
          }
          const c = this.color;
          particles.push(new Particle(this.x, this.y, c, angle, speed, randInt(55, 90)));
        }
        // secondary smaller burst
        const c2 = randItem(COLORS);
        for (let i = 0; i < 40; i++) {
          particles.push(new Particle(
            this.x, this.y, c2,
            rand(0, Math.PI * 2), rand(1, 4),
            randInt(30, 55)
          ));
        }
      }
      draw(ctx) {
        for (let t = 0; t < this.trail.length; t++) {
          const a = t / this.trail.length;
          ctx.beginPath();
          ctx.arc(this.trail[t].x, this.trail[t].y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 100, ${a * 0.7})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe066';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const COLORS = [
      'rgba(255,80,80,1)',
      'rgba(255,165,0,1)',
      'rgba(255,220,0,1)',
      'rgba(100,220,100,1)',
      'rgba(100,160,255,1)',
      'rgba(220,100,255,1)',
      'rgba(255,100,200,1)',
      'rgba(0,220,230,1)',
      'rgba(255,255,100,1)',
      'rgba(255,140,50,1)',
    ];

    let particles = [];
    let rockets = [];
    let lastLaunch = 0;
    let launchInterval = rand(600, 1200);

    function loop(ts) {
      if (!animRunning) return;
      fireworksRAF = requestAnimationFrame(loop);

      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch new rockets
      if (ts - lastLaunch > launchInterval) {
        const batch = randInt(1, 3);
        for (let b = 0; b < batch; b++) {
          rockets.push(new Rocket());
        }
        lastLaunch = ts;
        launchInterval = rand(400, 1000);
      }

      // Update + draw rockets
      rockets = rockets.filter(r => {
        r.update();
        if (!r.exploded) r.draw(ctx);
        return !r.exploded;
      });

      // Update + draw particles
      particles = particles.filter(p => {
        p.update();
        p.draw(ctx);
        return !p.isDead();
      });
    }

    fireworksRAF = requestAnimationFrame(loop);
    return canvas;
  }

  // ── 7. Close Button ────────────────────────────────────────────────
  function createCloseButton() {
    const btn = document.createElement('button');
    btn.className = 'diwali-close';
    btn.innerHTML = '✕';
    btn.title = 'Close Diwali celebration';
    btn.addEventListener('click', () => {
      animRunning = false;
      if (fireworksRAF) cancelAnimationFrame(fireworksRAF);
      document.querySelectorAll(
        '.diwali-lights-top, #diwali-canvas, .diwali-diya, .diwali-mithai, .diwali-sparkle, .diwali-banner, .diwali-close'
      ).forEach(el => {
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 650);
      });
    });
    document.body.appendChild(btn);
  }

  // ── 8. Init everything after DOM ready ────────────────────────────
  function init() {
    createStringLights();
    createBanner();
    createDiyas();
    createMithai();
    createSparkles();
    createFireworks();
    createCloseButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // slight delay so page renders first
    setTimeout(init, 200);
  }

})();
