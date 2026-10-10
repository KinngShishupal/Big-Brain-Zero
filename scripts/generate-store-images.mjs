#!/usr/bin/env node
/**
 * Builds Google Play listing images from raw device captures in store/raw/.
 *
 *   node scripts/generate-store-images.mjs
 *
 * Output: store/play/phone-1..N.png (1080x1920) and store/play/feature-graphic.png (1024x500).
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'store', 'raw');
const OUT = join(ROOT, 'store', 'play');
mkdirSync(OUT, { recursive: true });

const W = 1080;
const H = 1920;

// Raw captures are 1220x2712; drop the status bar and gesture bar.
const CROP = { left: 0, top: 125, width: 1220, height: 2520 };

const SHOTS = [
  { file: 'home.png', title: 'Lowest IQ wins', sub: 'The dumber you are, the more you win.' },
  { file: 'quiz.png', title: 'Wrong answers score', sub: 'Absurd answers score the most.' },
  { file: 'sheet1.png', title: 'Be gloriously dumb', sub: 'Earn stupidity points for every bad idea.', hideBanner: true },
  { file: 'button.png', title: 'Break the rules', sub: 'Then press the button anyway.' },
  { file: 'count.png', title: 'Count badly', sub: 'The further off, the better.' },
  { file: 'c06.png', title: 'Measure your IQ', sub: 'Watch the meter drop as you get dumber.' },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const background = (w, h) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3A1785"/>
      <stop offset="0.55" stop-color="#160A3C"/>
      <stop offset="1" stop-color="#062748"/>
    </linearGradient>
    <radialGradient id="p" cx="0.15" cy="0.1" r="0.6">
      <stop offset="0" stop-color="#FF4FD8" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#FF4FD8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c" cx="0.95" cy="0.8" r="0.6">
      <stop offset="0" stop-color="#2EE6FF" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#2EE6FF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#p)"/>
  <rect width="${w}" height="${h}" fill="url(#c)"/>
</svg>`);

const caption = (title, sub) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="330">
  <text x="${W / 2}" y="150" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-weight="900" font-size="84" fill="#FFFFFF">${esc(title)}</text>
  <text x="${W / 2}" y="235" text-anchor="middle" font-family="Arial, sans-serif"
        font-weight="700" font-size="42" fill="#2EE6FF">${esc(sub)}</text>
</svg>`);

const roundedMask = (w, h, r) =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);

async function phoneShot(shot, i) {
  let img = sharp(join(RAW, shot.file)).extract(CROP);

  if (shot.hideBanner) {
    // Cover the in-app banner slot (test ad) with the sheet's own colour.
    const { data } = await sharp(join(RAW, shot.file))
      .extract({ left: 120, top: 1720, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const [r, g, b] = data;
    const patch = Buffer.from(
      `<svg width="940" height="160"><rect width="940" height="160" fill="rgb(${r},${g},${b})"/></svg>`,
    );
    img = sharp(await img.png().toBuffer()).composite([
      { input: patch, left: 140, top: 1645 - CROP.top },
    ]);
  }

  const frameH = 1520;
  const frameW = Math.round((CROP.width / CROP.height) * frameH);
  const screen = await sharp(await img.png().toBuffer())
    .resize(frameW, frameH)
    .composite([{ input: roundedMask(frameW, frameH, 48), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const border = 10;
  const bezel = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${frameW + border * 2}" height="${frameH + border * 2}">
    <rect x="0" y="0" width="${frameW + border * 2}" height="${frameH + border * 2}" rx="${48 + border}"
          fill="#0B061C" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  </svg>`);

  const left = Math.round((W - frameW) / 2);
  const top = 330;
  const out = join(OUT, `phone-${i + 1}.png`);
  await sharp(background(W, H))
    .composite([
      { input: caption(shot.title, shot.sub), left: 0, top: 0 },
      { input: bezel, left: left - border, top: top - border },
      { input: screen, left, top },
    ])
    .png()
    .toFile(out);
  console.log(`  ${out.replace(ROOT, '.')}  ${shot.title}`);
}

async function featureGraphic() {
  const fw = 1024;
  const fh = 500;
  const logo = await sharp(join(ROOT, 'src', 'assets', 'logo@3x.png')).resize(300, 300).png().toBuffer();
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}">
    <text x="380" y="235" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="66" fill="#FFFFFF">Call Me Dumb</text>
    <text x="384" y="300" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#2EE6FF">The dumber you are,</text>
    <text x="384" y="345" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#2EE6FF">the more you win.</text>
  </svg>`);
  const out = join(OUT, 'feature-graphic.png');
  await sharp(background(fw, fh))
    .composite([
      { input: logo, left: 50, top: 100 },
      { input: text, left: 0, top: 0 },
    ])
    .png()
    .toFile(out);
  console.log(`  ${out.replace(ROOT, '.')}  1024x500`);
}

for (let i = 0; i < SHOTS.length; i++) {
  await phoneShot(SHOTS[i], i);
}
await featureGraphic();
console.log('Done.');
