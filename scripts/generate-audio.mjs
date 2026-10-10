#!/usr/bin/env node
/**
 * Synthesizes every sound in the game (music loop + SFX) into 16-bit mono WAVs.
 * All audio is generated from code, so there are no licensing concerns.
 *
 *   node scripts/generate-audio.mjs
 *
 * Output: src/assets/sounds/*.wav
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'sounds');

// ── primitives ──────────────────────────────────────────────────────────────
const midiToHz = m => 440 * Math.pow(2, (m - 69) / 12);
const buffer = seconds => new Float32Array(Math.ceil(seconds * RATE));

// Deterministic noise so regenerating gives identical files.
let seed = 1234567;
const noise = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};

const osc = {
  sine: p => Math.sin(2 * Math.PI * p),
  square: (p, duty = 0.5) => (p % 1 < duty ? 1 : -1),
  triangle: p => 1 - 4 * Math.abs((p % 1) - 0.5),
  saw: p => 2 * (p % 1) - 1,
};

/** Attack/decay/sustain/release envelope; t and len in seconds. */
function adsr(t, len, a = 0.005, d = 0.05, s = 0.7, r = 0.05) {
  if (t < a) return t / a;
  if (t < a + d) return 1 - ((t - a) / d) * (1 - s);
  if (t < len - r) return s;
  if (t < len) return s * ((len - t) / r);
  return 0;
}

/**
 * Adds a tone. `freq` may be a number or a function of time (for slides).
 */
function tone(buf, { start, len, freq, wave = 'square', vol = 0.3, duty = 0.5, env = {}, vibrato = 0 }) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(len * RATE);
  let phase = 0;
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / RATE;
    let f = typeof freq === 'function' ? freq(t) : freq;
    if (vibrato) f *= 1 + vibrato * Math.sin(2 * Math.PI * 6 * t);
    phase += f / RATE;
    const e = adsr(t, len, env.a, env.d, env.s, env.r);
    const v = wave === 'square' ? osc.square(phase, duty) : osc[wave](phase);
    buf[s0 + i] += v * e * vol;
  }
}

function noiseBurst(buf, { start, len, vol = 0.3, decay = 30, lowpass = 1 }) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(len * RATE);
  let last = 0;
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / RATE;
    last += lowpass * (noise() - last); // one-pole low-pass
    buf[s0 + i] += last * Math.exp(-decay * t) * vol;
  }
}

function kick(buf, start, vol = 0.6) {
  tone(buf, {
    start,
    len: 0.18,
    wave: 'sine',
    vol,
    freq: t => 150 * Math.exp(-18 * t) + 45,
    env: { a: 0.001, d: 0.12, s: 0.0, r: 0.05 },
  });
}

/** Normalizes to `peak` and applies a tiny fade at both ends to avoid clicks. */
function finish(buf, peak = 0.85, fade = 0.004) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  const g = max > 0 ? peak / max : 1;
  const f = Math.floor(fade * RATE);
  for (let i = 0; i < buf.length; i++) {
    let v = buf[i] * g;
    if (i < f) v *= i / f;
    if (i > buf.length - f) v *= (buf.length - i) / f;
    buf[i] = v;
  }
  return buf;
}

function writeWav(name, buf) {
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.max(-1, Math.min(1, buf[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(join(OUT, `${name}.wav`), Buffer.concat([header, data]));
  console.log(`  ${name}.wav  ${(buf.length / RATE).toFixed(2)}s  ${((44 + data.length) / 1024).toFixed(0)} KB`);
}

// ── music: bouncy, goofy chiptune loop ──────────────────────────────────────
function music() {
  const BPM = 132;
  const beat = 60 / BPM;
  const BARS = 8;
  const buf = buffer(BARS * 4 * beat);

  // Chord roots (MIDI) per bar: C G Am F | C G F G
  const roots = [48, 43, 45, 41, 48, 43, 41, 43];
  const triads = { 48: [0, 4, 7], 43: [0, 4, 7], 45: [0, 3, 7], 41: [0, 4, 7] };

  roots.forEach((root, bar) => {
    const t0 = bar * 4 * beat;
    // Oom-pah bass: root on 1 & 3, fifth on 2 & 4.
    [0, 7, 0, 7].forEach((iv, b) =>
      tone(buf, {
        start: t0 + b * beat,
        len: beat * 0.55,
        freq: midiToHz(root - 12 + iv),
        wave: 'triangle',
        vol: 0.5,
        env: { a: 0.004, d: 0.08, s: 0.6, r: 0.05 },
      }),
    );
    // Off-beat chord stabs (the "pah").
    for (let b = 0; b < 4; b++) {
      triads[root].forEach(iv =>
        tone(buf, {
          start: t0 + (b + 0.5) * beat,
          len: beat * 0.22,
          freq: midiToHz(root + 12 + iv),
          wave: 'square',
          duty: 0.5,
          vol: 0.05,
          env: { a: 0.002, d: 0.05, s: 0.3, r: 0.03 },
        }),
      );
    }
    // Drums: kick on 1 & 3, snare on 2 & 4, hats on eighths.
    kick(buf, t0);
    kick(buf, t0 + 2 * beat);
    noiseBurst(buf, { start: t0 + beat, len: 0.15, vol: 0.35, decay: 22, lowpass: 0.7 });
    noiseBurst(buf, { start: t0 + 3 * beat, len: 0.15, vol: 0.35, decay: 22, lowpass: 0.7 });
    for (let e = 0; e < 8; e++) {
      noiseBurst(buf, { start: t0 + e * beat * 0.5, len: 0.04, vol: 0.08, decay: 90, lowpass: 1 });
    }
  });

  // Lead melody: [beat, lengthInBeats, midi]. Silly hops and a cheeky chromatic slide.
  const C5 = 72;
  const melody = [
    // bar 1 (C)
    [0, 0.5, C5], [0.5, 0.5, C5 + 4], [1, 0.5, C5 + 7], [1.5, 0.5, C5 + 4], [2, 1, C5 + 12], [3, 0.5, C5 + 7],
    // bar 2 (G)
    [4, 0.5, C5 + 2], [4.5, 0.5, C5 + 7], [5, 0.5, C5 + 11], [5.5, 0.5, C5 + 7], [6, 1.5, C5 + 2],
    // bar 3 (Am)
    [8, 0.5, C5], [8.5, 0.5, C5 + 3], [9, 0.5, C5 + 4], [9.5, 0.5, C5 + 9], [10, 1, C5 + 7], [11, 0.5, C5 + 4],
    // bar 4 (F)
    [12, 0.5, C5 + 5], [12.5, 0.5, C5 + 4], [13, 0.5, C5 + 2], [13.5, 0.5, C5], [14, 1.5, C5 + 5],
    // bar 5 (C)
    [16, 0.25, C5 + 12], [16.25, 0.25, C5 + 12], [16.5, 0.5, C5 + 7], [17, 0.5, C5 + 4], [17.5, 0.5, C5 + 7], [18, 1, C5 + 9], [19, 0.5, C5 + 7],
    // bar 6 (G)
    [20, 0.5, C5 + 11], [20.5, 0.5, C5 + 14], [21, 0.5, C5 + 11], [21.5, 0.5, C5 + 7], [22, 1.5, C5 + 2],
    // bar 7 (F)
    [24, 0.5, C5 + 9], [24.5, 0.5, C5 + 5], [25, 0.5, C5], [25.5, 0.5, C5 + 5], [26, 1, C5 + 9], [27, 0.5, C5 + 12],
    // bar 8 (G) — wobbly "duh-duh-duuuh" turnaround
    [28, 0.5, C5 + 7], [28.5, 0.5, C5 + 6], [29, 0.5, C5 + 5], [29.5, 0.5, C5 + 4], [30, 1.25, C5 + 2],
  ];
  melody.forEach(([b, l, m]) =>
    tone(buf, {
      start: b * beat,
      len: l * beat * 0.85,
      freq: midiToHz(m),
      wave: 'square',
      duty: 0.25,
      vol: 0.16,
      vibrato: l >= 1 ? 0.012 : 0,
      env: { a: 0.004, d: 0.06, s: 0.65, r: 0.04 },
    }),
  );
  return finish(buf, 0.7, 0.002);
}

// ── sound effects ──────────────────────────────────────────────────────────
function tap() {
  const b = buffer(0.06);
  tone(b, { start: 0, len: 0.05, freq: 1250, wave: 'square', duty: 0.25, vol: 0.4, env: { a: 0.001, d: 0.03, s: 0.2, r: 0.015 } });
  return finish(b, 0.5);
}

function select() {
  const b = buffer(0.14);
  tone(b, { start: 0, len: 0.06, freq: midiToHz(76), wave: 'square', duty: 0.25, vol: 0.4 });
  tone(b, { start: 0.06, len: 0.07, freq: midiToHz(83), wave: 'square', duty: 0.25, vol: 0.4 });
  return finish(b, 0.55);
}

/** Cartoon "boing" for the forbidden button. */
function bonk() {
  const b = buffer(0.35);
  tone(b, {
    start: 0,
    len: 0.33,
    wave: 'sine',
    vol: 0.7,
    freq: t => 420 * Math.exp(-5 * t) + 110 + 40 * Math.sin(2 * Math.PI * 22 * t) * Math.exp(-6 * t),
    env: { a: 0.002, d: 0.1, s: 0.5, r: 0.12 },
  });
  noiseBurst(b, { start: 0, len: 0.03, vol: 0.25, decay: 120, lowpass: 0.5 });
  return finish(b, 0.8);
}

/** Sad trombone: "wah wah wah waaaah" — for answering correctly (you were too smart). */
function smart() {
  const b = buffer(1.9);
  const notes = [
    [0, 0.32, 58],
    [0.36, 0.32, 57],
    [0.72, 0.32, 56],
    [1.08, 0.78, 55],
  ];
  notes.forEach(([s, l, m], i) =>
    tone(b, {
      start: s,
      len: l,
      wave: 'saw',
      vol: 0.35,
      vibrato: i === 3 ? 0.03 : 0.008,
      freq: t => midiToHz(m) * (1 - (i === 3 ? 0.04 * t : 0)),
      env: { a: 0.04, d: 0.1, s: 0.8, r: 0.12 },
    }),
  );
  return finish(b, 0.75);
}

/** Happy chirpy arpeggio for a nicely dumb answer. */
function dumb() {
  const b = buffer(0.5);
  [72, 76, 79, 84].forEach((m, i) =>
    tone(b, { start: i * 0.08, len: 0.12, freq: midiToHz(m), wave: 'square', duty: 0.25, vol: 0.35, env: { a: 0.002, d: 0.05, s: 0.5, r: 0.05 } }),
  );
  return finish(b, 0.7);
}

/** Victory fanfare + sparkle for PEAK STUPIDITY. */
function peak() {
  const b = buffer(1.5);
  const fan = [
    [0, 0.12, 72],
    [0.13, 0.12, 72],
    [0.26, 0.12, 72],
    [0.39, 0.5, 77],
    [0.92, 0.5, 81],
  ];
  fan.forEach(([s, l, m]) => {
    tone(b, { start: s, len: l, freq: midiToHz(m), wave: 'square', duty: 0.5, vol: 0.28 });
    tone(b, { start: s, len: l, freq: midiToHz(m - 12), wave: 'triangle', vol: 0.3 });
  });
  for (let i = 0; i < 10; i++) {
    tone(b, { start: 0.92 + i * 0.05, len: 0.06, freq: midiToHz(96 + (i % 4) * 3), wave: 'sine', vol: 0.15 });
  }
  kick(b, 0.39, 0.5);
  return finish(b, 0.8);
}

function whoosh() {
  const b = buffer(0.35);
  const s0 = 0;
  let last = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / RATE;
    const cutoff = 0.05 + 0.6 * Math.sin((Math.PI * t) / 0.35);
    last += cutoff * (noise() - last);
    b[s0 + i] = last * Math.sin((Math.PI * t) / 0.35) * 0.5;
  }
  return finish(b, 0.45);
}

/** Bright ding for the reaction light turning green. */
function ding() {
  const b = buffer(0.6);
  tone(b, { start: 0, len: 0.58, freq: midiToHz(88), wave: 'sine', vol: 0.5, env: { a: 0.002, d: 0.3, s: 0.2, r: 0.25 } });
  tone(b, { start: 0, len: 0.4, freq: midiToHz(100), wave: 'sine', vol: 0.15, env: { a: 0.002, d: 0.2, s: 0.1, r: 0.15 } });
  return finish(b, 0.65);
}

/** Drumroll that ends in a cymbal-ish crash — plays while the IQ counts down. */
function drumroll() {
  const b = buffer(2.0);
  for (let t = 0; t < 1.35; t += 0.045) {
    noiseBurst(b, { start: t, len: 0.05, vol: 0.18 + 0.25 * (t / 1.35), decay: 60, lowpass: 0.6 });
  }
  kick(b, 1.4, 0.7);
  noiseBurst(b, { start: 1.4, len: 0.6, vol: 0.5, decay: 5, lowpass: 0.95 });
  return finish(b, 0.75);
}

// ── write ──────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
console.log(`Writing to ${OUT}`);
writeWav('music', music());
writeWav('tap', tap());
writeWav('select', select());
writeWav('bonk', bonk());
writeWav('smart', smart());
writeWav('dumb', dumb());
writeWav('peak', peak());
writeWav('whoosh', whoosh());
writeWav('ding', ding());
writeWav('drumroll', drumroll());
