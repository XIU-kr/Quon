import sharp from 'sharp';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const imagesDir = resolve(here, '..', 'assets', 'images');
const brandPath = resolve(imagesDir, 'brand.svg');

const brandSvg = await readFile(brandPath);

const rasterTargets = [
  { name: 'icon-32.png',          size: 32  },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of rasterTargets) {
  const out = resolve(imagesDir, name);
  await sharp(brandSvg, { density: Math.max(96, size) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const { size: bytes } = await stat(out);
  console.log(`  ${name.padEnd(24)} ${size}x${size}  ${bytes.toLocaleString()} B`);
}

{
  const out = resolve(imagesDir, 'quon.webp');
  await sharp(brandSvg, { density: 512 })
    .resize(512, 512)
    .webp({ lossless: true, quality: 100 })
    .toFile(out);
  const { size: bytes } = await stat(out);
  console.log(`  quon.webp                512x512  ${bytes.toLocaleString()} B`);
}

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="titleGold" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="#f0c84a"/>
      <stop offset="55%" stop-color="#d4a016"/>
      <stop offset="100%" stop-color="#b8891a"/>
    </linearGradient>
    <linearGradient id="markFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8b227"/>
      <stop offset="55%" stop-color="#d4a016"/>
      <stop offset="100%" stop-color="#b8891a"/>
    </linearGradient>
    <linearGradient id="markStroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4a016"/>
      <stop offset="100%" stop-color="#b8891a"/>
    </linearGradient>
    <radialGradient id="glowGold" cx="0.72" cy="0.35" r="0.55">
      <stop offset="0%" stop-color="rgba(212,160,22,0.18)"/>
      <stop offset="100%" stop-color="rgba(212,160,22,0)"/>
    </radialGradient>
    <radialGradient id="glowTeal" cx="0.18" cy="0.85" r="0.5">
      <stop offset="0%" stop-color="rgba(45,212,168,0.09)"/>
      <stop offset="100%" stop-color="rgba(45,212,168,0)"/>
    </radialGradient>
    <mask id="gridMask">
      <rect width="1200" height="630" fill="black"/>
      <ellipse cx="600" cy="315" rx="520" ry="260" fill="white"/>
    </mask>
  </defs>

  <rect width="1200" height="630" fill="#07070b"/>
  <rect width="1200" height="630" fill="url(#glowGold)"/>
  <rect width="1200" height="630" fill="url(#glowTeal)"/>

  <g mask="url(#gridMask)" stroke="#1e1e30" stroke-width="1" opacity="0.5">
    ${Array.from({ length: 15 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="630"/>`).join('')}
    ${Array.from({ length: 8  }, (_, i) => `<line x1="0" y1="${i * 80}" x2="1200" y2="${i * 80}"/>`).join('')}
  </g>

  <g transform="translate(110 195) scale(0.47)">
    <rect x="0" y="0" width="512" height="512" rx="96" ry="96" fill="#0e0e15" stroke="#1e1e30" stroke-width="2"/>
    <g fill="url(#markFill)">
      <rect x="80"  y="80"  width="76" height="76" rx="14" ry="14"/>
      <rect x="98"  y="98"  width="40" height="40" rx="6"  ry="6"  fill="#07070b"/>
      <rect x="110" y="110" width="16" height="16" rx="3"  ry="3"/>

      <rect x="356" y="80"  width="76" height="76" rx="14" ry="14"/>
      <rect x="374" y="98"  width="40" height="40" rx="6"  ry="6"  fill="#07070b"/>
      <rect x="386" y="110" width="16" height="16" rx="3"  ry="3"/>

      <rect x="80"  y="356" width="76" height="76" rx="14" ry="14"/>
      <rect x="98"  y="374" width="40" height="40" rx="6"  ry="6"  fill="#07070b"/>
      <rect x="110" y="386" width="16" height="16" rx="3"  ry="3"/>
    </g>
    <g transform="translate(256 256)">
      <circle cx="0" cy="0" r="84" fill="none" stroke="url(#markStroke)" stroke-width="22"/>
      <line x1="40" y1="44" x2="92" y2="96" stroke="url(#markStroke)" stroke-width="22" stroke-linecap="round"/>
    </g>
  </g>

  <g font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">
    <text x="380" y="320" font-size="132" font-weight="800" fill="url(#titleGold)" letter-spacing="-4">
      Quon
    </text>
    <text x="380" y="380" font-size="34" font-weight="600" fill="#e4e4ec" letter-spacing="-0.5">
      Free Custom QR Code Generator
    </text>
    <text x="380" y="425" font-size="24" font-weight="400" fill="#8a8aa6">
      URL · vCard · Wi-Fi · Email · Phone · Text
    </text>
    <text x="380" y="495" font-size="20" font-weight="500" fill="#d4a016" letter-spacing="2">
      quon.xiu.kr
    </text>
  </g>
</svg>`;

{
  const out = resolve(imagesDir, 'og-image.png');
  await sharp(Buffer.from(ogSvg), { density: 144 })
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toFile(out);
  const { size: bytes } = await stat(out);
  console.log(`  og-image.png             1200x630 ${bytes.toLocaleString()} B`);
}

console.log('\nDone.');
