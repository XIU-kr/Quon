# Quon

**Free Custom QR Code Generator** — [quon.xiu.kr](https://quon.xiu.kr)

A browser-based QR code studio. No signup, no upload, 100% local generation.

![Quon](assets/images/og-image.png)

---

## Overview

Quon is a dark-themed QR code generator that supports six content types —
URL, text, vCard, email, phone, and Wi-Fi. Enter your content, pick a design,
and download a high-resolution PNG or SVG in a single tap. Every QR is
rendered in the browser; your data never leaves the device.

## Features

### Six QR types

| Type | Use case | Notes |
|---|---|---|
| **URL** | Websites · landing pages | Internationalized domain support |
| **Text** | Notes · snippets | Up to ~2 KB of raw content |
| **vCard** | Contact cards | RFC 2426, iOS compatible, non-ASCII quoted-printable |
| **Email** | Recipient + subject + body | mailto syntax |
| **Phone** | International dial codes | tel: scheme |
| **Wi-Fi** | SSID + password + security | ISO/IEC 18004 Annex F, special-char escaping |

### Custom design

- 6 built-in design presets + 3 user preset slots
- Independent control over dot, corner, and background colors
- Center logo overlay (PNG / JPG upload)
- 6 dot shapes, 3 corner-square styles, 2 corner-dot styles

### Export & history

- One-tap **PNG / SVG** download
- Auto-generated filenames: `qrcode-<type>-<timestamp>.<ext>`
- Last 5 generations auto-tracked + 2 pinned favorite slots
- Search, filter, and sort your history
- All state persisted in browser `localStorage` — never leaves the device

### Privacy & performance

- QR generation runs **entirely in the browser** (zero bytes sent to any server)
- Lightweight static site — no bundler, no build step
- Strong Lighthouse scores across SEO, performance, and accessibility

### Internationalization & accessibility

- Korean / English with auto-detection and manual switch
- Respects `prefers-reduced-motion`
- Full keyboard navigation
- Screen-reader friendly markup

## How to use

1. On the **Create** tab, pick a type card — URL, text, vCard, email, phone, or Wi-Fi
2. Fill in the form for that type
3. (Optional) Switch to the **Design** tab to tweak colors, dot shape, corner style, and logo
4. Hit **Generate**, then download as **PNG** or **SVG** from the **Export** tab

## License

[MIT License](LICENSE) © XIU
