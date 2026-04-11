# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Quon is a free custom QR code generator hosted at **quon.xiu.kr** via GitHub Pages. It is a **pure static site with no build step, no bundler, no framework** — just vanilla HTML/CSS/JS plus the `qr-code-styling` v1.5.0 library loaded from a CDN.

## Dev

There is nothing to build. Serve the directory statically:

```bash
npx serve .
# or
python -m http.server 8000
```

No CI, no tests, no linter. Deployed via GitHub Pages — commits to `main` publish automatically. The custom domain is configured through GitHub's repo settings (no `CNAME` file in-tree).

## Architecture

Four core files drive the whole app:

| File | Role |
|---|---|
| `index.html` | Semantic markup. Left panel uses a **tabbed interface** (Content / Design / History / Presets) — not a multi-column layout. |
| `script.js` | ~1850 lines. QR generation, validation, state, history/pins, custom presets. |
| `styles.css` | CSS custom properties, dark **Obsidian Emerald** theme (`--accent: #1aad6c`), glassmorphism, atmospheric glow layers. |
| `i18n.js` + `locales/{en,ko}.js` | Async language loader. Each locale file exposes a global (e.g. `window.en`). |

`adblock-detector.js` detects ad blockers and shows a graceful localized prompt instead of blank ad slots.

### QR type system

Six types share one code path: `url`, `text`, `vcard`, `email`, `tel`, `wifi`. Each has its own `#form-<type>` section in the HTML. `currentType` (global) selects the active form. Per-type content formatting and validation live in `script.js`.

- **vCard**: RFC 2426 compliant, iOS-friendly. Non-ASCII characters use quoted-printable encoding.
- **Wi-Fi**: ISO/IEC 18004 Annex F syntax with special-char escaping.

### State + persistence

Runtime state is plain globals. Persistence is localStorage with a `quon_` prefix. Every read/write is wrapped in try/catch because quota errors are expected. Keys currently in use:

```
quon_design_panel_state   quon_recent_settings   quon_draft_inputs
quon_generation_history   quon_history_pins      quon_custom_presets
quon_history_view         quon_last_preset       quon_language
```

History keeps the last 5 generations, with 2 pinnable slots. Custom presets occupy 3 user slots in addition to 6 built-in design presets.

### Export

`qrCode.download()` drives PNG/SVG export. Filenames follow `qrcode-<type>-<timestamp>.<ext>`.

## i18n — adding a language

1. Copy `locales/en.js` to `locales/<code>.js` and translate values (keep keys identical).
2. Add the code to `SUPPORTED_LANGUAGES` in `i18n.js`.
3. Optionally extend `detectLanguage()` for custom browser mapping.

DOM elements opt in via three data attributes: `data-i18n` (textContent), `data-i18n-aria` (aria-label), `data-i18n-title` (title). `t(key)` returns the translated string and falls back to English if missing.

## Conventions

- **No npm runtime deps.** Keep external code CDN-loaded; never introduce a bundler.
- **Event-driven DOM updates.** There is no virtual DOM or reactivity layer — mutate the DOM directly and call the relevant `render*` function.
- **Bilingual UI, English code.** All identifiers, comments, and commit messages are English; user-facing copy lives only in `locales/*.js`.
- **Google AdSense + gtag.js** are wired in `index.html`. Ad-block fallback is handled by `adblock-detector.js`.
- **SEO assets** (`robots.txt`, `sitemap.xml`, `og-image.png`, icon PNGs, JSON-LD in `<head>`) reference `https://quon.xiu.kr/`. Update all of them together if the domain changes.

## Things that used to exist (don't re-add)

These features were intentionally removed and should not be rebuilt absent a new requirement:

- **Scan quality checker** (`evaluateScanQuality`, `quality.*` i18n keys, `#quality-check` DOM).
- **Preset marketplace** (`renderPresetMarket`, `.preset-market-*` styles).
- **CTA A/B testing** (`ctaVariant`, `trackCtaMetric`, `hero.cta.primary.variant*`).
- **"Fill Example" button** (`fillExampleContent`, `button.fill.example`).
