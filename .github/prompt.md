# ROLE
You are a senior frontend engineer specializing in performant, accessible, dependency-free
web UIs. Build a visual interactive frontend for a decentralized services hub.

# HARD CONSTRAINTS
- Plain HTML + CSS only. JavaScript allowed ONLY where explicitly required below
  (button config rendering, theme toggle, gradient randomizer). No frameworks, no build step,
  no bundlers, no external JS libraries.
- Must render acceptably on old/low-DPI devices: avoid expensive effects on the main thread,
  keep DOM tiny, no layout thrash, no animation loops.
- Base font size 20px. Large touch targets. WCAG-friendly contrast in both themes.
- Fonts: "Funnel Display" (headings) and "Funnel Sans" (body/UI), loaded via @font-face from
  local files already present in /fonts/. Include robust fallback stack:
  'Funnel Sans', 'Segoe UI', system-ui, sans-serif. Emoji must render via OpenMoji assets
  stored locally in /icons/openmoji/ (SVG files, named by codepoint, e.g. 1F517.svg).
  Reference them with <img> tags pointing at those files — do NOT rely on system emoji fonts.

# LAYOUT
- Centered single-column flow like Nextcloud Dashboard: everything horizontally centered,
  generous vertical rhythm, big margins/padding around the content block.
- A header (hub title + short tagline), then the button grid, then footer.
- Button grid: flex container, wrap enabled, justify-content: center, consistent gap.
  Up to 5 buttons per row. The 6th wraps onto a new row and centers itself naturally
  (flexbox centering does this automatically — do NOT use fixed-width columns or grids
  that force left-alignment of orphan items).
- Buttons are large, floating cards: rounded corners, soft shadow, subtle hover lift
  (transform only, no box-shadow animation). Each card = OpenMoji SVG icon + label + one-line hint.

# BUTTON CONFIGURATION (single source of truth)
Define ALL buttons in one JS array near the top of the script so adding a service means
appending one object and touching nothing else:

const SERVICES = [
  { id:'kutt',   name:'Link Shortener', hint:'Versatile URLs',     icon:'1F517', href:'/kutt/' },
  { id:'lufi',   name:'File Drop',      hint:'Temporary storage',  icon:'1F4E4', href:'/lufi/' },
  { id:'invid',  name:'Video Frontend', hint:'Invidious instance', icon:'1F3AC', href:'/invidious/' },
  { id:'ffmpeg', name:'Media Convert',  hint:'ffmpeg-web tools',  icon:'1F39E', href:'/ffmpeg/' }
];

Render cards from this array into the grid container. Provide a <noscript> fallback listing
the same links as plain anchors.

# BACKGROUND
- Blurry gradient background using layered radial-gradients + filter: blur() on a fixed,
  oversized pseudo-element behind content (avoid backdrop-filter for perf).
- On every page load, regenerate the gradient: pick randomized hue stops within a curated
  palette range (see dark mode note), apply via CSS custom properties set once by JS.
  Randomize only hues/positions — never re-randomize on resize or scroll.
- Respect prefers-reduced-motion: disable transitions/animations when set.

# DARK MODE
- Auto-detect via prefers-color-scheme on first visit.
- Manual toggle button (top-right, keyboard-accessible, aria-pressed) overrides detection.
- Persist choice in localStorage (key: 'theme'; values: 'dark' | 'light'). Read localStorage
  early in the script (before the DOM renders the toggle) to prevent flash-of-wrong-theme.
- Dark mode must SHIFT the gradient palette to deep tones (e.g. indigo→teal at low lightness),
  NOT invert colors. Define palettes as two sets of CSS custom properties on :root vs [data-theme="dark"].

# DELIVERABLES
1. index.html
2. styles.css
3. app.js (small: config array, card renderer, theme init/toggle, gradient randomizer)
Comment the code generously so future edits stay safe.