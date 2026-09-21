# Unify CMS V6 — Landing Page

Static HTML5 / CSS3 / Bootstrap 5 / vanilla JS build of the Unify CMS V6
funnel landing page, built pixel-accurate to the Figma spec (1280px
artboard, 1140px container).

## Folder structure

```
unify-cms-landing/
├── index.html                  # Entry point — the only HTML page
├── README.md
├── assets/
│   ├── images/                 # Real photography / raster assets go here
│   └── icons/                  # Standalone SVG/icon assets (favicons etc.)
├── src/
│   ├── styles/
│   │   ├── main.css            # Entry stylesheet — imports everything below, in order
│   │   ├── base/
│   │   │   ├── _tokens.css     # Design tokens: color, type, spacing, layout (single source of truth)
│   │   │   └── _reset.css      # Bare element defaults, no classes
│   │   ├── layout/
│   │   │   └── _container.css  # .container-pp — the fixed 1140px pixel-perfect container
│   │   ├── components/         # One file per visual section/component
│   │   │   ├── _header.css
│   │   │   ├── _buttons.css
│   │   │   ├── _hero.css
│   │   │   ├── _logo-strip.css
│   │   │   ├── _statement.css
│   │   │   ├── _features.css
│   │   │   ├── _band.css
│   │   │   ├── _process.css
│   │   │   ├── _ingredients.css
│   │   │   ├── _compare.css
│   │   │   ├── _cta.css
│   │   │   ├── _testimonials.css
│   │   │   ├── _faq.css
│   │   │   └── _footer.css
│   │   └── utilities/
│   │       └── _responsive.css # Cross-component responsive rules only
│   └── scripts/
│       └── main.js             # Page-specific JS (mobile nav toggle, etc.)
└── docs/                        # Design notes, QA checklists, handoff docs
```

## Why this structure

This follows the **ITCSS-inspired 7-1 pattern** (the same family of conventions
used by Sass/BEM-based design systems at scale), adapted for a no-build-step
static project:

1. **`base/`** – tokens and resets. Nothing here targets a class; it only sets
   global defaults and defines the variables everything else consumes.
2. **`layout/`** – structural primitives shared across many components
   (currently just the pixel-perfect container).
3. **`components/`** – one file per section, named after what it is, not
   where it sits on the page. Each file is self-contained and can be deleted,
   reused, or handed to another dev without hunting through a monolith.
4. **`utilities/`** – rules that intentionally cut across components
   (e.g. `prefers-reduced-motion`). Loaded last so it always wins the cascade
   when needed.

This scales cleanly: adding a new page means adding new files under
`components/`/`pages/` and one new `<link>`/`<script>` — never touching the
existing ones.

## Design tokens

All color, type, spacing, and layout values live in
`src/styles/base/_tokens.css` as CSS custom properties. Every other file
consumes tokens (`var(--space-6)`, `var(--color-ink-500)`, etc.) instead of
hard-coded values. Changing a token cascades everywhere it's used — this is
the mechanism that keeps the build pixel-accurate to Figma over time instead
of drifting file by file.

## Pixel-perfect container

`.container-pp` (in `layout/_container.css`) is fixed to `max-width: 1140px`
— the Figma container width at the 1280px reference artboard — and centered.
From roughly 1200px viewport width upward (laptop → 1440p → 4K → ultrawide),
the inner content sits at that exact measurement; extra screen width becomes
side margin rather than stretching the layout. Below that, standard Bootstrap
breakpoints take over inside the grid (`row`/`col-*`).

Browser zoom (100% → 25%) does not need special handling: zoom uniformly
scales the whole rendered page after layout, so relative on-screen positions
are preserved automatically at any zoom level with this or any standard
layout.

## Note on `@import` in `main.css`

`main.css` uses `@import` purely for file organization in a project with no
build step. Browsers will request each partial serially, which is fine for
a project this size but not ideal at high traffic. If/when this project gets
a bundler (Vite, esbuild, etc.), switch `main.css` to real Sass/PostCSS
`@use`/`@import` compiled into one file, or simply concatenate the partials
during a build step — no HTML changes required either way.

## Tech stack

- HTML5
- CSS3 (custom properties / design tokens, no preprocessor required)
- Bootstrap 5.3 (CDN) — grid, flex utilities, accordion component only
- Vanilla JS (mobile nav toggle; Bootstrap's bundle JS drives the accordion)
- Static/placeholder data throughout — no backend, no build step required to run

## Running locally

No build step needed — open `index.html` directly in a browser, or serve the
folder with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```
