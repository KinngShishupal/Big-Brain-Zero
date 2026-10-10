#!/usr/bin/env node
/**
 * Renders the app icon, adaptive icon layers, store icon and in-app logo from code-drawn SVG.
 *
 *   node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RES = join(ROOT, 'android', 'app', 'src', 'main', 'res');

// ── artwork ────────────────────────────────────────────────────────────────
const BRAIN_LOBES = [
  [330, 440, 150],
  [455, 345, 160],
  [600, 345, 160],
  [705, 455, 140],
  [645, 575, 145],
  [415, 580, 145],
  [530, 500, 190],
];

function sparkle(x, y, r, color) {
  const p = `M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${
    y + r
  } Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`;
  return `<path d="${p}" fill="${color}"/>`;
}

/** The derpy brain mascot, drawn on a 1024 canvas centred around (512, 500). */
function mascot() {
  const outline = BRAIN_LOBES.map(
    ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 16}" fill="#7A1260"/>`,
  ).join('');
  const fill = BRAIN_LOBES.map(
    ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#brain)"/>`,
  ).join('');
  return `
    <g>
      ${outline}
      ${fill}
      <!-- glossy highlight -->
      <ellipse cx="430" cy="300" rx="120" ry="55" fill="#FFFFFF" opacity="0.28" transform="rotate(-18 430 300)"/>
      <!-- squiggles -->
      <g fill="none" stroke="#C42C93" stroke-width="16" stroke-linecap="round">
        <path d="M 527 210 C 500 260, 560 300, 527 350"/>
        <path d="M 300 380 C 340 350, 360 410, 395 380"/>
        <path d="M 660 300 C 700 330, 650 370, 700 395"/>
        <path d="M 250 500 C 280 470, 300 520, 330 495"/>
        <path d="M 760 520 C 730 540, 770 575, 735 600"/>
      </g>
      <!-- googly eyes, looking in different directions -->
      <circle cx="438" cy="470" r="92" fill="#FFFFFF" stroke="#2A0E3F" stroke-width="12"/>
      <circle cx="472" cy="505" r="40" fill="#160A2E"/>
      <circle cx="486" cy="490" r="12" fill="#FFFFFF"/>
      <circle cx="618" cy="455" r="102" fill="#FFFFFF" stroke="#2A0E3F" stroke-width="12"/>
      <circle cx="580" cy="415" r="44" fill="#160A2E"/>
      <circle cx="595" cy="400" r="13" fill="#FFFFFF"/>
      <!-- goofy grin + tongue -->
      <path d="M 430 615 Q 530 690 640 600" fill="none" stroke="#2A0E3F" stroke-width="16" stroke-linecap="round"/>
      <path d="M 520 650 Q 520 760 575 760 Q 630 760 618 640 Q 570 668 520 650 Z" fill="#FF3D6E" stroke="#2A0E3F" stroke-width="12" stroke-linejoin="round"/>
      <path d="M 572 668 L 574 735" stroke="#B0103F" stroke-width="10" stroke-linecap="round"/>
    </g>`;
}

const DEFS = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8B5CFF"/>
      <stop offset="0.55" stop-color="#C64BE8"/>
      <stop offset="1" stop-color="#FF4FD8"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.45" r="0.55">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brain" gradientUnits="userSpaceOnUse" x1="0" y1="170" x2="0" y2="760">
      <stop offset="0" stop-color="#FFB3DA"/>
      <stop offset="1" stop-color="#FF6FC4"/>
    </linearGradient>
  </defs>`;

const SPARKLES = [
  sparkle(215, 230, 46, '#FFD84D'),
  sparkle(820, 250, 34, '#2EE6FF'),
  sparkle(830, 780, 40, '#FFD84D'),
  sparkle(200, 790, 28, '#B6FF3B'),
].join('');

const svg = body =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${DEFS}${body}</svg>`;

const backgroundSvg = svg(
  `<rect width="1024" height="1024" fill="url(#bg)"/><rect width="1024" height="1024" fill="url(#glow)"/>`,
);

/** `scale` enlarges the mascot around its centre (legacy icons have no safe-zone padding). */
const foregroundSvg = (scale = 1, withSparkles = true) =>
  svg(
    `<g transform="translate(512 512) scale(${scale}) translate(-512 -505)">${mascot()}</g>` +
      (withSparkles ? SPARKLES : ''),
  );

const fullIconSvg = (scale = 1.15) =>
  svg(
    `<rect width="1024" height="1024" fill="url(#bg)"/><rect width="1024" height="1024" fill="url(#glow)"/>` +
      `<g transform="translate(512 512) scale(${scale}) translate(-512 -505)">${mascot()}</g>` +
      SPARKLES,
  );

const mask = (shape, size) =>
  Buffer.from(
    shape === 'circle'
      ? `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${
          size / 2
        }" r="${size / 2}" fill="#fff"/></svg>`
      : `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${
          size * 0.22
        }" fill="#fff"/></svg>`,
  );

async function render(svgText, size, file, maskShape) {
  mkdirSync(dirname(file), { recursive: true });
  let img = sharp(Buffer.from(svgText), { density: 300 }).resize(size, size);
  if (maskShape) {
    img = sharp(await img.png().toBuffer()).composite([
      { input: mask(maskShape, size), blend: 'dest-in' },
    ]);
  }
  await img.png({ compressionLevel: 9 }).toFile(file);
  console.log(`  ${file.replace(ROOT, '.')}  ${size}px`);
}

// ── outputs ────────────────────────────────────────────────────────────────
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

for (const [d, m] of Object.entries(DENSITIES)) {
  const dir = join(RES, `mipmap-${d}`);
  // Legacy icons (Android < 8): full artwork with rounded / circular masks.
  await render(fullIconSvg(), 48 * m, join(dir, 'ic_launcher.png'), 'rounded');
  await render(
    fullIconSvg(),
    48 * m,
    join(dir, 'ic_launcher_round.png'),
    'circle',
  );
  // Adaptive icon layers (Android 8+): 108dp canvas, launcher masks the shape.
  await render(backgroundSvg, 108 * m, join(dir, 'ic_launcher_background.png'));
  await render(
    foregroundSvg(1, true),
    108 * m,
    join(dir, 'ic_launcher_foreground.png'),
  );
}

const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
mkdirSync(join(RES, 'mipmap-anydpi-v26'), { recursive: true });
writeFileSync(join(RES, 'mipmap-anydpi-v26', 'ic_launcher.xml'), adaptive);
writeFileSync(
  join(RES, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'),
  adaptive,
);
console.log('  adaptive icon XML written');

// Play Store listing icon.
await render(
  fullIconSvg(),
  512,
  join(ROOT, 'store', 'play-store-icon-512.png'),
);

// iOS: single 1024px universal app icon (Xcode 14+).
const iosSet = join(
  ROOT,
  'ios',
  'FarmToEmpire',
  'Images.xcassets',
  'AppIcon.appiconset',
);
await render(fullIconSvg(), 1024, join(iosSet, 'AppIcon-1024.png'));
writeFileSync(
  join(iosSet, 'Contents.json'),
  JSON.stringify(
    {
      images: [
        {
          filename: 'AppIcon-1024.png',
          idiom: 'universal',
          platform: 'ios',
          size: '1024x1024',
        },
      ],
      info: { author: 'xcode', version: 1 },
    },
    null,
    2,
  ) + '\n',
);

// In-app logo (transparent mascot, no sparkles) at 1x/2x/3x.
const logo = foregroundSvg(1.3, false);
await render(logo, 240, join(ROOT, 'src', 'assets', 'logo.png'));
await render(logo, 480, join(ROOT, 'src', 'assets', 'logo@2x.png'));
await render(logo, 720, join(ROOT, 'src', 'assets', 'logo@3x.png'));

// Keep the source SVGs for designers.
mkdirSync(join(ROOT, 'store'), { recursive: true });
writeFileSync(join(ROOT, 'store', 'icon.svg'), fullIconSvg());
console.log('Done.');
