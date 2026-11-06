/* ==========================================================================
   Core5 · Diwali 2026 festive layer — CENTRAL CONFIG + GATE
   --------------------------------------------------------------------------
   This file is the only switch for the whole Diwali experience.

   • ENABLED: false   → the festive layer disappears on the next page load.
   • EXPIRES_AT       → the layer stops rendering at this instant, by itself.
                        "+05:30" pins it to Indian Standard Time, whatever the
                        visitor's own time zone is.

   If the layer is off or expired, this script does nothing else: the festive
   CSS and JS are never downloaded and the page stays exactly as it was.
   ========================================================================== */
(function (w, d) {
  'use strict';

  var CONFIG = {
    ENABLED: true,

    // Active through 11 Nov 2026; off from midnight entering 12 Nov (IST).
    EXPIRES_AT: '2026-11-12T00:00:00+05:30',

    // Turn individual pieces on/off without touching any other code.
    FEATURES: {
      intro: true,          // short "Lighting up the future" moment, once per browser session
      fireworks: true,      // rockets + bursts in the dark sections (canvas, diwali.fx.js)
      clickBursts: true,    // click/tap on empty dark sky → small burst
      festiveHeader: true,
      stringLights: false,  // hanging bulb lights under navbar disabled per request  // red + gold nav bar with mandalas and string lights (all pages)
      toran: true,          // marigold jhalar hanging under the navbar (all pages)
      heroLights: true,     // rangoli, warm cursor light and embers in the homepage hero
      heroGreeting: true,   // greeting pill with the "light the diya" surprise (wide screens)
      lanterns: true,       // sky lanterns drifting up in dark sections
      bannerRangoli: true,  // rangoli on inner-page banners
      sectionAccents: true, // services medallion, about watermark, project sparkles
      footerBlessing: true, // diyas and greeting in the footer (all pages)
      footerGarland: false, // simple marigold string along the footer top (off: replaced by the side installations)
      floralInstallation: true // luxury marigold/jasmine installations along the left and right edges (all pages)
    },

    GREETING: {
      introKicker: 'Lighting up the future',
      introTitle: 'Celebrating the Festival of Lights',
      introFrom: 'Shubh Deepavali from Core5',
      kicker: 'Shubh Deepavali · 2026',
      heroLine: 'Lighting up the future',
      titleBefore: 'Wishing you a ',
      titleEm: 'bright',
      titleAfter: ' and beautiful Diwali.',
      message: 'May the festival of light illuminate every idea you build. — Team Core5'
    }
  };

  /* Pure date gate. `now` is optional (ms or Date) so it can be tested with any instant. */
  function isActive(now) {
    if (CONFIG.ENABLED !== true) return false;
    var end = Date.parse(CONFIG.EXPIRES_AT);
    if (isNaN(end)) return false;                       // bad date → fail closed
    var t = now == null ? Date.now() : +now;
    return t < end;
  }

  w.C5_DIWALI = { config: CONFIG, isActive: isActive };

  if (!isActive()) return;

  // Load the stylesheet first, then the fireworks engine and the decorations, in order.
  var self = d.currentScript;
  var base = self && self.src ? self.src.replace(/[^\/]*(\?.*)?$/, '') : 'festive/diwali/';
  var css = d.createElement('link');
  css.rel = 'stylesheet';
  css.href = base + 'diwali.css';
  css.setAttribute('data-c5d', '');
  css.onload = function () {
    ['diwali.fx.js', 'diwali.js'].forEach(function (f) {
      var js = d.createElement('script');
      js.src = base + f;
      js.async = false;                                // keep execution order
      js.setAttribute('data-c5d', '');
      d.head.appendChild(js);
    });
  };
  d.head.appendChild(css);
})(window, document);
