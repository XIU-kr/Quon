# Quon

Free custom QR code generator — [quon.xiu.kr](https://quon.xiu.kr)

Static vanilla HTML/CSS/JS. No build step, no framework. QR rendering via [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) (CDN).

## Features

- 6 QR types: URL, text, vCard, email, tel, Wi-Fi
- Design presets + custom presets (3 slots) + logo embedding
- PNG / SVG export
- History (5 recent) + pins (2)
- i18n (en, ko) — `locales/*.js`, see `i18n.js`

## Dev

```bash
npx serve .        # or: python -m http.server 8000
```

Deployed via GitHub Pages (CNAME → quon.xiu.kr).

## Layout

| File | Role |
|---|---|
| `index.html` | Markup |
| `script.js` | App logic (QR gen, state, history, presets) |
| `styles.css` | Dark emerald theme |
| `i18n.js` + `locales/` | Translations |
| `adblock-detector.js` | Adblock fallback prompt |
