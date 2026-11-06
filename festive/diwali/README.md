# Diwali 2026 — "Lighting up the future" (temporary)

A self-contained festive layer. It turns itself off at **12 Nov 2026, 00:00 IST**
(`EXPIRES_AT` in `diwali.config.js`). After that, the site looks exactly as it did before.

## Files

| File | Purpose |
|---|---|
| `diwali.config.js` | The one switch: `ENABLED`, `EXPIRES_AT`, a toggle per feature, all greeting text. Checks the date and loads the other files only while active. |
| `diwali.fx.js` | Fireworks and sparks engine: one transparent, click-through canvas. |
| `diwali.js` | Decorations, interactions, the first-visit intro, and `teardown()`. |
| `diwali.css` | All styles. Every selector targets a `c5d-` element created by this module. |

Integration point: one block marked `[DIWALI-2026]` at the end of `js/main.js`.
No HTML page was edited.

## What it adds

- **Intro** (once per browser session): the screen dims, a diya lights, "Lighting up the future /
  Celebrating the Festival of Lights" rises, and the flame launches the first fireworks. About 4
  seconds long, click-through, closed by Skip, Esc or scrolling.
- **Fireworks**: rockets climb from the lower corners of the dark sections (hero, inner-page
  banners, Selected Work, closing CTA, footer) and burst in six patterns: chrysanthemum, peony,
  glitter, willow, starburst and mini bursts. Bursts are clipped to those dark sections and
  aimed at their empty areas, away from headings and buttons. There is a major rocket every
  8–14 s and small bursts in between; phones get fewer.
- **Interaction**:
  - A gold spark trail follows the mouse.
  - Clicking or tapping empty dark sky sets off a small burst. Links and buttons are never affected.
  - Diyas and rangoli glow brighter as the cursor comes near.
- **Surprise**: click the diya in the hero greeting, or any footer diya. The flame flares, sparks
  rise, and the flame becomes a rocket that opens into a celebration.
- **Lanterns, petals, embers**: sky lanterns drift up in the dark sections, an occasional
  marigold petal falls, and golden embers rise in the hero.
- **Rangoli**: self-drawing line art (lotus, star lattice, paisleys, dot border):
  - Hero: large and slowly turning.
  - Inner-page banners: on the empty right side.
  - Services: a small medallion in the corner.
  - Homepage "Our approach": a watermark in the lower-right corner.
  - About page: a medallion above the story heading.
- **Toran and garland**: marigold and mango leaves under the header (tucks away on scroll) and
  along the top of the footer.
- **Floral installation (left and right edges)**: a marigold-and-jasmine garland draped from each top
  corner, with a focal piece (left: a jasmine-ringed marigold rosette with a bell; right: a lit diya on a
  yellow-marigold lotus). Below it hang layered strands of different lengths: marigold and jasmine,
  gold beads, mango-leaf pairs and floral bunches, ending in brass bells, gold ornaments, a jasmine
  tassel, a jhoomar or a hanging diya. Short gold drops hang between the strands.
  - It stays in the empty band beside the content and scales with it: richest on wide screens,
    simpler on laptops, and small corner pieces on phones.
  - Any strand that would reach the hero arrows, the greeting pill or the hero or banner text is shortened.
  - The strands sway, bells swing and ornaments glint, each on its own timing, and an occasional petal falls.
  - The old footer marigold string is off (`footerGarland: false`); the side installations replace it.
- **Footer blessing**: five diyas that light one by one, with "Wishing you a bright and
  beautiful Diwali."

## Performance and accessibility

- **Load:** nothing extra loads after expiry or when switched off, apart from the small config file.
- **Particles:** pooled, with a hard cap (desktop 1500, tablet 800, phone 480; lower on
  low-memory or data-saver devices). Quality drops by itself if frames run slow for a while.
- **Animation loop:** runs only while something is moving, and stops when the tab is hidden.
- **Touch screens:** no mouse effects. Taps still work.
- **Reduced motion:** no intro, fireworks, lanterns or embers. Diyas are simply lit and the rangoli is drawn.

## Turn it off (no code removal)

In `diwali.config.js` set:

```js
ENABLED: false,
```

The layer is gone on the next page load. To drop just one piece, set its entry in `FEATURES` to `false`.

## Remove it completely

1. Delete the `festive/diwali/` folder.
2. In `js/main.js`, delete the block between
   `/* ---------- [DIWALI-2026] ...` and `/* ---------- [/DIWALI-2026] ---------- */`.

## Expiry

`isActive()` compares the browser's current time with `Date.parse('2026-11-12T00:00:00+05:30')`.
The `+05:30` offset fixes the cutoff to IST in every time zone. The check runs on every page
load and on every return to the tab, so it needs no timer and no stored state. If a tab stays
open past the cutoff, the layer removes itself the next time the tab is shown.
