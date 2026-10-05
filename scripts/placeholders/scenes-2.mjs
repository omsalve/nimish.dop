// Mood frames for the second program of placeholder films (films seven to
// fifteen). Same rules as scenes.mjs: simple compositions of light, horizon and
// one figure, standing in for real stills until Nimish's frames replace them.

import { linear, radial, blurFilter, glow, rng, r2 } from './lib.mjs';
import { figure, profile, skyRect, vignette, bokeh, rain, ridge, sceneDoc } from './scenes.mjs';

const pts = (arr) => arr.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');

/** A neon tube: a wide blurred bloom under a hot core. */
function neon(id, d, color, w, core = '#fff4f8') {
  return {
    def: blurFilter(`${id}-b`, w * 1.6) + blurFilter(`${id}-c`, w * 0.35),
    el:
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w * 5}" stroke-opacity=".55" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-b)"/>` +
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w * 1.6}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-c)"/>` +
      `<path d="${d}" fill="none" stroke="${core}" stroke-width="${w * 0.7}" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
}

function stars(rand, n, { w, h, y1 = 1, rMax = 2.2, color = '#f4f1ea' }) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const r = 0.5 + Math.pow(rand(), 3) * rMax;
    s += `<circle cx="${r2(rand() * w)}" cy="${r2(rand() * h * y1)}" r="${r2(r)}" fill="${color}" fill-opacity="${r2(0.25 + rand() * 0.75)}"/>`;
  }
  return s;
}

// ── Neon Dhaba ───────────────────────────────────────────────────────────────

const PINK = '#ff4f9a';
const GREEN = '#3dffb0';

export function dhabaNeon(w, h) {
  const rand = rng(71);
  const gy = h * 0.7;
  const sx = w * 0.5;
  const sign = neon('n1', `M ${r2(sx - w * 0.16)},${r2(h * 0.2)} L ${r2(sx + w * 0.16)},${r2(h * 0.2)} L ${r2(sx + w * 0.16)},${r2(h * 0.31)} L ${r2(sx - w * 0.16)},${r2(h * 0.31)} Z`, PINK, 5);
  const arrow = neon('n2', `M ${r2(sx - w * 0.11)},${r2(h * 0.255)} L ${r2(sx + w * 0.07)},${r2(h * 0.255)} M ${r2(sx + w * 0.03)},${r2(h * 0.225)} L ${r2(sx + w * 0.075)},${r2(h * 0.255)} L ${r2(sx + w * 0.03)},${r2(h * 0.285)}`, GREEN, 4, '#eafff6');
  let tin = '';
  for (let i = 0; i < 22; i++) tin += `<line x1="${r2(w * 0.28 + i * w * 0.02)}" y1="${r2(h * 0.36)}" x2="${r2(w * 0.27 + i * w * 0.021)}" y2="${r2(h * 0.4)}" stroke="#2a2733" stroke-width="3"/>`;
  return sceneDoc(w, h, [
    skyRect('sky', w, gy, [[0, '#05060b'], [0.7, '#0d1020'], [1, '#1b1630']]),
    stars(rand, 90, { w, h, y1: 0.5, rMax: 1.6 }),
    { def: linear('road', [[0, '#14111a'], [1, '#07070a']]), el: `<rect y="${r2(gy)}" width="${w}" height="${r2(h - gy)}" fill="url(#road)"/>` },
    // the shack: tin roof, a lit doorway, benches
    `<polygon points="${pts([[w * 0.26, h * 0.4], [w * 0.74, h * 0.4], [w * 0.76, h * 0.36], [w * 0.24, h * 0.36]])}" fill="#16131d"/>`,
    tin,
    `<rect x="${r2(w * 0.28)}" y="${r2(h * 0.4)}" width="${r2(w * 0.44)}" height="${r2(gy - h * 0.4)}" fill="#0b0a0f"/>`,
    { def: linear('door', [[0, '#ffd59c'], [1, '#c96a2c']]), el: `<rect x="${r2(w * 0.42)}" y="${r2(h * 0.45)}" width="${r2(w * 0.16)}" height="${r2(gy - h * 0.45)}" fill="url(#door)"/>` },
    glow('doorspill', { cx: w * 0.5, cy: gy + h * 0.04, rx: w * 0.22, ry: h * 0.07, color: '#ffb46b', opacity: 0.45 }),
    figure(w * 0.47, gy - 2, h * 0.17, '#140e0b'),
    sign,
    arrow,
    glow('pinkwash', { cx: sx, cy: h * 0.27, rx: w * 0.36, ry: h * 0.3, color: PINK, opacity: 0.22 }),
    // reflections in the wet forecourt
    glow('pr', { cx: sx, cy: gy + h * 0.16, rx: w * 0.16, ry: h * 0.05, color: PINK, opacity: 0.25 }),
    glow('gr', { cx: sx - w * 0.02, cy: gy + h * 0.21, rx: w * 0.09, ry: h * 0.025, color: GREEN, opacity: 0.35 }),
    // a parked truck at left, amber marker lamps
    `<g fill="#09080c"><rect x="${r2(-w * 0.02)}" y="${r2(h * 0.43)}" width="${r2(w * 0.2)}" height="${r2(h * 0.24)}" rx="6"/><rect x="${r2(w * 0.18)}" y="${r2(h * 0.5)}" width="${r2(w * 0.06)}" height="${r2(h * 0.17)}" rx="10"/><circle cx="${r2(w * 0.05)}" cy="${r2(gy)}" r="${r2(h * 0.045)}"/><circle cx="${r2(w * 0.2)}" cy="${r2(gy)}" r="${r2(h * 0.045)}"/></g>`,
    `<g fill="#ffb24a">${[0.01, 0.05, 0.09, 0.13, 0.17].map((p) => `<circle cx="${r2(w * p)}" cy="${r2(h * 0.445)}" r="5"/>`).join('')}</g>`,
    vignette('v', w, h, 0.55),
  ]);
}

export function dhabaChai(w, h) {
  const rand = rng(72);
  let steam = '';
  for (let i = 0; i < 6; i++) {
    let x = w * (0.47 + rand() * 0.06);
    let d = `M ${r2(x)},${r2(h * 0.48)}`;
    for (let k = 1; k < 6; k++) {
      const y = h * 0.48 - k * h * 0.09;
      const nx = x + (rand() - 0.5) * 90;
      d += ` Q ${r2(x + (rand() - 0.5) * 110)},${r2(y + h * 0.045)} ${r2(nx)},${r2(y)}`;
      x = nx;
    }
    steam += `<path d="${d}" fill="none" stroke="#fff3fa" stroke-opacity="${r2(0.18 + rand() * 0.25)}" stroke-width="${r2(8 + rand() * 14)}" stroke-linecap="round"/>`;
  }
  const gx = w * 0.5;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0a080d"/>`,
    { def: blurFilter('bk', 10), el: `<g filter="url(#bk)">${bokeh(rng(3), 34, { x0: 0, x1: w, y0: 0, y1: h * 0.6, rMin: 30, rMax: 140, colors: [PINK, GREEN, '#ffb46b', '#f4e9ff'], opacity: [0.15, 0.6] })}</g>` },
    { def: linear('counter', [[0, '#5d5a66'], [0.05, '#2a2830'], [1, '#121116']]), el: `<rect y="${r2(h * 0.66)}" width="${w}" height="${r2(h * 0.34)}" fill="url(#counter)"/>` },
    `<rect y="${r2(h * 0.66)}" width="${w}" height="3" fill="#ffd1e6" opacity=".5"/>`,
    { def: blurFilter('st', 9), el: `<g filter="url(#st)">${steam}</g>` },
    // the glass and the tea
    { def: linear('tea', [[0, '#e3a25a'], [1, '#8a4a1c']]), el: `<path d="M ${r2(gx - w * 0.05)},${r2(h * 0.48)} L ${r2(gx + w * 0.05)},${r2(h * 0.48)} L ${r2(gx + w * 0.04)},${r2(h * 0.68)} L ${r2(gx - w * 0.04)},${r2(h * 0.68)} Z" fill="url(#tea)"/>` },
    `<path d="M ${r2(gx - w * 0.05)},${r2(h * 0.48)} L ${r2(gx - w * 0.04)},${r2(h * 0.68)}" stroke="#ffe0f0" stroke-width="4" stroke-opacity=".7"/>`,
    `<path d="M ${r2(gx + w * 0.05)},${r2(h * 0.48)} L ${r2(gx + w * 0.04)},${r2(h * 0.68)}" stroke="${GREEN}" stroke-width="3" stroke-opacity=".6"/>`,
    `<ellipse cx="${r2(gx)}" cy="${r2(h * 0.48)}" rx="${r2(w * 0.05)}" ry="${r2(h * 0.016)}" fill="#f1c38a"/>`,
    `<ellipse cx="${r2(gx)}" cy="${r2(h * 0.69)}" rx="${r2(w * 0.06)}" ry="${r2(h * 0.012)}" fill="#000" opacity=".5"/>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function dhabaTrucks(w, h) {
  const rand = rng(73);
  const vx = w * 0.62;
  const vy = h * 0.46;
  let streaks = '';
  for (let i = 0; i < 40; i++) {
    const side = rand() > 0.5;
    const y0 = h * (side ? 0.62 + rand() * 0.2 : 0.7 + rand() * 0.25);
    const x0 = side ? -w * 0.05 : w * 1.05;
    const c = side ? (rand() > 0.3 ? '#ff3a2a' : '#ffb24a') : '#fff1d6';
    const t = 0.15 + rand() * 0.6;
    streaks += `<line x1="${r2(x0)}" y1="${r2(y0)}" x2="${r2(x0 + (vx - x0) * t)}" y2="${r2(y0 + (vy - y0) * t)}" stroke="${c}" stroke-width="${r2(2 + rand() * 7)}" stroke-opacity="${r2(0.3 + rand() * 0.6)}" stroke-linecap="round"/>`;
  }
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#04050a'], [0.45, '#121426'], [0.47, '#0a0a0f'], [1, '#050507']]),
    stars(rand, 60, { w, h, y1: 0.4, rMax: 1.4 }),
    ridge(rng(5), { w, h, base: vy - h * 0.02, amp: h * 0.03, fill: '#07070c' }),
    `<polygon points="${pts([[vx - 6, vy], [vx + 6, vy], [w * 1.2, h], [-w * 0.2, h]])}" fill="#0d0c10"/>`,
    `<g stroke="#e8e2d0" stroke-opacity=".35" stroke-width="4" stroke-dasharray="40 60"><line x1="${r2(vx)}" y1="${r2(vy)}" x2="${r2(w * 0.5)}" y2="${h}"/></g>`,
    { def: blurFilter('mb', 2.2), el: `<g filter="url(#mb)">${streaks}</g>` },
    glow('dhaba', { cx: w * 0.12, cy: h * 0.5, rx: w * 0.16, ry: h * 0.14, color: PINK, opacity: 0.45 }),
    `<rect x="${r2(w * 0.07)}" y="${r2(h * 0.47)}" width="${r2(w * 0.09)}" height="${r2(h * 0.035)}" fill="none" stroke="#ffd0e6" stroke-width="3"/>`,
    vignette('v', w, h, 0.55),
  ]);
}

export function dhabaCot(w, h) {
  let strings = '';
  const x0 = w * 0.3;
  const x1 = w * 0.78;
  const yT = h * 0.62;
  const yB = h * 0.8;
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    strings += `<line x1="${r2(x0 + (x1 - x0) * t)}" y1="${r2(yT)}" x2="${r2(x0 - w * 0.04 + (x1 - x0 + w * 0.08) * t)}" y2="${r2(yB)}" stroke="#c9b48a" stroke-opacity=".55" stroke-width="2.4"/>`;
  }
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const y = yT + (yB - yT) * t;
    strings += `<line x1="${r2(x0 - w * 0.04 * t)}" y1="${r2(y)}" x2="${r2(x1 + w * 0.04 * t)}" y2="${r2(y)}" stroke="#c9b48a" stroke-opacity=".45" stroke-width="2.4"/>`;
  }
  return sceneDoc(w, h, [
    { def: linear('wall', [[0, '#3c4a47'], [1, '#1b2220']]), el: `<rect width="${w}" height="${r2(h * 0.6)}" fill="url(#wall)"/>` },
    `<rect y="${r2(h * 0.6)}" width="${w}" height="${r2(h * 0.4)}" fill="#141210"/>`,
    glow('tube', { cx: w * 0.55, cy: h * 0.16, rx: w * 0.4, ry: h * 0.35, color: '#e9fff4', opacity: 0.4 }),
    `<rect x="${r2(w * 0.4)}" y="${r2(h * 0.145)}" width="${r2(w * 0.3)}" height="${r2(h * 0.03)}" rx="8" fill="#f6fffb"/>`,
    `<rect x="${r2(w * 0.39)}" y="${r2(h * 0.14)}" width="${r2(w * 0.32)}" height="8" fill="#9aa8a4"/>`,
    // moths at the tube
    `<g fill="#23201c">${[0.45, 0.52, 0.61, 0.66].map((p, i) => `<ellipse cx="${r2(w * p)}" cy="${r2(h * (0.21 + i * 0.012))}" rx="9" ry="5"/>`).join('')}</g>`,
    // the cot: frame, legs, strings
    `<g fill="#3a2414"><polygon points="${pts([[x0 - 10, yT - 8], [x1 + 10, yT - 8], [x1 + w * 0.04 + 12, yB + 6], [x0 - w * 0.04 - 12, yB + 6]])}" fill="none" stroke="#4a2e18" stroke-width="14"/><rect x="${r2(x0 - w * 0.045)}" y="${r2(yB)}" width="14" height="${r2(h * 0.08)}"/><rect x="${r2(x1 + w * 0.035)}" y="${r2(yB)}" width="14" height="${r2(h * 0.08)}"/></g>`,
    strings,
    // the singer, sitting at the end of the cot, lit from above
    `<g fill="#0f0d0b"><ellipse cx="${r2(w * 0.7)}" cy="${r2(h * 0.38)}" rx="${r2(h * 0.045)}" ry="${r2(h * 0.055)}"/><path d="M ${r2(w * 0.64)},${r2(h * 0.66)} C ${r2(w * 0.64)},${r2(h * 0.5)} ${r2(w * 0.66)},${r2(h * 0.43)} ${r2(w * 0.7)},${r2(h * 0.43)} C ${r2(w * 0.74)},${r2(h * 0.43)} ${r2(w * 0.76)},${r2(h * 0.5)} ${r2(w * 0.76)},${r2(h * 0.66)} Z"/></g>`,
    `<path d="M ${r2(w * 0.7)},${r2(h * 0.326)} A ${r2(h * 0.045)} ${r2(h * 0.055)} 0 0 1 ${r2(w * 0.7 + h * 0.04)},${r2(h * 0.36)}" fill="none" stroke="#eafff5" stroke-width="3" stroke-opacity=".55"/>`,
    glow('pink', { cx: -w * 0.05, cy: h * 0.6, rx: w * 0.3, ry: h * 0.5, color: PINK, opacity: 0.25 }),
    vignette('v', w, h, 0.5),
  ]);
}

// ── Half Court ───────────────────────────────────────────────────────────────

function hoop(x, y, s, fill = '#0b0a10') {
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})" fill="${fill}"><rect x="-6" y="-420" width="12" height="420"/><rect x="-6" y="-420" width="70" height="10"/><rect x="40" y="-480" width="90" height="62" fill="none" stroke="${fill}" stroke-width="7"/><ellipse cx="85" cy="-410" rx="26" ry="5" fill="none" stroke="#ff7a3a" stroke-width="4"/><path d="M 60,-410 L 70,-372 L 100,-372 L 110,-410" fill="none" stroke="#d9d4cf" stroke-opacity=".5" stroke-width="2"/></g>`;
}

export function courtDusk(w, h) {
  const rand = rng(81);
  const gy = h * 0.74;
  let city = '';
  let x = -20;
  while (x < w) {
    const bw = 40 + rand() * 130;
    const bh = h * (0.05 + rand() * 0.13);
    city += `<rect x="${r2(x)}" y="${r2(gy - bh)}" width="${r2(bw)}" height="${r2(bh)}" fill="#151226"/>`;
    for (let k = 0; k < 6; k++) if (rand() > 0.55) city += `<rect x="${r2(x + 8 + rand() * (bw - 20))}" y="${r2(gy - bh + 10 + rand() * (bh - 30))}" width="6" height="8" fill="#ffc98a" fill-opacity=".8"/>`;
    x += bw + 4;
  }
  let fence = '';
  for (let i = -30; i < 60; i++) {
    const fx = i * 46;
    fence += `<line x1="${fx}" y1="${r2(h * 0.38)}" x2="${fx + h * 0.62}" y2="${h}" stroke="#d8d0c8" stroke-opacity=".12" stroke-width="1.6"/><line x1="${fx}" y1="${r2(h * 0.38)}" x2="${fx - h * 0.62}" y2="${h}" stroke="#d8d0c8" stroke-opacity=".12" stroke-width="1.6"/>`;
  }
  return sceneDoc(w, h, [
    skyRect('sky', w, gy, [[0, '#1d1a38'], [0.5, '#5b3b5c'], [0.82, '#d9785a'], [1, '#f2b27a']]),
    glow('sun', { cx: w * 0.3, cy: gy, rx: w * 0.25, ry: h * 0.2, color: '#ffd29a', opacity: 0.6 }),
    city,
    { def: linear('court', [[0, '#2b2236'], [1, '#120f18']]), el: `<rect y="${r2(gy)}" width="${w}" height="${r2(h - gy)}" fill="url(#court)"/>` },
    `<path d="M ${r2(w * 0.55)},${r2(gy + 6)} Q ${r2(w * 0.72)},${r2(h * 0.92)} ${r2(w * 0.94)},${r2(gy + 6)}" fill="none" stroke="#e8dccc" stroke-opacity=".35" stroke-width="4"/>`,
    hoop(w * 0.86, gy + h * 0.04, h / 640),
    // the floodlight tower
    `<rect x="${r2(w * 0.12)}" y="${r2(h * 0.12)}" width="8" height="${r2(gy - h * 0.12)}" fill="#0c0a12"/><rect x="${r2(w * 0.11)}" y="${r2(h * 0.1)}" width="${r2(w * 0.03)}" height="${r2(h * 0.03)}" fill="#fff5e2"/>`,
    glow('flood', { cx: w * 0.125, cy: h * 0.115, rx: h * 0.18, ry: h * 0.14, color: '#fff3dc', opacity: 0.75 }),
    // the jump, caught at the top
    `<g transform="translate(${r2(w * 0.74)} ${r2(gy - h * 0.18)})">${figure(0, 0, h * 0.24, '#09080d', { extra: '<path d="M -10,-62 L -22,-112 M 10,-62 L 24,-110" stroke="#09080d" stroke-width="7" stroke-linecap="round"/>' })}</g>`,
    `<circle cx="${r2(w * 0.775)}" cy="${r2(gy - h * 0.5)}" r="${r2(h * 0.022)}" fill="#c4572a"/>`,
    `<ellipse cx="${r2(w * 0.74)}" cy="${r2(gy + h * 0.06)}" rx="${r2(h * 0.07)}" ry="6" fill="#000" opacity=".5"/>`,
    fence,
    vignette('v', w, h, 0.45),
  ]);
}

export function courtBall(w, h) {
  const cx = w * 0.56;
  const cy = h * 0.44;
  const R = h * 0.2;
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#2a2147'], [0.6, '#a1566a'], [1, '#f0a070']]),
    `<circle cx="${r2(w * 0.2)}" cy="${r2(h * 0.24)}" r="${r2(h * 0.03)}" fill="#f6efe2" opacity=".85"/>`,
    { def: radial('ball', [[0, '#e07a3a'], [0.7, '#9a3e1a'], [1, '#4a1a0a']], { cx: 0.62, cy: 0.62, r: 0.75 }), el: `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="url(#ball)"/>` },
    `<g fill="none" stroke="#1e0c05" stroke-width="${r2(R * 0.04)}"><path d="M ${r2(cx - R)},${r2(cy)} Q ${r2(cx)},${r2(cy + R * 0.25)} ${r2(cx + R)},${r2(cy)}"/><path d="M ${r2(cx)},${r2(cy - R)} Q ${r2(cx - R * 0.25)},${r2(cy)} ${r2(cx)},${r2(cy + R)}"/><path d="M ${r2(cx - R * 0.7)},${r2(cy - R * 0.7)} Q ${r2(cx - R * 0.2)},${r2(cy)} ${r2(cx - R * 0.7)},${r2(cy + R * 0.7)}"/><path d="M ${r2(cx + R * 0.7)},${r2(cy - R * 0.7)} Q ${r2(cx + R * 0.2)},${r2(cy)} ${r2(cx + R * 0.7)},${r2(cy + R * 0.7)}"/></g>`,
    `<path d="M ${r2(cx - R * 0.95)},${r2(cy - R * 0.3)} A ${r2(R)} ${r2(R)} 0 0 1 ${r2(cx + R * 0.2)},${r2(cy - R * 0.98)}" fill="none" stroke="#ffe0b8" stroke-width="5" stroke-opacity=".7"/>`,
    vignette('v', w, h, 0.4),
  ]);
}

export function courtFence(w, h) {
  let mesh = '';
  const step = h * 0.12;
  for (let i = -20; i < w / step + 20; i++) {
    const x = i * step;
    mesh += `<line x1="${r2(x)}" y1="0" x2="${r2(x + h)}" y2="${h}" stroke="#bdb6ae" stroke-width="5"/><line x1="${r2(x)}" y1="0" x2="${r2(x - h)}" y2="${h}" stroke="#8e8780" stroke-width="5"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0d0b16"/>`,
    { def: blurFilter('bk', 18), el: `<g filter="url(#bk)">${bokeh(rng(8), 18, { x0: 0, x1: w, y0: 0, y1: h * 0.7, rMin: 60, rMax: 200, colors: ['#fff3dc', '#ffd29a', '#c9d8ff'], opacity: [0.25, 0.8] })}</g>` },
    `<g opacity=".95">${mesh}</g>`,
    glow('rim', { cx: w * 0.7, cy: h * 0.2, rx: w * 0.4, ry: h * 0.5, color: '#fff3dc', opacity: 0.18 }),
    vignette('v', w, h, 0.5),
  ]);
}

export function courtLines(w, h) {
  const rand = rng(84);
  let grit = '';
  for (let i = 0; i < 900; i++) grit += `<circle cx="${r2(rand() * w)}" cy="${r2(rand() * h)}" r="${r2(1 + rand() * 2)}" fill="${rand() > 0.5 ? '#3a2f3a' : '#1a141c'}" fill-opacity=".6"/>`;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#2a2030"/>`,
    grit,
    `<g fill="none" stroke="#efe6d6" stroke-opacity=".8" stroke-width="10"><rect x="${r2(w * 0.4)}" y="-20" width="${r2(w * 0.2)}" height="${r2(h * 0.62)}"/><path d="M ${r2(w * 0.4)},${r2(h * 0.6)} A ${r2(w * 0.1)} ${r2(w * 0.1)} 0 0 0 ${r2(w * 0.6)},${r2(h * 0.6)}"/><path d="M ${r2(w * 0.15)},-20 L ${r2(w * 0.15)},${r2(h * 0.3)} A ${r2(w * 0.35)} ${r2(w * 0.35)} 0 0 0 ${r2(w * 0.85)},${r2(h * 0.3)} L ${r2(w * 0.85)},-20"/></g>`,
    // the long shadow of a player crossing the key in low sun
    `<path d="M ${r2(w * 0.22)},${r2(h * 0.92)} L ${r2(w * 0.25)},${r2(h * 0.9)} L ${r2(w * 0.78)},${r2(h * 0.52)} Q ${r2(w * 0.83)},${r2(h * 0.48)} ${r2(w * 0.8)},${r2(h * 0.56)} L ${r2(w * 0.27)},${r2(h * 0.95)} Z" fill="#0a070c" opacity=".7"/>`,
    glow('sun', { cx: -w * 0.1, cy: h * 1.1, rx: w * 0.7, ry: h * 0.8, color: '#ffb46b', opacity: 0.35 }),
    vignette('v', w, h, 0.45),
  ]);
}

// ── The Tailor of Lalbaug ────────────────────────────────────────────────────

function shirt(x, y, s, fill) {
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})"><path d="M -6,-8 Q 0,-16 6,-8" fill="none" stroke="#5a4a3a" stroke-width="3"/><path d="M -40,0 L -14,-6 L 0,4 L 14,-6 L 40,0 L 56,40 L 40,46 L 36,30 L 36,120 L -36,120 L -36,30 L -40,46 L -56,40 Z" fill="${fill}"/></g>`;
}

export function tailorShop(w, h) {
  const rand = rng(91);
  let shutter = '';
  for (let i = 0; i < 9; i++) shutter += `<rect x="${r2(w * 0.3)}" y="${r2(h * 0.2 + i * 14)}" width="${r2(w * 0.4)}" height="9" fill="#2a2724"/>`;
  let shirts = '';
  for (let i = 0; i < 7; i++) shirts += shirt(w * (0.34 + i * 0.05), h * 0.41, h / 900, ['#24304a', '#5a2a24', '#e4dccb', '#2d3a2a', '#7a5a2a', '#c9c2b4', '#3a2433'][i]);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0c0b0b"/>`,
    // the facade, a blank sign, the lit opening
    `<rect x="${r2(w * 0.22)}" y="${r2(h * 0.04)}" width="${r2(w * 0.56)}" height="${r2(h * 0.74)}" fill="#151312"/>`,
    `<rect x="${r2(w * 0.3)}" y="${r2(h * 0.08)}" width="${r2(w * 0.4)}" height="${r2(h * 0.09)}" fill="#e9dcc0"/>`,
    glow('sign', { cx: w * 0.5, cy: h * 0.125, rx: w * 0.26, ry: h * 0.09, color: '#fff1d0', opacity: 0.25 }),
    { def: linear('inside', [[0, '#ffd8a0'], [1, '#a0602e']]), el: `<rect x="${r2(w * 0.3)}" y="${r2(h * 0.2)}" width="${r2(w * 0.4)}" height="${r2(h * 0.58)}" fill="url(#inside)"/>` },
    shutter,
    `<line x1="${r2(w * 0.32)}" y1="${r2(h * 0.4)}" x2="${r2(w * 0.68)}" y2="${r2(h * 0.4)}" stroke="#3a2a1e" stroke-width="4"/>`,
    shirts,
    // the tailor at the machine
    `<g fill="#120c08"><ellipse cx="${r2(w * 0.43)}" cy="${r2(h * 0.56)}" rx="${r2(h * 0.04)}" ry="${r2(h * 0.05)}"/><path d="M ${r2(w * 0.38)},${r2(h * 0.78)} C ${r2(w * 0.38)},${r2(h * 0.66)} ${r2(w * 0.4)},${r2(h * 0.6)} ${r2(w * 0.44)},${r2(h * 0.6)} C ${r2(w * 0.48)},${r2(h * 0.61)} ${r2(w * 0.5)},${r2(h * 0.66)} ${r2(w * 0.51)},${r2(h * 0.7)} L ${r2(w * 0.51)},${r2(h * 0.78)} Z"/><rect x="${r2(w * 0.5)}" y="${r2(h * 0.66)}" width="${r2(w * 0.12)}" height="${r2(h * 0.03)}"/><path d="M ${r2(w * 0.53)},${r2(h * 0.66)} L ${r2(w * 0.53)},${r2(h * 0.6)} L ${r2(w * 0.6)},${r2(h * 0.6)} L ${r2(w * 0.6)},${r2(h * 0.64)}"/></g>`,
    // the wet street catches the shop
    { def: linear('street', [[0, '#1a1410'], [1, '#080707']]), el: `<rect y="${r2(h * 0.78)}" width="${w}" height="${r2(h * 0.22)}" fill="url(#street)"/>` },
    glow('refl', { cx: w * 0.5, cy: h * 0.86, rx: w * 0.2, ry: h * 0.06, color: '#ffb46b', opacity: 0.4 }),
    rain(rand, 120, { w, h, angle: 6, len: [20, 60], color: '#ffe2bc', opacity: [0.04, 0.16], width: 1.4 }),
    vignette('v', w, h, 0.55),
  ]);
}

export function tailorHands(w, h) {
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0e0a08"/>`,
    glow('lamp', { cx: w * 0.5, cy: h * 0.1, rx: w * 0.5, ry: h * 0.8, color: '#ffb46b', opacity: 0.45 }),
    { def: linear('cloth', [[0, '#3a4e7a'], [1, '#1a2440']]), el: `<polygon points="${pts([[0, h * 0.62], [w, h * 0.55], [w, h], [0, h]])}" fill="url(#cloth)"/>` },
    `<g stroke="#e9e2d0" stroke-opacity=".6" stroke-width="3" stroke-dasharray="14 10"><line x1="0" y1="${r2(h * 0.78)}" x2="${w}" y2="${r2(h * 0.72)}"/></g>`,
    // the machine head
    { def: linear('mach', [[0, '#3a3532'], [1, '#100d0b']]), el: `<path d="M ${r2(w * 0.2)},${r2(h * 0.6)} L ${r2(w * 0.2)},${r2(h * 0.3)} Q ${r2(w * 0.2)},${r2(h * 0.18)} ${r2(w * 0.32)},${r2(h * 0.18)} L ${r2(w * 0.68)},${r2(h * 0.18)} Q ${r2(w * 0.76)},${r2(h * 0.18)} ${r2(w * 0.76)},${r2(h * 0.28)} L ${r2(w * 0.76)},${r2(h * 0.46)} L ${r2(w * 0.66)},${r2(h * 0.46)} L ${r2(w * 0.66)},${r2(h * 0.32)} L ${r2(w * 0.32)},${r2(h * 0.32)} L ${r2(w * 0.32)},${r2(h * 0.6)} Z" fill="url(#mach)"/>` },
    `<path d="M ${r2(w * 0.32)},${r2(h * 0.185)} L ${r2(w * 0.68)},${r2(h * 0.185)}" stroke="#ffd6a0" stroke-width="4" stroke-opacity=".7"/>`,
    `<rect x="${r2(w * 0.7)}" y="${r2(h * 0.46)}" width="10" height="${r2(h * 0.12)}" fill="#c9c2b4"/>`,
    `<circle cx="${r2(w * 0.8)}" cy="${r2(h * 0.26)}" r="${r2(h * 0.07)}" fill="#1a1512" stroke="#4a3e33" stroke-width="5"/>`,
    // two hands guiding the cloth
    `<g fill="#6a4630"><ellipse cx="${r2(w * 0.58)}" cy="${r2(h * 0.66)}" rx="${r2(w * 0.07)}" ry="${r2(h * 0.05)}" transform="rotate(-8 ${r2(w * 0.58)} ${r2(h * 0.66)})"/><ellipse cx="${r2(w * 0.84)}" cy="${r2(h * 0.62)}" rx="${r2(w * 0.07)}" ry="${r2(h * 0.05)}" transform="rotate(6 ${r2(w * 0.84)} ${r2(h * 0.62)})"/></g>`,
    `<g fill="#ffcf9a" fill-opacity=".35"><ellipse cx="${r2(w * 0.57)}" cy="${r2(h * 0.64)}" rx="${r2(w * 0.04)}" ry="${r2(h * 0.02)}"/><ellipse cx="${r2(w * 0.83)}" cy="${r2(h * 0.6)}" rx="${r2(w * 0.04)}" ry="${r2(h * 0.02)}"/></g>`,
    vignette('v', w, h, 0.6),
  ]);
}

export function tailorTape(w, h) {
  const cx = w * 0.52;
  const cy = h * 0.52;
  let tape = '';
  for (let k = 0; k < 7; k++) {
    const R = h * (0.08 + k * 0.045);
    tape += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="none" stroke="#e6c24a" stroke-width="${r2(h * 0.036)}"/>`;
    tape += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="none" stroke="#2a2210" stroke-width="2" stroke-dasharray="2 ${r2(R * 0.06)}"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#141a2a"/>`,
    `<g stroke="#f2efe6" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"><line x1="${r2(w * 0.05)}" y1="${r2(h * 0.2)}" x2="${r2(w * 0.38)}" y2="${r2(h * 0.12)}"/><path d="M ${r2(w * 0.75)},${r2(h * 0.1)} Q ${r2(w * 0.88)},${r2(h * 0.45)} ${r2(w * 0.78)},${r2(h * 0.9)}"/></g>`,
    tape,
    `<path d="M ${r2(cx + h * 0.35)},${r2(cy)} L ${r2(w * 1.05)},${r2(h * 0.7)}" stroke="#e6c24a" stroke-width="${r2(h * 0.036)}"/>`,
    glow('key', { cx: w * 0.2, cy: h * 0.1, rx: w * 0.6, ry: h * 0.6, color: '#ffcf8f', opacity: 0.25 }),
    vignette('v', w, h, 0.55),
  ]);
}

export function tailorRack(w, h) {
  let rack = '';
  const tones = ['#2b3550', '#e6dfd0', '#6a2e26', '#3a4a33', '#c8a96a', '#1f1f24', '#8a6a5a', '#d9d2c4', '#45334e'];
  for (let i = 0; i < 9; i++) rack += shirt(w * (0.12 + i * 0.095), h * 0.26, h / 330, tones[i]);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#140f0c"/>`,
    glow('bulb', { cx: w * 0.08, cy: h * 0.1, rx: w * 0.55, ry: h * 0.9, color: '#ffb46b', opacity: 0.4 }),
    `<line x1="0" y1="${r2(h * 0.23)}" x2="${w}" y2="${r2(h * 0.23)}" stroke="#2a221c" stroke-width="10"/>`,
    rack,
    { def: linear('side', [[0, '#000', 0], [1, '#000', 0.75]], { x2: 1, y2: 0 }), el: `<rect width="${w}" height="${h}" fill="url(#side)"/>` },
    `<circle cx="${r2(w * 0.06)}" cy="${r2(h * 0.08)}" r="${r2(h * 0.03)}" fill="#fff1d6"/>`,
    vignette('v', w, h, 0.45),
  ]);
}

// ── Paper Boats ──────────────────────────────────────────────────────────────

function boat(x, y, s, fill = '#f4f1ea') {
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})"><polygon points="-60,0 60,0 44,22 -44,22" fill="${fill}"/><polygon points="-60,0 0,-58 60,0" fill="${fill}" opacity=".92"/><polygon points="0,-58 12,0 -12,0" fill="#000" opacity=".12"/><polygon points="-44,22 44,22 40,28 -40,28" fill="#000" opacity=".2"/></g>`;
}

export function boatsPuddle(w, h) {
  const rand = rng(101);
  let ripples = '';
  for (let i = 0; i < 26; i++) {
    const x = rand() * w;
    const y = h * (0.15 + rand() * 0.8);
    const r = 20 + rand() * 70;
    ripples += `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(r)}" ry="${r2(r * 0.28)}" fill="none" stroke="#e6edf0" stroke-opacity="${r2(0.1 + rand() * 0.25)}" stroke-width="2"/>`;
  }
  return sceneDoc(w, h, [
    // the sky, upside down in the water, with the roofline and a cable
    skyRect('sky', w, h, [[0, '#6f7f86'], [0.55, '#9fb0b4'], [1, '#c9d2d0']]),
    `<g fill="#2a3134">${[0, 0.18, 0.34, 0.55, 0.72].map((p, i) => `<polygon points="${pts([[w * p, 0], [w * (p + 0.2), 0], [w * (p + 0.2), h * (0.16 + (i % 2) * 0.06)], [w * (p + 0.1), h * (0.22 + (i % 3) * 0.03)], [w * p, h * (0.16 + (i % 2) * 0.06)]])}"/>`).join('')}</g>`,
    `<path d="M 0,${r2(h * 0.4)} Q ${r2(w * 0.5)},${r2(h * 0.5)} ${w},${r2(h * 0.36)}" fill="none" stroke="#1d2224" stroke-width="5"/>`,
    ripples,
    // the edge of the puddle, wet tarmac
    `<path d="M 0,${r2(h * 0.86)} Q ${r2(w * 0.3)},${r2(h * 0.8)} ${r2(w * 0.6)},${r2(h * 0.88)} T ${w},${r2(h * 0.84)} L ${w},${h} L 0,${h} Z" fill="#1b1f21"/>`,
    `<ellipse cx="${r2(w * 0.53)}" cy="${r2(h * 0.66)}" rx="${r2(w * 0.07)}" ry="${r2(h * 0.025)}" fill="#000" opacity=".25"/>`,
    boat(w * 0.53, h * 0.62, h / 520),
    `<g opacity=".25" transform="translate(0 ${r2(h * 1.3)}) scale(1 -1)">${boat(w * 0.53, h * 0.66, h / 520, '#e8e6df')}</g>`,
    vignette('v', w, h, 0.35),
  ]);
}

export function boatsRooftops(w, h) {
  const rand = rng(102);
  let roofs = '';
  for (let r = 0; r < 5; r++) {
    const y = h * (0.25 + r * 0.16);
    for (let i = -1; i < 7; i++) {
      const x = w * (i * 0.17 + (r % 2) * 0.08);
      const tone = ['#4a5a5c', '#3b4a4c', '#5a6466', '#34413f'][Math.floor(rand() * 4)];
      roofs += `<polygon points="${pts([[x, y], [x + w * 0.17, y - h * 0.04], [x + w * 0.17, y + h * 0.1], [x, y + h * 0.14]])}" fill="${tone}"/>`;
      for (let k = 1; k < 8; k++) roofs += `<line x1="${r2(x + k * w * 0.021)}" y1="${r2(y - k * h * 0.005)}" x2="${r2(x + k * w * 0.021)}" y2="${r2(y + h * 0.14 - k * h * 0.005)}" stroke="#000" stroke-opacity=".15" stroke-width="2"/>`;
    }
  }
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#788589'], [1, '#b2bcbc']]),
    roofs,
    `<rect x="${r2(w * 0.62)}" y="${r2(h * 0.62)}" width="${r2(w * 0.04)}" height="${r2(h * 0.06)}" fill="#ffc98a"/>`,
    glow('win', { cx: w * 0.64, cy: h * 0.65, rx: w * 0.06, ry: h * 0.07, color: '#ffb46b', opacity: 0.5 }),
    rain(rand, 420, { w, h, angle: 10, len: [30, 90], color: '#eef3f4', opacity: [0.12, 0.42], width: 1.5 }),
    vignette('v', w, h, 0.35),
  ]);
}

export function boatsDoorway(w, h) {
  const rand = rng(103);
  const dx = w * 0.38;
  const dw = w * 0.22;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1c2224"/>`,
    { def: linear('room', [[0, '#ffd8a0'], [1, '#b8763c']]), el: `<rect x="${r2(dx)}" y="${r2(h * 0.12)}" width="${r2(dw)}" height="${r2(h * 0.72)}" fill="url(#room)"/>` },
    `<rect x="${r2(dx - 14)}" y="${r2(h * 0.1)}" width="${r2(dw + 28)}" height="14" fill="#101415"/>`,
    figure(dx + dw * 0.5, h * 0.84, h * 0.38, '#0e0f10'),
    `<polygon points="${pts([[dx, h * 0.84], [dx + dw, h * 0.84], [dx + dw * 1.6, h], [dx - dw * 0.6, h]])}" fill="#ffb46b" opacity=".18"/>`,
    rain(rand, 260, { w, h, angle: 8, len: [30, 80], color: '#dfe8ea', opacity: [0.08, 0.3], width: 1.5 }),
    vignette('v', w, h, 0.5),
  ]);
}

export function boatsGutter(w, h) {
  const rand = rng(104);
  let flow = '';
  for (let i = 0; i < 40; i++) {
    const y = h * (0.45 + rand() * 0.35);
    flow += `<path d="M ${r2(rand() * w * 0.4)},${r2(y)} q ${r2(w * 0.1)},${r2(-8)} ${r2(w * 0.25)},0" fill="none" stroke="#dfe8ea" stroke-opacity="${r2(0.1 + rand() * 0.3)}" stroke-width="${r2(1.5 + rand() * 3)}"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#20272a"/>`,
    `<polygon points="${pts([[0, h * 0.35], [w, h * 0.28], [w, h * 0.42], [0, h * 0.5]])}" fill="#5a6466"/>`,
    { def: linear('water', [[0, '#7c8d92'], [1, '#3c4a4e']]), el: `<polygon points="${pts([[0, h * 0.5], [w, h * 0.42], [w, h * 0.82], [0, h * 0.9]])}" fill="url(#water)"/>` },
    flow,
    boat(w * 0.32, h * 0.66, h / 900),
    boat(w * 0.58, h * 0.58, h / 1250),
    boat(w * 0.78, h * 0.53, h / 1700, '#e9d9b0'),
    `<polygon points="${pts([[0, h * 0.9], [w, h * 0.82], [w, h], [0, h]])}" fill="#14191b"/>`,
    vignette('v', w, h, 0.45),
  ]);
}

// ── Tide Tables ──────────────────────────────────────────────────────────────

function hull(x, y, s, fill = '#14141a') {
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})" fill="${fill}"><path d="M -120,-20 L 120,-26 Q 140,-28 150,-46 L 130,0 L -110,0 Q -126,-6 -120,-20 Z"/><rect x="-6" y="-170" width="6" height="150"/><line x1="-3" y1="-168" x2="110" y2="-28" stroke="${fill}" stroke-width="2"/><line x1="-3" y1="-168" x2="-100" y2="-24" stroke="${fill}" stroke-width="2"/><rect x="-60" y="-52" width="50" height="30"/></g>`;
}

export function tideDawn(w, h) {
  const hz = h * 0.56;
  return sceneDoc(w, h, [
    skyRect('sky', w, hz, [[0, '#4a4d63'], [0.6, '#c49aa0'], [1, '#f3cfb4']]),
    glow('sun', { cx: w * 0.64, cy: hz - h * 0.04, rx: h * 0.5, ry: h * 0.3, color: '#ffe4c2', opacity: 0.85, core: 0.04 }),
    { def: linear('sea', [[0, '#c7a7a8'], [0.3, '#7d7486'], [1, '#2a2a38']]), el: `<rect y="${r2(hz)}" width="${w}" height="${r2(h - hz)}" fill="url(#sea)"/>` },
    glow('glitter', { cx: w * 0.64, cy: hz + h * 0.12, rx: h * 0.12, ry: h * 0.3, color: '#ffe8cc', opacity: 0.4 }),
    { def: blurFilter('mist', 18), el: `<rect x="-50" y="${r2(hz - 26)}" width="${w + 100}" height="52" fill="#efd8cc" opacity=".55" filter="url(#mist)"/>` },
    hull(w * 0.26, hz + h * 0.02, h / 1100, '#2b2834'),
    hull(w * 0.42, hz + h * 0.05, h / 760, '#1b1922'),
    hull(w * 0.82, hz + h * 0.01, h / 1600, '#4a4452'),
    vignette('v', w, h, 0.35),
  ]);
}

export function tideNets(w, h) {
  const rand = rng(112);
  let net = '';
  const cols = 34;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * w;
    net += `<path d="M ${r2(x)},${r2(h * 0.08)} Q ${r2(x + 20)},${r2(h * 0.55)} ${r2(x + (rand() - 0.5) * 40)},${r2(h * 0.95)}" fill="none" stroke="#2f6a7a" stroke-opacity=".75" stroke-width="2.4"/>`;
  }
  for (let j = 0; j < 22; j++) {
    const y = h * (0.1 + j * 0.04);
    const sag = 30 + j * 4;
    let d = `M 0,${r2(y)}`;
    for (let i = 0; i < 6; i++) d += ` Q ${r2((i + 0.5) * w / 6)},${r2(y + sag)} ${r2((i + 1) * w / 6)},${r2(y)}`;
    net += `<path d="${d}" fill="none" stroke="#3f8a8a" stroke-opacity=".6" stroke-width="2.2"/>`;
  }
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#dfe2dc'], [1, '#f2eee4']]),
    glow('sun', { cx: w * 0.75, cy: h * 0.2, rx: w * 0.4, ry: h * 0.5, color: '#fff6e8', opacity: 0.9 }),
    `<g fill="#3a2e24"><rect x="${r2(w * 0.04)}" y="0" width="14" height="${h}"/><rect x="${r2(w * 0.5)}" y="0" width="14" height="${h}"/><rect x="${r2(w * 0.95)}" y="0" width="14" height="${h}"/></g>`,
    `<line x1="0" y1="${r2(h * 0.08)}" x2="${w}" y2="${r2(h * 0.08)}" stroke="#3a2e24" stroke-width="6"/>`,
    net,
    `<g fill="#e46a3a">${[0.12, 0.3, 0.62, 0.8].map((p) => `<circle cx="${r2(w * p)}" cy="${r2(h * 0.09)}" r="12"/>`).join('')}</g>`,
    vignette('v', w, h, 0.2),
  ]);
}

export function tideLighthouse(w, h) {
  const rand = rng(113);
  const lx = w * 0.7;
  const ly = h * 0.3;
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#04060c'], [0.6, '#0e1626'], [0.62, '#060a12'], [1, '#03050a']]),
    stars(rand, 200, { w, h, y1: 0.6, rMax: 1.8 }),
    { def: linear('beam', [[0, '#fff3d6', 0.6], [1, '#fff3d6', 0]], { x1: 1, y1: 0, x2: 0, y2: 0 }), el: `<polygon points="${pts([[lx, ly - 6], [lx, ly + 6], [-w * 0.05, ly + h * 0.22], [-w * 0.05, ly - h * 0.12]])}" fill="url(#beam)"/>` },
    `<polygon points="${pts([[lx - w * 0.018, ly + 16], [lx + w * 0.018, ly + 16], [lx + w * 0.03, h * 0.66], [lx - w * 0.03, h * 0.66]])}" fill="#0c0f16"/>`,
    `<g fill="#cfc9bc" fill-opacity=".25">${[0.4, 0.5].map((p) => `<rect x="${r2(lx - w * 0.024)}" y="${r2(h * p)}" width="${r2(w * 0.048)}" height="${r2(h * 0.03)}"/>`).join('')}</g>`,
    `<rect x="${r2(lx - w * 0.012)}" y="${r2(ly - 12)}" width="${r2(w * 0.024)}" height="26" fill="#fff6dc"/>`,
    glow('lamp', { cx: lx, cy: ly, rx: h * 0.12, ry: h * 0.1, color: '#fff3d6', opacity: 0.9 }),
    ridge(rng(9), { w, h, base: h * 0.68, amp: h * 0.03, fill: '#05070b' }),
    glow('sea', { cx: w * 0.3, cy: h * 0.64, rx: w * 0.3, ry: h * 0.02, color: '#fff3d6', opacity: 0.25 }),
    vignette('v', w, h, 0.5),
  ]);
}

export function tideRope(w, h) {
  let planks = '';
  for (let i = 0; i < 9; i++) planks += `<rect x="-20" y="${r2(i * h * 0.12)}" width="${w + 40}" height="${r2(h * 0.115)}" fill="${['#5a3e28', '#4a3220', '#634530'][i % 3]}"/><line x1="-20" y1="${r2(i * h * 0.12 + h * 0.115)}" x2="${w + 20}" y2="${r2(i * h * 0.12 + h * 0.115)}" stroke="#1e140c" stroke-width="5"/>`;
  let coil = '';
  for (let k = 0; k < 9; k++) {
    const R = h * (0.06 + k * 0.035);
    coil += `<ellipse cx="${r2(w * 0.5)}" cy="${r2(h * 0.52)}" rx="${r2(R * 1.3)}" ry="${r2(R)}" fill="none" stroke="#c9ad7a" stroke-width="${r2(h * 0.028)}"/><ellipse cx="${r2(w * 0.5)}" cy="${r2(h * 0.52)}" rx="${r2(R * 1.3)}" ry="${r2(R)}" fill="none" stroke="#5a4426" stroke-width="2" stroke-dasharray="6 9"/>`;
  }
  return sceneDoc(w, h, [
    planks,
    coil,
    `<path d="M ${r2(w * 0.5 + h * 0.4)},${r2(h * 0.55)} C ${r2(w * 0.8)},${r2(h * 0.7)} ${r2(w * 0.9)},${r2(h * 0.2)} ${r2(w * 1.05)},${r2(h * 0.3)}" fill="none" stroke="#c9ad7a" stroke-width="${r2(h * 0.028)}"/>`,
    glow('low', { cx: -w * 0.1, cy: h * 0.3, rx: w * 0.8, ry: h * 0.7, color: '#ffbf7a', opacity: 0.35 }),
    vignette('v', w, h, 0.55),
  ]);
}

// ── Velvet Hour ──────────────────────────────────────────────────────────────

function curtain(id, x, y, cw, ch, folds) {
  const stops = [];
  for (let i = 0; i <= folds * 2; i++) stops.push([i / (folds * 2), i % 2 ? '#5a0d14' : '#2a0508']);
  return {
    def: linear(id, stops, { x2: 1, y2: 0 }),
    el: `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(cw)}" height="${r2(ch)}" fill="url(#${id})"/>`,
  };
}

export function velvetSpot(w, h) {
  const rand = rng(121);
  let dust = '';
  for (let i = 0; i < 160; i++) {
    const t = rand();
    const y = h * t;
    const half = w * 0.04 + t * w * 0.12;
    dust += `<circle cx="${r2(w * 0.5 + (rand() - 0.5) * 2 * half)}" cy="${r2(y)}" r="${r2(0.8 + rand() * 2)}" fill="#ffe6c0" fill-opacity="${r2(0.15 + rand() * 0.5)}"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#070405"/>`,
    curtain('cl', 0, 0, w * 0.22, h, 6),
    curtain('cr', w * 0.78, 0, w * 0.22, h, 6),
    curtain('top', 0, 0, w, h * 0.1, 30),
    { def: linear('cone', [[0, '#fff1d6', 0.45], [1, '#ffd29a', 0.08]]), el: `<polygon points="${pts([[w * 0.47, 0], [w * 0.53, 0], [w * 0.64, h * 0.86], [w * 0.36, h * 0.86]])}" fill="url(#cone)"/>` },
    dust,
    `<rect y="${r2(h * 0.84)}" width="${w}" height="${r2(h * 0.16)}" fill="#120a08"/>`,
    glow('pool', { cx: w * 0.5, cy: h * 0.87, rx: w * 0.15, ry: h * 0.045, color: '#ffd8a0', opacity: 0.8 }),
    // the singer at a stand mic
    figure(w * 0.5, h * 0.87, h * 0.46, '#0a0606'),
    `<line x1="${r2(w * 0.515)}" y1="${r2(h * 0.87)}" x2="${r2(w * 0.515)}" y2="${r2(h * 0.53)}" stroke="#0a0606" stroke-width="5"/><circle cx="${r2(w * 0.515)}" cy="${r2(h * 0.52)}" r="9" fill="#0a0606"/>`,
    `<path d="M ${r2(w * 0.5 - h * 0.03)},${r2(h * 0.45)} A ${r2(h * 0.03)} ${r2(h * 0.03)} 0 0 1 ${r2(w * 0.5 + h * 0.03)},${r2(h * 0.45)}" fill="none" stroke="#ffe0b0" stroke-width="3" stroke-opacity=".8"/>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function velvetMic(w, h) {
  const cx = w * 0.46;
  const cy = h * 0.42;
  let grille = '';
  for (let i = -7; i <= 7; i++) grille += `<line x1="${r2(cx - h * 0.12)}" y1="${r2(cy + i * h * 0.022)}" x2="${r2(cx + h * 0.12)}" y2="${r2(cy + i * h * 0.022)}" stroke="#d9c8a8" stroke-opacity=".35" stroke-width="2"/>`;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0b0506"/>`,
    { def: blurFilter('bk', 14), el: `<g filter="url(#bk)">${bokeh(rng(12), 26, { x0: w * 0.4, x1: w, y0: 0, y1: h, rMin: 50, rMax: 170, colors: ['#ffb46b', '#ff7a4a', '#ffd8a0', '#a8202a'], opacity: [0.2, 0.7] })}</g>` },
    { def: linear('chrome', [[0, '#e9e1d2'], [0.4, '#6a625a'], [1, '#1a1614']], { x2: 1, y2: 0 }), el: `<rect x="${r2(cx - h * 0.13)}" y="${r2(cy - h * 0.18)}" width="${r2(h * 0.26)}" height="${r2(h * 0.36)}" rx="${r2(h * 0.12)}" fill="url(#chrome)"/>` },
    grille,
    `<rect x="${r2(cx - h * 0.02)}" y="${r2(cy + h * 0.18)}" width="${r2(h * 0.04)}" height="${r2(h * 0.5)}" fill="#141010"/>`,
    `<path d="M ${r2(cx - h * 0.1)},${r2(cy - h * 0.12)} A ${r2(h * 0.12)} ${r2(h * 0.12)} 0 0 1 ${r2(cx + h * 0.02)},${r2(cy - h * 0.18)}" fill="none" stroke="#fff4e0" stroke-width="5" stroke-opacity=".8"/>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function velvetSeats(w, h) {
  let rows = '';
  for (let r = 0; r < 7; r++) {
    const y = h * (0.3 + r * 0.11);
    const s = 0.5 + r * 0.14;
    const sw = 70 * s;
    const n = Math.ceil(w / (sw + 8)) + 2;
    for (let i = 0; i < n; i++) {
      const x = i * (sw + 8) - (r % 2) * sw * 0.5 - 20;
      const curve = Math.pow((x - w / 2) / w, 2) * h * 0.12;
      rows += `<path d="M ${r2(x)},${r2(y + curve)} q 0,${r2(-60 * s)} ${r2(sw / 2)},${r2(-60 * s)} q ${r2(sw / 2)},0 ${r2(sw / 2)},${r2(60 * s)} Z" fill="${r % 2 ? '#4a0a12' : '#5a0e16'}"/><path d="M ${r2(x + sw * 0.15)},${r2(y + curve - 52 * s)} q ${r2(sw * 0.35)},${r2(-8 * s)} ${r2(sw * 0.7)},0" fill="none" stroke="#ff9a7a" stroke-opacity=".25" stroke-width="2"/>`;
    }
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0a0405"/>`,
    glow('stage', { cx: w * 0.5, cy: -h * 0.1, rx: w * 0.6, ry: h * 0.5, color: '#ffcf8f', opacity: 0.35 }),
    rows,
    vignette('v', w, h, 0.6),
  ]);
}

export function velvetCurtain(w, h) {
  const left = curtain('l', 0, 0, w * 0.495, h, 9);
  const right = curtain('r', w * 0.505, 0, w * 0.495, h, 9);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#fff1d6"/>`,
    glow('gap', { cx: w * 0.5, cy: h * 0.5, rx: w * 0.08, ry: h * 0.7, color: '#fff1d6', opacity: 0.9 }),
    left,
    right,
    `<rect x="${r2(w * 0.493)}" y="0" width="${r2(w * 0.014)}" height="${h}" fill="#fff6e4"/>`,
    glow('spill', { cx: w * 0.5, cy: h * 0.95, rx: w * 0.2, ry: h * 0.08, color: '#ffd8a0', opacity: 0.55 }),
    vignette('v', w, h, 0.45),
  ]);
}

// ── Static ───────────────────────────────────────────────────────────────────

function crt(x, y, cw, ch, screen, { glowOp = 0.5 } = {}) {
  return (
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(cw)}" height="${r2(ch)}" rx="${r2(cw * 0.06)}" fill="#141416"/>` +
    `<rect x="${r2(x + cw * 0.08)}" y="${r2(y + ch * 0.1)}" width="${r2(cw * 0.66)}" height="${r2(ch * 0.78)}" rx="${r2(cw * 0.08)}" fill="${screen}" fill-opacity="${glowOp + 0.4}"/>` +
    `<circle cx="${r2(x + cw * 0.86)}" cy="${r2(y + ch * 0.3)}" r="${r2(cw * 0.035)}" fill="#2a2a2e"/><circle cx="${r2(x + cw * 0.86)}" cy="${r2(y + ch * 0.48)}" r="${r2(cw * 0.035)}" fill="#2a2a2e"/>`
  );
}

export function staticWall(w, h) {
  const rand = rng(131);
  const screens = ['#9fc4ff', '#e6f0ff', '#6a8cff', '#cfe0ff', '#ffb46b', '#a8b8d8'];
  let wall = '';
  const cw = w / 4.4;
  const ch = h / 4.4;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) wall += crt(w * 0.03 + c * (cw + 12), h * 0.04 + r * (ch + 10), cw, ch, screens[Math.floor(rand() * screens.length)], { glowOp: 0.3 + rand() * 0.5 });
  let scan = '';
  for (let y = 0; y < h; y += 6) scan += `<rect y="${y}" width="${w}" height="2" fill="#000" opacity=".18"/>`;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#05060a"/>`,
    wall,
    scan,
    glow('blue', { cx: w * 0.45, cy: h * 0.45, rx: w * 0.6, ry: h * 0.6, color: '#8fb4ff', opacity: 0.22 }),
    `<rect y="${r2(h * 0.86)}" width="${w}" height="${r2(h * 0.14)}" fill="#07080c"/>`,
    figure(w * 0.52, h * 0.98, h * 0.5, '#020203'),
    vignette('v', w, h, 0.5),
  ]);
}

export function staticScan(w, h) {
  let lines = '';
  for (let y = 0; y < h; y += 7) lines += `<rect y="${y}" width="${w}" height="3" fill="#000" opacity=".35"/>`;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0a1430"/>`,
    glow('tube', { cx: w * 0.5, cy: h * 0.5, rx: w * 0.6, ry: h * 0.6, color: '#7aa4ff', opacity: 0.5 }),
    `<g opacity=".55" transform="translate(-10 0)">${profile(w * 0.5, h + 4, h * 0.9, '#ff4a6a')}</g>`,
    `<g opacity=".55" transform="translate(10 0)">${profile(w * 0.5, h + 4, h * 0.9, '#4affe0')}</g>`,
    profile(w * 0.5, h + 4, h * 0.9, '#cfe0ff'),
    `<rect y="${r2(h * 0.44)}" width="${w}" height="${r2(h * 0.05)}" fill="#e6f0ff" opacity=".18"/>`,
    lines,
    vignette('v', w, h, 0.65),
  ]);
}

export function staticBars(w, h) {
  const rand = rng(133);
  const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
  let s = '';
  const bw = w / bars.length;
  bars.forEach((c, i) => {
    s += `<rect x="${r2(i * bw)}" y="0" width="${r2(bw + 1)}" height="${r2(h * 0.68)}" fill="${c}"/>`;
  });
  for (let i = 0; i < 7; i++) s += `<rect x="${r2(i * bw)}" y="${r2(h * 0.68)}" width="${r2(bw + 1)}" height="${r2(h * 0.08)}" fill="${['#0000c0', '#131313', '#c000c0', '#131313', '#00c0c0', '#131313', '#c0c0c0'][i]}"/>`;
  s += `<rect y="${r2(h * 0.76)}" width="${w}" height="${r2(h * 0.24)}" fill="#0e0e10"/>`;
  let tear = '';
  for (let i = 0; i < 9; i++) {
    const y = rand() * h;
    tear += `<rect x="${r2(-w * 0.1 + rand() * w * 0.2)}" y="${r2(y)}" width="${w * 1.2}" height="${r2(4 + rand() * 18)}" fill="#fff" opacity="${r2(0.05 + rand() * 0.2)}"/>`;
  }
  return sceneDoc(w, h, [
    `<g opacity=".82">${s}</g>`,
    tear,
    vignette('v', w, h, 0.6),
  ]);
}

export function staticRoom(w, h) {
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#040509"/>`,
    `<rect y="${r2(h * 0.7)}" width="${w}" height="${r2(h * 0.3)}" fill="#07080d"/>`,
    glow('spill', { cx: w * 0.36, cy: h * 0.62, rx: w * 0.45, ry: h * 0.45, color: '#7a9cff', opacity: 0.4 }),
    crt(w * 0.24, h * 0.5, w * 0.24, h * 0.22, '#cfe0ff', { glowOp: 0.6 }),
    `<path d="M ${r2(w * 0.3)},${r2(h * 0.72)} C ${r2(w * 0.4)},${r2(h * 0.9)} ${r2(w * 0.7)},${r2(h * 0.78)} ${r2(w * 1.05)},${r2(h * 0.95)}" fill="none" stroke="#111219" stroke-width="7"/>`,
    // an empty chair facing the set
    `<g fill="#0c0d13"><rect x="${r2(w * 0.66)}" y="${r2(h * 0.44)}" width="${r2(w * 0.016)}" height="${r2(h * 0.36)}"/><rect x="${r2(w * 0.66)}" y="${r2(h * 0.6)}" width="${r2(w * 0.12)}" height="${r2(h * 0.025)}"/><rect x="${r2(w * 0.76)}" y="${r2(h * 0.6)}" width="${r2(w * 0.016)}" height="${r2(h * 0.2)}"/></g>`,
    `<line x1="${r2(w * 0.668)}" y1="${r2(h * 0.44)}" x2="${r2(w * 0.668)}" y2="${r2(h * 0.6)}" stroke="#8fb0ff" stroke-opacity=".5" stroke-width="2"/>`,
    vignette('v', w, h, 0.55),
  ]);
}

// ── Kiln ─────────────────────────────────────────────────────────────────────

function bricks(rand, x0, y0, bw, bh, cols, rows, tone = ['#2a1a14', '#22150f', '#30201a']) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<rect x="${r2(x0 + c * bw + (r % 2) * bw * 0.5)}" y="${r2(y0 + r * bh)}" width="${r2(bw - 4)}" height="${r2(bh - 4)}" fill="${tone[Math.floor(rand() * tone.length)]}"/>`;
  return s;
}

export function kilnFire(w, h) {
  const rand = rng(141);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0c0705"/>`,
    bricks(rand, -60, -20, w * 0.08, h * 0.06, 15, 19),
    { def: radial('fire', [[0, '#fffbe8'], [0.25, '#ffd27a'], [0.6, '#ff7a1f'], [1, '#8a1e06']], { cx: 0.5, cy: 0.62, r: 0.7 }), el: `<rect x="${r2(w * 0.36)}" y="${r2(h * 0.3)}" width="${r2(w * 0.28)}" height="${r2(h * 0.4)}" rx="${r2(h * 0.03)}" fill="url(#fire)"/>` },
    `<g fill="#3a1a0a" opacity=".7">${[0.4, 0.47, 0.54].map((p) => `<path d="M ${r2(w * p)},${r2(h * 0.66)} q ${r2(w * 0.02)},${r2(-h * 0.12)} ${r2(w * 0.045)},0 Z"/>`).join('')}</g>`,
    glow('heat', { cx: w * 0.5, cy: h * 0.52, rx: w * 0.42, ry: h * 0.5, color: '#ff8a2a', opacity: 0.45 }),
    `<rect x="${r2(w * 0.35)}" y="${r2(h * 0.29)}" width="${r2(w * 0.3)}" height="${r2(h * 0.42)}" rx="${r2(h * 0.035)}" fill="none" stroke="#1a0d07" stroke-width="18"/>`,
    // the door swung open at left, and the potter in silhouette
    `<polygon points="${pts([[w * 0.35, h * 0.29], [w * 0.22, h * 0.24], [w * 0.22, h * 0.76], [w * 0.35, h * 0.71]])}" fill="#140b07"/>`,
    figure(w * 0.8, h * 1.02, h * 0.62, '#070403'),
    `<path d="M ${r2(w * 0.78)},${r2(h * 0.45)} L ${r2(w * 0.77)},${r2(h * 0.8)}" stroke="#ff9a3c" stroke-width="3" stroke-opacity=".6"/>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function kilnWheel(w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  let rings = '';
  for (let k = 0; k < 22; k++) {
    const R = h * (0.05 + k * 0.019);
    rings += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="none" stroke="${k % 2 ? '#8a5a3a' : '#a26c48'}" stroke-width="${r2(h * 0.012)}" stroke-opacity=".9"/>`;
  }
  let spiral = '';
  for (let i = 0; i < 3; i++) {
    let d = '';
    for (let t = 0; t <= 1; t += 0.02) {
      const a = t * Math.PI * 5 + i * 2.1;
      const R = h * 0.05 + t * h * 0.38;
      d += `${t === 0 ? 'M' : 'L'} ${r2(cx + Math.cos(a) * R)},${r2(cy + Math.sin(a) * R)} `;
    }
    spiral += `<path d="${d}" fill="none" stroke="#e8c49a" stroke-opacity=".35" stroke-width="3"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1a120d"/>`,
    `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(h * 0.47)}" fill="#3a3430"/>`,
    `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(h * 0.45)}" fill="#6a4630"/>`,
    { def: blurFilter('spin', 2), el: `<g filter="url(#spin)">${rings}${spiral}</g>` },
    `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(h * 0.05)}" fill="#3a2418"/>`,
    glow('key', { cx: w * 0.3, cy: h * 0.2, rx: w * 0.4, ry: h * 0.5, color: '#ffd8a8', opacity: 0.3 }),
    vignette('v', w, h, 0.55),
  ]);
}

export function kilnShelves(w, h) {
  const rand = rng(143);
  let pots = '';
  for (let r = 0; r < 3; r++) {
    const y = h * (0.32 + r * 0.26);
    pots += `<rect x="0" y="${r2(y)}" width="${w}" height="12" fill="#2a1d14"/>`;
    let x = w * 0.04;
    while (x < w * 0.95) {
      const pw = w * (0.04 + rand() * 0.05);
      const ph = h * (0.08 + rand() * 0.12);
      const kind = Math.floor(rand() * 3);
      const fill = ['#1a120d', '#22180f', '#140e0a'][kind];
      const d = kind === 0
        ? `M ${r2(x)},${r2(y)} Q ${r2(x - pw * 0.1)},${r2(y - ph * 0.6)} ${r2(x + pw * 0.2)},${r2(y - ph)} L ${r2(x + pw * 0.8)},${r2(y - ph)} Q ${r2(x + pw * 1.1)},${r2(y - ph * 0.6)} ${r2(x + pw)},${r2(y)} Z`
        : kind === 1
          ? `M ${r2(x)},${r2(y - ph * 0.5)} Q ${r2(x + pw / 2)},${r2(y + ph * 0.1)} ${r2(x + pw)},${r2(y - ph * 0.5)} Z`
          : `M ${r2(x + pw * 0.2)},${r2(y)} Q ${r2(x - pw * 0.2)},${r2(y - ph * 0.5)} ${r2(x + pw * 0.35)},${r2(y - ph * 0.8)} L ${r2(x + pw * 0.35)},${r2(y - ph)} L ${r2(x + pw * 0.65)},${r2(y - ph)} L ${r2(x + pw * 0.65)},${r2(y - ph * 0.8)} Q ${r2(x + pw * 1.2)},${r2(y - ph * 0.5)} ${r2(x + pw * 0.8)},${r2(y)} Z`;
      pots += `<path d="${d}" fill="${fill}"/>`;
      x += pw + w * (0.01 + rand() * 0.03);
    }
  }
  return sceneDoc(w, h, [
    { def: linear('win', [[0, '#f4ead8'], [1, '#d9c4a0']]), el: `<rect width="${w}" height="${h}" fill="url(#win)"/>` },
    glow('sun', { cx: w * 0.7, cy: h * 0.3, rx: w * 0.5, ry: h * 0.6, color: '#fffaf0', opacity: 0.8 }),
    `<g fill="#2a1d14"><rect x="${r2(w * 0.33)}" y="0" width="${r2(w * 0.012)}" height="${h}"/><rect x="${r2(w * 0.66)}" y="0" width="${r2(w * 0.012)}" height="${h}"/></g>`,
    pots,
    vignette('v', w, h, 0.4),
  ]);
}

export function kilnGlaze(w, h) {
  const rand = rng(144);
  let drips = '';
  for (let i = 0; i < 26; i++) {
    const x = rand() * w;
    const len = h * (0.2 + rand() * 0.5);
    const dw = 14 + rand() * 30;
    drips += `<path d="M ${r2(x - dw / 2)},0 L ${r2(x - dw / 2)},${r2(len)} Q ${r2(x)},${r2(len + dw)} ${r2(x + dw / 2)},${r2(len)} L ${r2(x + dw / 2)},0 Z" fill="${rand() > 0.4 ? '#2f7a74' : '#e6dcc4'}" fill-opacity=".92"/>`;
  }
  return sceneDoc(w, h, [
    { def: linear('body', [[0, '#3a2418'], [0.5, '#5a3a26'], [1, '#2a180e']], { x2: 1, y2: 0 }), el: `<rect width="${w}" height="${h}" fill="url(#body)"/>` },
    `<rect width="${w}" height="${r2(h * 0.22)}" fill="#2f7a74"/>`,
    drips,
    { def: linear('curve', [[0, '#000', 0.6], [0.3, '#000', 0], [0.6, '#fff', 0.12], [1, '#000', 0.65]], { x2: 1, y2: 0 }), el: `<rect width="${w}" height="${h}" fill="url(#curve)"/>` },
    `<rect x="${r2(w * 0.55)}" y="0" width="${r2(w * 0.03)}" height="${h}" fill="#fff6e8" opacity=".18"/>`,
    vignette('v', w, h, 0.45),
  ]);
}

// ── Altitude ─────────────────────────────────────────────────────────────────

export function altRidge(w, h) {
  const rand = rng(151);
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#0a1024'], [0.5, '#24365e'], [1, '#6c86a8']]),
    stars(rand, 220, { w, h, y1: 0.55, rMax: 1.8 }),
    ridge(rng(15), { w, h, base: h * 0.42, amp: h * 0.12, steps: 14, fill: '#8ea6c4' }),
    ridge(rng(16), { w, h, base: h * 0.56, amp: h * 0.08, steps: 16, fill: '#5d7598' }),
    ridge(rng(17), { w, h, base: h * 0.7, amp: h * 0.05, steps: 18, fill: '#33476a' }),
    ridge(rng(18), { w, h, base: h * 0.84, amp: h * 0.025, steps: 20, fill: '#1a2742' }),
    // a lit tent, the only warm thing for miles
    `<polygon points="${pts([[w * 0.6, h * 0.86], [w * 0.62, h * 0.82], [w * 0.64, h * 0.86]])}" fill="#ffb46b"/>`,
    glow('tent', { cx: w * 0.62, cy: h * 0.85, rx: h * 0.08, ry: h * 0.05, color: '#ffb46b', opacity: 0.7 }),
    vignette('v', w, h, 0.35),
  ]);
}

export function altFlags(w, h) {
  const rand = rng(152);
  const colors = ['#2a5ab8', '#f4f1ea', '#c8302a', '#2e8a4a', '#e6b82a'];
  let flags = '';
  for (let s = 0; s < 3; s++) {
    const y0 = h * (0.1 + s * 0.22);
    const y1 = h * (0.5 + s * 0.16);
    const n = 26;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = t * w;
      const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * h * 0.1;
      const fw = w * 0.026;
      const wave = (rand() - 0.5) * 10;
      flags += `<polygon points="${pts([[x, y], [x + fw, y + wave * 0.3], [x + fw + wave, y + fw * 1.1], [x + wave, y + fw * 1.1]])}" fill="${colors[i % 5]}" fill-opacity=".9"/>`;
    }
    flags += `<path d="M 0,${r2(y0)} Q ${r2(w / 2)},${r2((y0 + y1) / 2 + h * 0.2)} ${w},${r2(y1)}" fill="none" stroke="#2a2a2a" stroke-width="2"/>`;
  }
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [[0, '#4a7ab8'], [1, '#c8dcf0']]),
    glow('sun', { cx: w * 0.82, cy: h * 0.18, rx: h * 0.3, ry: h * 0.3, color: '#ffffff', opacity: 0.9 }),
    ridge(rng(25), { w, h, base: h * 0.86, amp: h * 0.06, fill: '#e8eef4' }),
    flags,
    vignette('v', w, h, 0.25),
  ]);
}

export function altRoad(w, h) {
  let d = `M ${r2(w * 0.45)},${r2(h * 0.08)}`;
  const turns = 7;
  for (let i = 1; i <= turns; i++) {
    const y = h * (0.08 + (i / turns) * 0.9);
    const x = i % 2 ? w * (0.7 + i * 0.02) : w * (0.25 - i * 0.015);
    d += ` Q ${r2(i % 2 ? x + w * 0.12 : x - w * 0.12)},${r2(y - h * 0.06)} ${r2(x)},${r2(y)}`;
  }
  return sceneDoc(w, h, [
    { def: linear('slope', [[0, '#1a2034'], [1, '#0a0d16']]), el: `<rect width="${w}" height="${h}" fill="url(#slope)"/>` },
    `<path d="${d}" fill="none" stroke="#5a6680" stroke-width="16" stroke-opacity=".7"/>`,
    `<path d="${d}" fill="none" stroke="#c9d2e6" stroke-width="3" stroke-opacity=".5" stroke-dasharray="20 30"/>`,
    `<circle cx="${r2(w * 0.68)}" cy="${r2(h * 0.4)}" r="6" fill="#fff6dc"/><circle cx="${r2(w * 0.695)}" cy="${r2(h * 0.405)}" r="6" fill="#fff6dc"/>`,
    glow('head', { cx: w * 0.64, cy: h * 0.42, rx: w * 0.08, ry: h * 0.05, color: '#fff3d6', opacity: 0.55 }),
    vignette('v', w, h, 0.5),
  ]);
}

export function altStars(w, h) {
  const rand = rng(154);
  let band = '';
  for (let i = 0; i < 900; i++) {
    const t = rand();
    const x = t * w;
    const y = h * (0.7 - t * 0.55) + (rand() - 0.5) * h * 0.22 * (1 - Math.abs(t - 0.5));
    band += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(0.5 + rand() * 1.3)}" fill="#e8eeff" fill-opacity="${r2(0.2 + rand() * 0.6)}"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#03050c"/>`,
    { def: blurFilter('mw', 40), el: `<path d="M 0,${r2(h * 0.72)} Q ${r2(w * 0.5)},${r2(h * 0.38)} ${w},${r2(h * 0.12)}" fill="none" stroke="#9fb0e0" stroke-opacity=".25" stroke-width="${r2(h * 0.18)}" filter="url(#mw)"/>` },
    stars(rand, 380, { w, h, y1: 1, rMax: 1.6 }),
    band,
    ridge(rng(35), { w, h, base: h * 0.86, amp: h * 0.09, steps: 12, fill: '#010206' }),
    vignette('v', w, h, 0.4),
  ]);
}
