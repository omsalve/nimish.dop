// Shared helpers for the placeholder art generator.
// Everything here is synthetic stand-in material: replace the outputs with real
// photography and stills (see README → "Replacing placeholder media").

import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
export const sharp = require('sharp');

/** Deterministic PRNG so every run produces identical art. */
export function rng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r2 = (n) => Math.round(n * 100) / 100;

export function svgDoc(w, h, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${defs}</defs>
${body}
</svg>`;
}

export function linear(id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, units } = {}) {
  const u = units ? ` gradientUnits="${units}"` : '';
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${u}>${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</linearGradient>`;
}

export function radial(id, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy, units, transform } = {}) {
  const f = fx !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
  const u = units ? ` gradientUnits="${units}"` : '';
  const t = transform ? ` gradientTransform="${transform}"` : '';
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${f}${u}${t}>${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</radialGradient>`;
}

export const blurFilter = (id, sd, extra = '') =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sd}"/>${extra}</filter>`;

/** A soft light pool or glow, drawn as a blurred ellipse with a radial falloff. */
export function glow(id, { cx, cy, rx, ry, color, opacity = 1, core = 0 }) {
  const def = radial(`${id}-g`, [
    [0, color, opacity],
    [core, color, opacity * 0.85],
    [1, color, 0],
  ]);
  return {
    def,
    el: `<ellipse cx="${r2(cx)}" cy="${r2(cy)}" rx="${r2(rx)}" ry="${r2(ry)}" fill="url(#${id}-g)"/>`,
  };
}

/**
 * Rasterise an SVG (or take an already-rendered PNG buffer) and give it a
 * photographic finish: optional halation around highlights, monochrome film
 * grain, then mozjpeg.
 */
export async function render(svg, outFile, { grain = 14, halation = 0, quality = 84, width, mono = false } = {}) {
  let img = sharp(Buffer.isBuffer(svg) ? svg : Buffer.from(svg), { density: 72, limitInputPixels: false });
  if (width) img = img.resize({ width });
  const base = await img.removeAlpha().png().toBuffer();
  const meta = await sharp(base).metadata();
  const layers = [];

  if (halation > 0) {
    const hl = await sharp(base)
      .linear(3.4, -600)
      .blur(Math.max(6, meta.width / 140))
      .recomb([
        [0.34 * halation, 0.34 * halation, 0.34 * halation],
        [0.17 * halation, 0.17 * halation, 0.17 * halation],
        [0.06 * halation, 0.06 * halation, 0.06 * halation],
      ])
      .png()
      .toBuffer();
    layers.push({ input: hl, blend: 'screen' });
  }

  if (grain > 0) {
    const noise = await sharp({
      create: {
        width: meta.width,
        height: meta.height,
        channels: 3,
        background: { r: 128, g: 128, b: 128 },
        noise: { type: 'gaussian', mean: 128, sigma: grain },
      },
    })
      .grayscale()
      .blur(0.55)
      .png()
      .toBuffer();
    layers.push({ input: noise, blend: 'soft-light' });
  }

  await mkdir(path.dirname(outFile), { recursive: true });
  let out = sharp(await sharp(base).composite(layers).png().toBuffer());
  // silver-gelatin print: neutral greys with the faintest warmth in the paper
  if (mono) out = out.grayscale().toColourspace('srgb').tint({ r: 238, g: 230, b: 218 });
  await out.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(outFile);
  return { width: meta.width, height: meta.height };
}
