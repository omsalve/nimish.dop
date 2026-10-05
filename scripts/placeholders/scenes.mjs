// Mood frames for the placeholder films. Each function returns an SVG string.
// They are deliberately simple compositions (light, horizon, one figure) that
// stand in for real stills until Nimish's frames replace them.

import { svgDoc, linear, radial, blurFilter, glow, rng, r2 } from './lib.mjs';

// ── shared shapes ────────────────────────────────────────────────────────────

/** Standing figure, 100 units tall, feet at the origin. */
const FIGURE =
  'M -3,-84 L 3,-84 L 4,-80 Q 11,-78 12,-70 L 14,-46 Q 14,-43 12,-43 L 10,-58 L 9,-40 L 8,-2 Q 8,0 6,0 L 3,0 L 1,-38 L -1,-38 L -3,0 L -6,0 Q -8,0 -8,-2 L -9,-40 L -10,-58 L -12,-43 Q -14,-43 -14,-46 L -12,-70 Q -11,-78 -4,-80 Z';

function figure(x, y, h, fill = '#1d1b19', { head = true, flip = false, extra = '' } = {}) {
  const s = h / 100;
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${flip ? -s : s} ${s})" fill="${fill}"><path d="${FIGURE}"/>${
    head ? '<circle cx="0" cy="-91" r="6.6"/>' : ''
  }${extra}</g>`;
}

/** Head-and-shoulders profile facing right; ~300 units tall, origin at the base. */
const PROFILE =
  'M -150,0 C -150,-60 -120,-96 -70,-110 C -76,-132 -92,-150 -98,-184 C -106,-236 -78,-292 -10,-298 C 46,-302 82,-266 88,-226 L 92,-206 C 92,-198 88,-195 91,-189 L 112,-160 C 115,-155 111,-150 104,-150 L 101,-143 C 106,-140 106,-135 102,-132 C 106,-129 106,-124 101,-121 C 99,-113 103,-108 100,-102 C 94,-90 78,-88 66,-88 C 61,-74 63,-62 72,-50 C 120,-34 150,-14 164,0 Z';

function profile(x, y, h, fill, { flip = false } = {}) {
  const s = h / 300;
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${flip ? -s : s} ${s})"><path d="${PROFILE}" fill="${fill}"/></g>`;
}

function skyRect(id, w, h, stops, y2 = 1) {
  return {
    def: linear(id, stops, { y2 }),
    el: `<rect width="${w}" height="${h}" fill="url(#${id})"/>`,
  };
}

function vignette(id, w, h, strength = 0.35, color = '#000') {
  return {
    def: radial(id, [
      [0.45, color, 0],
      [1, color, strength],
    ], { cx: 0.5, cy: 0.5, r: 0.78 }),
    el: `<rect width="${w}" height="${h}" fill="url(#${id})"/>`,
  };
}

function bokeh(rand, n, { x0, x1, y0, y1, rMin, rMax, colors, opacity = [0.25, 0.7] }) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const r = rMin + (rMax - rMin) * Math.pow(rand(), 1.6);
    const x = x0 + (x1 - x0) * rand();
    const y = y0 + (y1 - y0) * rand();
    const c = colors[Math.floor(rand() * colors.length)];
    const o = opacity[0] + (opacity[1] - opacity[0]) * rand();
    s += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${c}" fill-opacity="${r2(o * 0.55)}" stroke="${c}" stroke-opacity="${r2(o)}" stroke-width="${r2(Math.max(1.5, r * 0.06))}"/>`;
  }
  return s;
}

function rain(rand, n, { w, h, angle = 12, len = [30, 90], color = '#ffffff', opacity = [0.08, 0.3], width = 1.4 }) {
  let s = '';
  const dx = Math.sin((angle * Math.PI) / 180);
  const dy = Math.cos((angle * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    const L = len[0] + (len[1] - len[0]) * rand();
    const x = rand() * (w + 200) - 100;
    const y = rand() * h;
    const o = opacity[0] + (opacity[1] - opacity[0]) * rand();
    s += `<line x1="${r2(x)}" y1="${r2(y)}" x2="${r2(x + dx * L)}" y2="${r2(y + dy * L)}" stroke="${color}" stroke-opacity="${r2(o)}" stroke-width="${width}" stroke-linecap="round"/>`;
  }
  return s;
}

/** A ridge line from a smoothed random walk, closed to the bottom of the frame. */
function ridge(rand, { w, h, base, amp, steps = 18, fill }) {
  const pts = [];
  let v = 0;
  for (let i = 0; i <= steps; i++) {
    v = v * 0.55 + (rand() - 0.5) * 2;
    pts.push([(i / steps) * (w + 200) - 100, base + v * amp]);
  }
  let d = `M -100,${h} L ${r2(pts[0][0])},${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` Q ${r2(px + (x - px) / 2)},${r2(py)} ${r2(x)},${r2(y)}`;
  }
  d += ` L ${w + 100},${h} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Project a jittered hex grid lying on a ground plane into the frame. */
function groundCracks(rand, { w, h, horizon, cell = 1.2, color, maxW = 4, near = 1.4, far = 30, spread = 30 }) {
  const f = (h - horizon) * near;
  const proj = (X, Z) => [w / 2 + (X * f) / Z, horizon + f / Z];
  let s = '';
  const rows = Math.ceil((far - near) / (cell * 0.866));
  const jit = new Map();
  const vert = (i, j) => {
    const k = `${i},${j}`;
    if (!jit.has(k)) jit.set(k, [(rand() - 0.5) * cell * 0.35, (rand() - 0.5) * cell * 0.3]);
    const [jx, jz] = jit.get(k);
    return [i * cell + (j % 2 ? cell / 2 : 0) + jx, near + j * cell * 0.866 + jz];
  };
  const cols = Math.ceil(spread / cell);
  for (let j = 0; j < rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const a = vert(i, j);
      const b = vert(i + 1, j);
      const c = vert(i + (j % 2 ? 1 : 0), j + 1);
      for (const [p, q] of [
        [a, b],
        [a, c],
      ]) {
        const [x1, y1] = proj(p[0], p[1]);
        const [x2, y2] = proj(q[0], q[1]);
        if (Math.max(y1, y2) < horizon + 2 || Math.min(x1, x2) > w + 40 || Math.max(x1, x2) < -40) continue;
        const z = (p[1] + q[1]) / 2;
        const sw = Math.max(0.4, (maxW * near) / z);
        s += `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${color}" stroke-width="${r2(sw)}" stroke-linecap="round" stroke-opacity="${r2(Math.min(1, 1.6 * (near / z) + 0.25))}"/>`;
      }
    }
  }
  return s;
}

function sceneDoc(w, h, parts) {
  const defs = parts.filter((p) => p && p.def).map((p) => p.def);
  const els = parts.map((p) => (typeof p === 'string' ? p : p.el || ''));
  return svgDoc(w, h, els.join('\n'), defs.join('\n'));
}

// ── Salt ─────────────────────────────────────────────────────────────────────

export function saltWide(w, h) {
  const rand = rng(11);
  const hz = h * 0.47;
  return sceneDoc(w, h, [
    skyRect('sky', w, hz + 4, [
      [0, '#d7dde2'],
      [0.7, '#eceeed'],
      [1, '#f5f3ee'],
    ]),
    glow('sun', { cx: w * 0.74, cy: h * 0.12, rx: h * 0.42, ry: h * 0.42, color: '#ffffff', opacity: 0.9, core: 0.08 }),
    { def: linear('gr', [[0, '#f1efe8'], [0.35, '#e9e6dd'], [1, '#dcd8cc']]), el: `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#gr)"/>` },
    groundCracks(rand, { w, h, horizon: hz, cell: 1.3, color: '#cbc6b8', maxW: 5, spread: 40 }),
    { def: blurFilter('haze', 10), el: `<rect x="-50" y="${hz - 12}" width="${w + 100}" height="26" fill="#d9dcdb" opacity=".7" filter="url(#haze)"/>` },
    // salt heaps along the horizon
    `<g>${[0.1, 0.135, 0.165, 0.19, 0.212]
      .map((p, i) => {
        const x = w * p;
        const hh = 26 - i * 3;
        return `<path d="M ${r2(x - hh * 1.6)},${r2(hz + 2)} Q ${r2(x)},${r2(hz - hh * 1.4)} ${r2(x + hh * 1.6)},${r2(hz + 2)} Z" fill="#f7f6f1"/><path d="M ${r2(x)},${r2(hz - hh * 0.7)} Q ${r2(x + hh * 0.8)},${r2(hz - hh * 0.2)} ${r2(x + hh * 1.6)},${r2(hz + 2)} L ${r2(x)},${r2(hz + 2)} Z" fill="#d6d2c6" opacity=".7"/>`;
      })
      .join('')}</g>`,
    // the worker, rake and shadow
    `<ellipse cx="${r2(w * 0.655 - 70)}" cy="${r2(hz + 64)}" rx="70" ry="5" fill="#9b968a" opacity=".45"/>`,
    figure(w * 0.655, hz + 64, 74, '#26231f'),
    `<line x1="${r2(w * 0.655 - 9)}" y1="${r2(hz + 30)}" x2="${r2(w * 0.655 - 52)}" y2="${r2(hz + 66)}" stroke="#26231f" stroke-width="2.4"/><line x1="${r2(w * 0.655 - 60)}" y1="${r2(hz + 66)}" x2="${r2(w * 0.655 - 42)}" y2="${r2(hz + 67)}" stroke="#26231f" stroke-width="3"/>`,
    vignette('v', w, h, 0.12),
  ]);
}

export function saltCrystals(w, h) {
  const rand = rng(12);
  const hz = h * 0.16;
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [
      [0, '#fbf4e8'],
      [0.2, '#efe6d6'],
      [1, '#d9d2c3'],
    ]),
    { def: blurFilter('dof', 3.2), el: `<g filter="url(#dof)">${groundCracks(rng(5), { w, h, horizon: hz, cell: 1.0, color: '#b7ae9d', maxW: 6, near: 0.9, far: 18, spread: 26 })}</g>` },
    `<g transform="translate(3 -3)">${groundCracks(rand, { w, h, horizon: hz, cell: 1.0, color: '#fffaf1', maxW: 9, near: 0.9, far: 6, spread: 12 })}</g>`,
    groundCracks(rng(12), { w, h, horizon: hz, cell: 1.0, color: '#a99f8c', maxW: 7, near: 0.9, far: 6, spread: 12 }),
    glow('low', { cx: -w * 0.05, cy: h * 0.1, rx: w * 0.7, ry: h * 0.6, color: '#ffd6a0', opacity: 0.35 }),
    vignette('v', w, h, 0.28, '#3a2f22'),
  ]);
}

export function saltPortrait(w, h) {
  return sceneDoc(w, h, [
    skyRect('sky', w, h, [
      [0, '#f7f6f2'],
      [0.82, '#efede6'],
      [0.83, '#d8d3c6'],
      [1, '#cbc5b6'],
    ]),
    glow('sun', { cx: w * 0.86, cy: h * 0.3, rx: h * 0.7, ry: h * 0.7, color: '#ffffff', opacity: 1, core: 0.2 }),
    // scarf over the head, then the face
    `<g transform="translate(${r2(w * 0.3)} ${h + 4}) scale(${r2(h / 380)})"><path d="M -190,4 C -200,-90 -160,-150 -118,-170 C -140,-230 -120,-300 -40,-322 C 30,-338 98,-306 104,-238 C 60,-268 -10,-266 -56,-226 C -110,-170 -130,-90 -110,4 Z" fill="#33302b"/></g>`,
    profile(w * 0.3, h + 4, h * 0.92, '#2a2723'),
    `<g transform="translate(${r2(w * 0.3)} ${h + 4}) scale(${r2((h * 0.92) / 300)})"><path d="M 88,-226 L 92,-206 C 92,-198 88,-195 91,-189 L 112,-160 C 115,-155 111,-150 104,-150 L 101,-143 C 106,-140 106,-135 102,-132 C 106,-129 106,-124 101,-121 C 99,-113 103,-108 100,-102" fill="none" stroke="#ffe7c4" stroke-width="2.4" stroke-opacity=".9"/></g>`,
    vignette('v', w, h, 0.1),
  ]);
}

export function saltDusk(w, h) {
  const hz = h * 0.52;
  const sky = [
    [0, '#2e3440'],
    [0.45, '#7d6a66'],
    [0.8, '#d39a6a'],
    [1, '#f1c28d'],
  ];
  return sceneDoc(w, h, [
    { def: linear('sky', sky), el: `<rect width="${w}" height="${hz}" fill="url(#sky)"/>` },
    { def: linear('mir', sky.map(([o, c]) => [1 - o, c]).reverse()), el: `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#mir)" opacity=".85"/>` },
    `<rect y="${hz}" width="${w}" height="${h - hz}" fill="#1c1a19" opacity=".35"/>`,
    glow('sun', { cx: w * 0.36, cy: hz - 6, rx: h * 0.5, ry: h * 0.24, color: '#ffd9a3', opacity: 0.85, core: 0.05 }),
    glow('sunr', { cx: w * 0.36, cy: hz + 10, rx: h * 0.12, ry: h * 0.32, color: '#ffd0a0', opacity: 0.45 }),
    `<rect y="${hz - 1}" width="${w}" height="3" fill="#2a2522" opacity=".9"/>`,
    `<g fill="#26211e">${[0.62, 0.66, 0.69, 0.715, 0.735, 0.752]
      .map((p, i) => {
        const x = w * p;
        const hh = 34 - i * 4;
        return `<path d="M ${r2(x - hh * 1.6)},${r2(hz + 1)} Q ${r2(x)},${r2(hz - hh * 1.5)} ${r2(x + hh * 1.6)},${r2(hz + 1)} Z"/>`;
      })
      .join('')}</g>`,
    figure(w * 0.52, hz + 1, 64, '#1b1816'),
    `<g opacity=".35">${figure(w * 0.52, hz + 1, -64, '#1b1816')}</g>`,
    vignette('v', w, h, 0.4),
  ]);
}

// ── Last Local ───────────────────────────────────────────────────────────────

export function localCarriage(w, h) {
  const rand = rng(21);
  const vx = w * 0.66;
  const vy = h * 0.47;
  const persp = (t) => 1 / (1 + t * 7); // 0 → near, 1 → far
  let windows = '';
  let lights = '';
  let handles = '';
  for (let i = 0; i < 9; i++) {
    const a = persp(i / 9);
    const b = persp((i + 0.72) / 9);
    const xA = vx + (0 - vx) * a;
    const xB = vx + (0 - vx) * b;
    const top = (x) => vy + ((h * 0.25 - vy) * (vx - x)) / vx;
    const bot = (x) => vy + ((h * 0.66 - vy) * (vx - x)) / vx;
    windows += `<polygon points="${r2(xA)},${r2(top(xA))} ${r2(xB)},${r2(top(xB))} ${r2(xB)},${r2(bot(xB))} ${r2(xA)},${r2(bot(xA))}" fill="url(#night)"/>`;
    for (let k = 0; k < 3; k++) {
      const yy = top(xA) + (bot(xA) - top(xA)) * (0.2 + rand() * 0.6);
      const len = (xB - xA) * (0.4 + rand() * 0.6);
      lights += `<line x1="${r2(xA + (xB - xA) * rand() * 0.3)}" y1="${r2(yy)}" x2="${r2(xA + len)}" y2="${r2(yy + (vy - yy) * 0.02)}" stroke="${rand() > 0.3 ? '#ff9a3c' : '#fff2dc'}" stroke-width="${r2(3 * a + 1)}" stroke-opacity="${r2(0.4 + rand() * 0.5)}" stroke-linecap="round"/>`;
    }
    const cx = vx + (w * 0.5 - vx) * a;
    const cy = vy + (h * 0.05 - vy) * a;
    lights += `<rect x="${r2(cx - 70 * a)}" y="${r2(cy - 6 * a)}" width="${r2(140 * a)}" height="${r2(12 * a + 1)}" rx="${r2(4 * a)}" fill="#eef4f2" fill-opacity=".92"/>`;
    for (const off of [-0.18, 0.12]) {
      const hx = vx + (w * (0.5 + off) - vx) * a;
      const hy = vy + (h * 0.12 - vy) * a;
      handles += `<line x1="${r2(hx)}" y1="${r2(hy)}" x2="${r2(hx)}" y2="${r2(hy + 70 * a)}" stroke="#2a2b2b" stroke-width="${r2(3 * a + 0.5)}"/><ellipse cx="${r2(hx)}" cy="${r2(hy + 82 * a)}" rx="${r2(10 * a)}" ry="${r2(13 * a)}" fill="none" stroke="#3a3b3a" stroke-width="${r2(4 * a + 0.5)}"/>`;
    }
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1d2222"/>`,
    { def: linear('wall', [[0, '#3c4241'], [1, '#202524']], { x2: 1, y2: 0 }), el: `<polygon points="0,0 ${vx},${vy} 0,${h}" fill="url(#wall)"/>` },
    { def: linear('ceil', [[0, '#5b605c'], [1, '#2a2e2d']]), el: `<polygon points="0,0 ${w},0 ${vx},${vy}" fill="url(#ceil)"/>` },
    `<polygon points="0,${h} ${w},${h} ${vx},${vy}" fill="#141716"/>`,
    `<polygon points="${w},0 ${w},${h} ${vx},${vy}" fill="#262b2a"/>`,
    { def: linear('night', [[0, '#0b0d10'], [1, '#17191c']]), el: windows },
    lights,
    handles,
    glow('spill', { cx: w * 0.5, cy: h * 0.1, rx: w * 0.5, ry: h * 0.35, color: '#e9f1ee', opacity: 0.14 }),
    // a passenger by the window, seen from behind
    `<g fill="#0c0d0d"><ellipse cx="${r2(w * 0.17)}" cy="${r2(h * 0.6)}" rx="${r2(h * 0.075)}" ry="${r2(h * 0.09)}"/><path d="M ${r2(w * 0.02)},${h} C ${r2(w * 0.03)},${r2(h * 0.78)} ${r2(w * 0.09)},${r2(h * 0.7)} ${r2(w * 0.17)},${r2(h * 0.69)} C ${r2(w * 0.25)},${r2(h * 0.7)} ${r2(w * 0.31)},${r2(h * 0.78)} ${r2(w * 0.32)},${h} Z"/></g>`,
    `<path d="M ${r2(w * 0.17 - h * 0.075)},${r2(h * 0.6)} A ${r2(h * 0.075)} ${r2(h * 0.09)} 0 0 1 ${r2(w * 0.17)},${r2(h * 0.51)}" fill="none" stroke="#ff9a3c" stroke-opacity=".55" stroke-width="3"/>`,
    vignette('v', w, h, 0.55),
  ]);
}

export function localBokeh(w, h) {
  const rand = rng(22);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0b0c0e"/>`,
    { def: blurFilter('bk', 6), el: `<g filter="url(#bk)">${bokeh(rand, 46, { x0: -100, x1: w * 0.75, y0: -50, y1: h + 50, rMin: 18, rMax: 150, colors: ['#ff9a3c', '#ffb25e', '#ffd9a0', '#f1f0ea', '#ff7a2a'] })}</g>` },
    profile(w * 0.82, h + 6, h * 0.95, '#050506', { flip: true }),
    `<g transform="translate(${r2(w * 0.82)} ${h + 6}) scale(${r2(-(h * 0.95) / 300)} ${r2((h * 0.95) / 300)})"><path d="M -10,-298 C 46,-302 82,-266 88,-226 L 92,-206 C 92,-198 88,-195 91,-189 L 112,-160 C 115,-155 111,-150 104,-150 L 101,-143 C 106,-140 106,-135 102,-132 C 106,-129 106,-124 101,-121 C 99,-113 103,-108 100,-102 C 94,-90 78,-88 66,-88" fill="none" stroke="#ff9a3c" stroke-width="3" stroke-opacity=".85"/></g>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function localPlatform(w, h) {
  const rand = rng(23);
  const vx = w * 0.42;
  const vy = h * 0.5;
  let lamps = '';
  for (let i = 0; i < 9; i++) {
    const a = 1 / (1 + i * 0.9);
    const x = vx + (w * -0.05 - vx) * a;
    const top = vy + (h * -0.1 - vy) * a;
    const base = vy + (h * 1.0 - vy) * a;
    lamps += `<line x1="${r2(x)}" y1="${r2(top)}" x2="${r2(x)}" y2="${r2(base)}" stroke="#121314" stroke-width="${r2(14 * a + 1)}"/>`;
    lamps += `<circle cx="${r2(x + 30 * a)}" cy="${r2(top + 10 * a)}" r="${r2(80 * a + 6)}" fill="url(#lamp)"/>`;
    lamps += `<circle cx="${r2(x + 30 * a)}" cy="${r2(top + 10 * a)}" r="${r2(7 * a + 1.5)}" fill="#ffe9c8"/>`;
  }
  let streaks = '';
  for (let i = 0; i < 26; i++) {
    const y = h * (0.38 + rand() * 0.3);
    streaks += `<line x1="${r2(w * (0.5 + rand() * 0.1))}" y1="${r2(y)}" x2="${r2(w * 1.05)}" y2="${r2(y + (y - vy) * 0.6)}" stroke="${rand() > 0.45 ? '#ffb36a' : '#fff6e8'}" stroke-opacity="${r2(0.15 + rand() * 0.55)}" stroke-width="${r2(1 + rand() * 4)}" stroke-linecap="round"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0e0f11"/>`,
    { def: linear('plat', [[0, '#16171a'], [1, '#2a2723']]), el: `<polygon points="${vx},${vy} ${r2(w * 0.52)},${h} ${-w * 0.2},${h} ${-w * 0.2},${r2(h * 0.86)}" fill="url(#plat)"/>` },
    `<line x1="${vx}" y1="${vy}" x2="${r2(w * 0.52)}" y2="${h}" stroke="#d8c39b" stroke-opacity=".5" stroke-width="5"/>`,
    { def: radial('lamp', [[0, '#ffb15e', 0.6], [0.4, '#ff9a3c', 0.18], [1, '#ff9a3c', 0]]), el: lamps },
    { def: blurFilter('mb', 2.5), el: `<g filter="url(#mb)">${streaks}</g>` },
    figure(w * 0.3, h * 0.73, 120, '#060607'),
    vignette('v', w, h, 0.5),
  ]);
}

export function localWindow(w, h) {
  const rand = rng(24);
  let drops = '';
  for (let i = 0; i < 160; i++) {
    const r = 3 + Math.pow(rand(), 2.4) * 26;
    const x = rand() * w;
    const y = rand() * h;
    drops += `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(r * 0.9)}" ry="${r2(r)}" fill="#0c0d10" fill-opacity=".5" stroke="#ffcf96" stroke-opacity=".25" stroke-width="1.2"/><circle cx="${r2(x - r * 0.3)}" cy="${r2(y - r * 0.35)}" r="${r2(r * 0.18)}" fill="#fff4e2" fill-opacity=".7"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0d0e11"/>`,
    { def: blurFilter('bk', 14), el: `<g filter="url(#bk)">${bokeh(rng(4), 30, { x0: 0, x1: w, y0: 0, y1: h, rMin: 40, rMax: 180, colors: ['#ff9a3c', '#ffbe7a', '#e9e4da', '#ff7b32'], opacity: [0.15, 0.55] })}</g>` },
    drops,
    rain(rand, 40, { w, h, angle: 4, len: [80, 240], color: '#ffd8a8', opacity: [0.05, 0.18], width: 2 }),
    vignette('v', w, h, 0.45),
  ]);
}

// ── Warp & Weft ──────────────────────────────────────────────────────────────

const WEFT = ['#9e3326', '#efe6d4', '#23305a', '#d9a032', '#7a2a20', '#e8dcc4'];

function threads(rand, w, h, { bands = 14, per = 22 } = {}) {
  let s = '';
  const total = bands * per;
  for (let i = 0; i < total; i++) {
    const band = Math.floor(i / per);
    const c = WEFT[(band * 7 + (band % 3)) % WEFT.length];
    const x = (i / total) * (w + 40) - 20 + (rand() - 0.5) * 3;
    s += `<line x1="${r2(x)}" y1="-10" x2="${r2(x + (rand() - 0.5) * 6)}" y2="${h + 10}" stroke="${c}" stroke-width="${r2(2.2 + rand() * 2.4)}" stroke-opacity="${r2(0.75 + rand() * 0.25)}"/>`;
  }
  return s;
}

export function weftThreads(w, h) {
  const t = threads(rng(31), w, h);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#2a1712"/>`,
    { def: blurFilter('dof', 9), el: `<g filter="url(#dof)">${t}</g>` },
    {
      def: linear('focus', [[0, '#fff', 0], [0.4, '#fff', 1], [0.62, '#fff', 1], [0.9, '#fff', 0]]) + `<mask id="fm"><rect width="${w}" height="${h}" fill="url(#focus)"/></mask>`,
      el: `<g mask="url(#fm)">${t}</g>`,
    },
    `<rect x="-20" y="${r2(h * 0.56)}" width="${w + 40}" height="${r2(h * 0.03)}" fill="#d9a032" opacity=".92"/>`,
    `<rect x="-20" y="${r2(h * 0.56)}" width="${w + 40}" height="4" fill="#fff1cf" opacity=".7"/>`,
    { def: linear('side', [[0, '#000', 0.55], [0.5, '#000', 0], [1, '#ffd29a', 0.18]], { x2: 1, y2: 0 }), el: `<rect width="${w}" height="${h}" fill="url(#side)"/>` },
    vignette('v', w, h, 0.4),
  ]);
}

export function weftLoom(w, h) {
  const t = threads(rng(32), w * 0.42, h * 0.5, { bands: 8, per: 14 });
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#17110e"/>`,
    `<rect x="${r2(w * 0.06)}" y="${r2(h * 0.14)}" width="${r2(w * 0.17)}" height="${r2(h * 0.46)}" fill="#f3e3c4"/>`,
    `<g fill="#17110e"><rect x="${r2(w * 0.142)}" y="${r2(h * 0.14)}" width="${r2(w * 0.008)}" height="${r2(h * 0.46)}"/><rect x="${r2(w * 0.06)}" y="${r2(h * 0.36)}" width="${r2(w * 0.17)}" height="${r2(h * 0.012)}"/></g>`,
    { def: linear('beam', [[0, '#ffe2b0', 0.42], [1, '#ffe2b0', 0]], { x2: 1, y2: 0.6 }), el: `<polygon points="${r2(w * 0.23)},${r2(h * 0.14)} ${r2(w * 0.23)},${r2(h * 0.6)} ${r2(w * 0.86)},${r2(h * 1.0)} ${r2(w * 0.95)},${r2(h * 0.56)}" fill="url(#beam)"/>` },
    `<g transform="translate(${r2(w * 0.42)} ${r2(h * 0.3)})" opacity=".9">${t}</g>`,
    `<g fill="#0d0907"><rect x="${r2(w * 0.4)}" y="${r2(h * 0.22)}" width="${r2(w * 0.02)}" height="${r2(h * 0.7)}"/><rect x="${r2(w * 0.84)}" y="${r2(h * 0.22)}" width="${r2(w * 0.02)}" height="${r2(h * 0.7)}"/><rect x="${r2(w * 0.39)}" y="${r2(h * 0.22)}" width="${r2(w * 0.48)}" height="${r2(h * 0.04)}"/><rect x="${r2(w * 0.39)}" y="${r2(h * 0.78)}" width="${r2(w * 0.48)}" height="${r2(h * 0.05)}"/><rect x="${r2(w * 0.39)}" y="${r2(h * 0.53)}" width="${r2(w * 0.48)}" height="${r2(h * 0.025)}"/></g>`,
    `<rect x="0" y="${r2(h * 0.9)}" width="${w}" height="${r2(h * 0.1)}" fill="#0f0b09"/>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function weftStacks(w, h) {
  const rand = rng(33);
  let s = '';
  const n = 13;
  const bh = h / n;
  for (let i = 0; i < n; i++) {
    const c = WEFT[(i * 5 + 1) % WEFT.length];
    const y = i * bh;
    const inset = (rand() - 0.5) * w * 0.05;
    s += `<path d="M ${r2(-40 + inset)},${r2(y + 3)} L ${r2(w * 0.86 + inset)},${r2(y + 3)} Q ${r2(w * 0.86 + inset + bh * 0.62)},${r2(y + bh / 2)} ${r2(w * 0.86 + inset)},${r2(y + bh - 2)} L ${r2(-40 + inset)},${r2(y + bh - 2)} Z" fill="${c}"/>`;
    s += `<path d="M ${r2(w * 0.86 + inset)},${r2(y + 4)} Q ${r2(w * 0.86 + inset + bh * 0.6)},${r2(y + bh / 2)} ${r2(w * 0.86 + inset)},${r2(y + bh - 3)}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="${r2(bh * 0.18)}"/>`;
    s += `<rect x="-40" y="${r2(y + bh - 6)}" width="${w}" height="5" fill="#000" opacity=".3"/>`;
    s += `<rect x="-40" y="${r2(y + bh * 0.3)}" width="${r2(w * 0.86 + inset + 40)}" height="2" fill="#fff" opacity=".12"/>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1a110d"/>`,
    s,
    { def: linear('light', [[0, '#ffe0aa', 0.25], [0.5, '#000', 0], [1, '#000', 0.5]]), el: `<rect width="${w}" height="${h}" fill="url(#light)"/>` },
    vignette('v', w, h, 0.45),
  ]);
}

export function weftSpools(w, h) {
  const rand = rng(34);
  let s = '';
  const rows = 4;
  const cols = 9;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const R = h / rows / 2.3;
      const cx = (c + 0.5 + (r % 2) * 0.5) * (w / cols) - w * 0.04;
      const cy = (r + 0.55) * (h / rows);
      const col = WEFT[Math.floor(rand() * WEFT.length)];
      s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="${col}"/>`;
      for (let k = 1; k < 6; k++) s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R * (1 - k * 0.12))}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`;
      s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R * 0.22)}" fill="#1a110d"/>`;
      s += `<path d="M ${r2(cx - R * 0.7)},${r2(cy - R * 0.5)} A ${r2(R)} ${r2(R)} 0 0 1 ${r2(cx + R * 0.4)},${r2(cy - R * 0.85)}" fill="none" stroke="#fff6e4" stroke-opacity=".35" stroke-width="4"/>`;
    }
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#140d0a"/>`,
    { def: blurFilter('dof', 7), el: `<g filter="url(#dof)">${s}</g>` },
    { def: linear('f', [[0, '#fff', 0], [0.42, '#fff', 1], [0.6, '#fff', 1], [0.8, '#fff', 0]]) + `<mask id="m"><rect width="${w}" height="${h}" fill="url(#f)"/></mask>`, el: `<g mask="url(#m)">${s}</g>` },
    vignette('v', w, h, 0.5),
  ]);
}

// ── Monsoon Letters ──────────────────────────────────────────────────────────

export function monsoonWindow(w, h) {
  const rand = rng(41);
  const wx = w * 0.14;
  const wy = h * 0.12;
  const ww = w * 0.44;
  const wh = h * 0.62;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#151a1d"/>`,
    { def: linear('out', [[0, '#9fb0b8'], [1, '#c9d2d5']]), el: `<rect x="${r2(wx)}" y="${r2(wy)}" width="${r2(ww)}" height="${r2(wh)}" fill="url(#out)"/>` },
    `<g clip-path="url(#win)">${rain(rand, 260, { w: w, h: h, angle: 9, len: [20, 70], color: '#eef3f4', opacity: [0.15, 0.5], width: 1.6 })}</g>`,
    { def: `<clipPath id="win"><rect x="${r2(wx)}" y="${r2(wy)}" width="${r2(ww)}" height="${r2(wh)}"/></clipPath>`, el: '' },
    `<g fill="#11161a"><rect x="${r2(wx + ww / 2 - 6)}" y="${r2(wy)}" width="12" height="${r2(wh)}"/><rect x="${r2(wx)}" y="${r2(wy + wh * 0.42)}" width="${r2(ww)}" height="12"/><rect x="${r2(wx - 14)}" y="${r2(wy - 14)}" width="${r2(ww + 28)}" height="14"/><rect x="${r2(wx - 30)}" y="${r2(wy + wh)}" width="${r2(ww + 60)}" height="22"/></g>`,
    glow('lamp', { cx: w * 0.8, cy: h * 0.6, rx: w * 0.34, ry: h * 0.46, color: '#ffb46b', opacity: 0.55, core: 0.06 }),
    `<polygon points="${r2(w * 0.75)},${r2(h * 0.48)} ${r2(w * 0.85)},${r2(h * 0.48)} ${r2(w * 0.88)},${r2(h * 0.6)} ${r2(w * 0.72)},${r2(h * 0.6)}" fill="#f2c48a"/>`,
    `<rect x="${r2(w * 0.795)}" y="${r2(h * 0.6)}" width="8" height="${r2(h * 0.14)}" fill="#1b1512"/>`,
    `<rect x="0" y="${r2(h * 0.74)}" width="${w}" height="${r2(h * 0.26)}" fill="#120f0d"/>`,
    // the reader, silhouetted against the window, a letter catching the lamp
    `<g fill="#090b0c"><ellipse cx="${r2(w * 0.5)}" cy="${r2(h * 0.47)}" rx="${r2(h * 0.07)}" ry="${r2(h * 0.085)}"/><path d="M ${r2(w * 0.38)},${r2(h * 0.78)} C ${r2(w * 0.39)},${r2(h * 0.62)} ${r2(w * 0.44)},${r2(h * 0.55)} ${r2(w * 0.5)},${r2(h * 0.555)} C ${r2(w * 0.57)},${r2(h * 0.55)} ${r2(w * 0.61)},${r2(h * 0.62)} ${r2(w * 0.62)},${r2(h * 0.78)} Z"/></g>`,
    `<polygon points="${r2(w * 0.55)},${r2(h * 0.63)} ${r2(w * 0.63)},${r2(h * 0.61)} ${r2(w * 0.645)},${r2(h * 0.7)} ${r2(w * 0.565)},${r2(h * 0.72)}" fill="#f6dfba"/>`,
    `<path d="M ${r2(w * 0.5 + h * 0.07)},${r2(h * 0.45)} A ${r2(h * 0.07)} ${r2(h * 0.085)} 0 0 1 ${r2(w * 0.5 + h * 0.03)},${r2(h * 0.545)}" fill="none" stroke="#ffb46b" stroke-opacity=".7" stroke-width="3"/>`,
    vignette('v', w, h, 0.45),
  ]);
}

export function monsoonEnvelopes(w, h) {
  const rand = rng(42);
  let s = '';
  for (let i = 0; i < 9; i++) {
    const cx = w * (0.18 + rand() * 0.64);
    const cy = h * (0.2 + rand() * 0.6);
    const ew = w * 0.3;
    const eh = ew * 0.56;
    const rot = (rand() - 0.5) * 38;
    const tone = ['#efe5d1', '#e6d9bf', '#f3ecdd', '#dccdb0'][i % 4];
    s += `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(rot)})"><rect x="${r2(-ew / 2 + 10)}" y="${r2(-eh / 2 + 14)}" width="${r2(ew)}" height="${r2(eh)}" fill="#000" opacity=".35"/><rect x="${r2(-ew / 2)}" y="${r2(-eh / 2)}" width="${r2(ew)}" height="${r2(eh)}" fill="${tone}"/><path d="M ${r2(-ew / 2)},${r2(-eh / 2)} L 0,${r2(eh * 0.08)} L ${r2(ew / 2)},${r2(-eh / 2)}" fill="none" stroke="#b9a989" stroke-width="2"/><rect x="${r2(ew / 2 - ew * 0.2)}" y="${r2(-eh / 2 + eh * 0.1)}" width="${r2(ew * 0.13)}" height="${r2(ew * 0.16)}" fill="${['#7d2e25', '#2f4a5a', '#8c6a2a'][i % 3]}" opacity=".85"/><circle cx="${r2(ew / 2 - ew * 0.24)}" cy="${r2(-eh / 2 + eh * 0.3)}" r="${r2(ew * 0.09)}" fill="none" stroke="#3a3a3a" stroke-opacity=".5" stroke-width="2.5"/><g stroke="#4a4038" stroke-opacity=".45" stroke-width="3">${[0, 1, 2]
      .map((k) => `<line x1="${r2(-ew * 0.2)}" y1="${r2(eh * 0.05 + k * eh * 0.11)}" x2="${r2(ew * 0.18)}" y2="${r2(eh * 0.05 + k * eh * 0.11)}"/>`)
      .join('')}</g></g>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#241913"/>`,
    s,
    glow('lamp', { cx: w * 0.62, cy: h * 0.3, rx: w * 0.62, ry: h * 0.7, color: '#ffb46b', opacity: 0.32 }),
    vignette('v', w, h, 0.62),
  ]);
}

export function monsoonUmbrellas(w, h) {
  const rand = rng(43);
  let s = '';
  for (let i = 0; i < 7; i++) s += `<rect x="${r2(w * 0.08 + i * w * 0.12)}" y="${r2(h * 0.58)}" width="${r2(w * 0.07)}" height="${r2(h * 0.2)}" fill="#c9c9c2" opacity="${r2(0.25 + rand() * 0.25)}"/>`;
  const ums = [
    [0.22, 0.32, 0.13, '#101214'],
    [0.47, 0.5, 0.11, '#141618'],
    [0.66, 0.26, 0.12, '#7d2e25'],
    [0.8, 0.66, 0.1, '#0f1113'],
    [0.33, 0.78, 0.09, '#121416'],
  ];
  for (const [px, py, pr, c] of ums) {
    const cx = w * px;
    const cy = h * py;
    const R = w * pr;
    s += `<ellipse cx="${r2(cx + R * 0.15)}" cy="${r2(cy + R * 0.2)}" rx="${r2(R)}" ry="${r2(R)}" fill="#000" opacity=".35"/>`;
    let poly = '';
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      poly += `${r2(cx + Math.cos(a) * R)},${r2(cy + Math.sin(a) * R)} `;
    }
    s += `<polygon points="${poly}" fill="${c}"/>`;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      s += `<line x1="${r2(cx)}" y1="${r2(cy)}" x2="${r2(cx + Math.cos(a) * R)}" y2="${r2(cy + Math.sin(a) * R)}" stroke="#ffffff" stroke-opacity=".08" stroke-width="2"/>`;
    }
    s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="5" fill="#d9d4c9"/>`;
  }
  let ripples = '';
  for (let i = 0; i < 70; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 6 + rand() * 26;
    ripples += `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(r)}" ry="${r2(r * 0.6)}" fill="none" stroke="#dfe6e8" stroke-opacity="${r2(0.05 + rand() * 0.12)}" stroke-width="1.5"/>`;
  }
  return sceneDoc(w, h, [
    { def: linear('road', [[0, '#3a4246'], [1, '#262c2f']]), el: `<rect width="${w}" height="${h}" fill="url(#road)"/>` },
    glow('ref', { cx: w * 0.55, cy: h * 0.15, rx: w * 0.25, ry: h * 0.6, color: '#ffb46b', opacity: 0.2 }),
    ripples,
    s,
    vignette('v', w, h, 0.45),
  ]);
}

export function monsoonDoor(w, h) {
  const rand = rng(44);
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1c2226"/>`,
    { def: linear('lane', [[0, '#2b3337'], [1, '#14181a']]), el: `<polygon points="0,0 ${r2(w * 0.4)},${r2(h * 0.2)} ${r2(w * 0.4)},${r2(h * 0.75)} 0,${h}" fill="url(#lane)"/><polygon points="${w},0 ${r2(w * 0.6)},${r2(h * 0.2)} ${r2(w * 0.6)},${r2(h * 0.75)} ${w},${h}" fill="url(#lane)"/>` },
    `<rect x="${r2(w * 0.4)}" y="${r2(h * 0.2)}" width="${r2(w * 0.2)}" height="${r2(h * 0.55)}" fill="#20272a"/>`,
    `<rect x="${r2(w * 0.455)}" y="${r2(h * 0.36)}" width="${r2(w * 0.09)}" height="${r2(h * 0.39)}" fill="#ffc98d"/>`,
    glow('door', { cx: w * 0.5, cy: h * 0.6, rx: w * 0.18, ry: h * 0.3, color: '#ffb46b', opacity: 0.5 }),
    { def: linear('wet', [[0, '#ffb46b', 0.45], [1, '#ffb46b', 0]]), el: `<polygon points="${r2(w * 0.455)},${r2(h * 0.75)} ${r2(w * 0.545)},${r2(h * 0.75)} ${r2(w * 0.62)},${h} ${r2(w * 0.38)},${h}" fill="url(#wet)"/>` },
    `<g><rect x="${r2(w * 0.66)}" y="${r2(h * 0.48)}" width="${r2(w * 0.05)}" height="${r2(h * 0.3)}" rx="${r2(w * 0.012)}" fill="#5e2620"/><rect x="${r2(w * 0.667)}" y="${r2(h * 0.53)}" width="${r2(w * 0.036)}" height="${r2(h * 0.012)}" fill="#1a0f0d"/></g>`,
    rain(rand, 220, { w, h, angle: 7, len: [30, 90], color: '#dfe6e8', opacity: [0.06, 0.3], width: 1.5 }),
    vignette('v', w, h, 0.5),
  ]);
}

// ── First Light ──────────────────────────────────────────────────────────────

export function lightHills(w, h) {
  const rand = rng(51);
  const layers = [
    ['#d9c9bb', 0.5, 0.05],
    ['#b8a5a0', 0.58, 0.06],
    ['#8b7d7f', 0.67, 0.07],
    ['#5a5257', 0.78, 0.08],
    ['#2c282c', 0.9, 0.08],
  ];
  const parts = [
    skyRect('sky', w, h, [
      [0, '#a99c9e'],
      [0.35, '#e2c3a1'],
      [0.55, '#f6dcb6'],
      [1, '#f6dcb6'],
    ]),
    glow('sun', { cx: w * 0.62, cy: h * 0.5, rx: h * 0.5, ry: h * 0.42, color: '#fff2d8', opacity: 0.95, core: 0.08 }),
    `<circle cx="${r2(w * 0.62)}" cy="${r2(h * 0.49)}" r="${r2(h * 0.05)}" fill="#fffaf0"/>`,
  ];
  layers.forEach(([c, base, amp], i) => {
    parts.push(ridge(rand, { w, h, base: h * base, amp: h * amp, fill: c }));
    if (i < layers.length - 1) {
      parts.push(`<rect x="-50" y="${r2(h * (base + 0.03))}" width="${w + 100}" height="${r2(h * 0.05)}" fill="#fbf1e2" opacity=".45" filter="url(#mist)"/>`);
    }
  });
  parts.push({ def: blurFilter('mist', 18), el: '' });
  parts.push(vignette('v', w, h, 0.22));
  return sceneDoc(w, h, parts);
}

export function lightSteam(w, h) {
  const rand = rng(52);
  let steam = '';
  for (let i = 0; i < 7; i++) {
    const x0 = w * 0.5 + (rand() - 0.5) * 40;
    let d = `M ${r2(x0)},${r2(h * 0.6)}`;
    let x = x0;
    for (let k = 1; k <= 5; k++) {
      const y = h * 0.6 - k * h * 0.1;
      const nx = x + (rand() - 0.5) * 120;
      d += ` Q ${r2(x + (rand() - 0.5) * 120)},${r2(y + h * 0.05)} ${r2(nx)},${r2(y)}`;
      x = nx;
    }
    steam += `<path d="${d}" fill="none" stroke="#fffaf0" stroke-opacity="${r2(0.2 + rand() * 0.3)}" stroke-width="${r2(6 + rand() * 14)}" stroke-linecap="round"/>`;
  }
  return sceneDoc(w, h, [
    skyRect('win', w, h, [
      [0, '#f3e1c4'],
      [0.6, '#f8e8cc'],
      [0.7, '#c9a27a'],
      [1, '#5c4330'],
    ]),
    glow('sun', { cx: w * 0.3, cy: h * 0.35, rx: w * 0.4, ry: h * 0.6, color: '#fff6e4', opacity: 0.9 }),
    `<g fill="#3b2a20"><rect x="${r2(w * 0.08)}" y="0" width="${r2(w * 0.02)}" height="${r2(h * 0.7)}"/><rect x="${r2(w * 0.9)}" y="0" width="${r2(w * 0.02)}" height="${r2(h * 0.7)}"/><rect x="0" y="${r2(h * 0.68)}" width="${w}" height="${r2(h * 0.32)}"/></g>`,
    { def: blurFilter('st', 10), el: `<g filter="url(#st)">${steam}</g>` },
    `<g fill="#241812"><path d="M ${r2(w * 0.455)},${r2(h * 0.58)} L ${r2(w * 0.545)},${r2(h * 0.58)} L ${r2(w * 0.538)},${r2(h * 0.7)} Q ${r2(w * 0.5)},${r2(h * 0.715)} ${r2(w * 0.462)},${r2(h * 0.7)} Z"/><path d="M ${r2(w * 0.543)},${r2(h * 0.6)} C ${r2(w * 0.575)},${r2(h * 0.6)} ${r2(w * 0.575)},${r2(h * 0.67)} ${r2(w * 0.54)},${r2(h * 0.67)}" fill="none" stroke="#241812" stroke-width="9"/></g>`,
    `<ellipse cx="${r2(w * 0.5)}" cy="${r2(h * 0.58)}" rx="${r2(w * 0.045)}" ry="${r2(h * 0.012)}" fill="#6b4a33"/>`,
    vignette('v', w, h, 0.3),
  ]);
}

export function lightRoaster(w, h) {
  const rand = rng(53);
  let dust = '';
  for (let i = 0; i < 120; i++) dust += `<circle cx="${r2(w * (0.3 + rand() * 0.5))}" cy="${r2(h * rand() * 0.8)}" r="${r2(0.8 + rand() * 2.2)}" fill="#ffe6c0" fill-opacity="${r2(0.15 + rand() * 0.5)}"/>`;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#140e0b"/>`,
    `<rect x="${r2(w * 0.7)}" y="${r2(h * 0.04)}" width="${r2(w * 0.12)}" height="${r2(h * 0.22)}" fill="#f5dcb2"/>`,
    { def: linear('beam', [[0, '#ffdcaa', 0.35], [1, '#ffdcaa', 0]], { x1: 1, y1: 0, x2: 0.2, y2: 1 }), el: `<polygon points="${r2(w * 0.7)},${r2(h * 0.04)} ${r2(w * 0.82)},${r2(h * 0.04)} ${r2(w * 0.55)},${h} ${r2(w * 0.22)},${h}" fill="url(#beam)"/>` },
    dust,
    `<g fill="#0b0807"><rect x="${r2(w * 0.24)}" y="${r2(h * 0.36)}" width="${r2(w * 0.24)}" height="${r2(h * 0.34)}" rx="${r2(h * 0.17)}"/><polygon points="${r2(w * 0.3)},${r2(h * 0.36)} ${r2(w * 0.33)},${r2(h * 0.18)} ${r2(w * 0.4)},${r2(h * 0.18)} ${r2(w * 0.42)},${r2(h * 0.36)}"/><rect x="${r2(w * 0.27)}" y="${r2(h * 0.7)}" width="${r2(w * 0.02)}" height="${r2(h * 0.2)}"/><rect x="${r2(w * 0.43)}" y="${r2(h * 0.7)}" width="${r2(w * 0.02)}" height="${r2(h * 0.2)}"/><ellipse cx="${r2(w * 0.53)}" cy="${r2(h * 0.74)}" rx="${r2(w * 0.09)}" ry="${r2(h * 0.05)}"/></g>`,
    `<circle cx="${r2(w * 0.36)}" cy="${r2(h * 0.53)}" r="${r2(h * 0.07)}" fill="#ff8c3a"/>`,
    `<circle cx="${r2(w * 0.36)}" cy="${r2(h * 0.53)}" r="${r2(h * 0.045)}" fill="#ffd08f"/>`,
    glow('fire', { cx: w * 0.36, cy: h * 0.53, rx: h * 0.32, ry: h * 0.3, color: '#ff9a3c', opacity: 0.5 }),
    `<g fill="#1e1511">${[0.06, 0.15, 0.82, 0.9].map((p) => `<rect x="${r2(w * p - w * 0.05)}" y="${r2(h * 0.78)}" width="${r2(w * 0.1)}" height="${r2(h * 0.24)}" rx="${r2(h * 0.05)}"/>`).join('')}</g>`,
    vignette('v', w, h, 0.5),
  ]);
}

export function lightBeans(w, h) {
  const rand = rng(54);
  let s = '';
  const beans = [];
  for (let i = 0; i < 140; i++) beans.push([rand() * w, rand() * h, 24 + rand() * 22, rand() * 180]);
  beans.sort((a, b) => a[1] - b[1]);
  for (const [x, y, r, rot] of beans) {
    s += `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})"><ellipse cx="4" cy="6" rx="${r2(r)}" ry="${r2(r * 0.7)}" fill="#000" opacity=".4"/><ellipse rx="${r2(r)}" ry="${r2(r * 0.7)}" fill="url(#bean)"/><path d="M ${r2(-r * 0.85)},0 C ${r2(-r * 0.3)},${r2(-r * 0.18)} ${r2(r * 0.3)},${r2(r * 0.18)} ${r2(r * 0.85)},0" fill="none" stroke="#140b07" stroke-width="${r2(r * 0.12)}"/><ellipse cx="${r2(-r * 0.35)}" cy="${r2(-r * 0.32)}" rx="${r2(r * 0.32)}" ry="${r2(r * 0.12)}" fill="#ffd9a8" opacity=".35"/></g>`;
  }
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1f130c"/>`,
    { def: radial('bean', [[0, '#7a4c30'], [0.7, '#4a2c1c'], [1, '#2a170d']], { cx: 0.35, cy: 0.3, r: 0.8 }), el: '' },
    { def: blurFilter('dof', 6), el: `<g filter="url(#dof)">${s}</g>` },
    { def: linear('f', [[0, '#fff', 0], [0.45, '#fff', 1], [0.75, '#fff', 1], [1, '#fff', 0.6]]) + `<mask id="m"><rect width="${w}" height="${h}" fill="url(#f)"/></mask>`, el: `<g mask="url(#m)">${s}</g>` },
    glow('key', { cx: -w * 0.05, cy: h * 0.2, rx: w * 0.7, ry: h * 0.7, color: '#ffbf7a', opacity: 0.3 }),
    vignette('v', w, h, 0.55),
  ]);
}

// ── Tungsten ─────────────────────────────────────────────────────────────────

const BULB = 'M 0,-120 C 40,-120 70,-90 70,-48 C 70,-14 46,8 34,34 L 30,60 L -30,60 L -34,34 C -46,8 -70,-14 -70,-48 C -70,-90 -40,-120 0,-120 Z';

function bulb(cx, cy, s, { filament = '#fff4d6', glass = '#ffd79a', glassOpacity = 0.55 } = {}) {
  return `<g transform="translate(${r2(cx)} ${r2(cy)}) scale(${s})"><path d="${BULB}" fill="${glass}" fill-opacity="${glassOpacity}"/><path d="M -22,40 L -14,-40 L -6,-20 L 0,-44 L 6,-20 L 14,-40 L 22,40" fill="none" stroke="${filament}" stroke-width="3.2" stroke-linejoin="round"/><rect x="-32" y="58" width="64" height="44" rx="6" fill="#2a241e"/><g stroke="#4a4036" stroke-width="3">${[66, 76, 86, 96].map((y) => `<line x1="-32" y1="${y}" x2="32" y2="${y}"/>`).join('')}</g></g>`;
}

export function tungstenBulb(w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#0b0907"/>`,
    glow('wall', { cx, cy, rx: w * 0.62, ry: h * 0.62, color: '#6b3d1a', opacity: 0.55 }),
    glow('halo', { cx, cy: cy - 30, rx: h * 0.34, ry: h * 0.34, color: '#ffcf8f', opacity: 0.9, core: 0.05 }),
    `<line x1="${cx}" y1="0" x2="${cx}" y2="${r2(cy - h * 0.2)}" stroke="#1a1410" stroke-width="5"/>`,
    bulb(cx, cy - h * 0.02, h / 620),
    glow('core', { cx, cy: cy - h * 0.06, rx: h * 0.07, ry: h * 0.09, color: '#fffaf0', opacity: 0.95 }),
    vignette('v', w, h, 0.6),
  ]);
}

export function tungstenProfile(w, h) {
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#090706"/>`,
    glow('spill', { cx: w * 0.15, cy: h * 0.3, rx: w * 0.6, ry: h * 0.6, color: '#7a4520', opacity: 0.4 }),
    // the profile is mirrored, so the warm end of the ramp lands on the face
    { def: linear('face', [[0, '#090605'], [0.45, '#1a0f08'], [0.8, '#8a4f24'], [1, '#e6a160']], { x2: 1, y2: 0 }), el: '' },
    profile(w * 0.56, h + 6, h * 0.98, 'url(#face)', { flip: true }),
    vignette('v', w, h, 0.55),
  ]);
}

export function tungstenCold(w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#040303"/>`,
    glow('ember', { cx, cy: cy - 20, rx: h * 0.14, ry: h * 0.14, color: '#ff5a1f', opacity: 0.35 }),
    `<g opacity=".9">${bulb(cx, cy, h / 620, { filament: '#ff6a2a', glass: '#3a1a0c', glassOpacity: 0.5 })}</g>`,
    vignette('v', w, h, 0.7),
  ]);
}

export function tungstenRoom(w, h) {
  return sceneDoc(w, h, [
    `<rect width="${w}" height="${h}" fill="#1a110b"/>`,
    { def: linear('wl', [[0, '#5a3a22'], [1, '#2a1a10']], { x2: 1, y2: 0 }), el: `<polygon points="0,0 ${r2(w * 0.58)},0 ${r2(w * 0.58)},${r2(h * 0.72)} 0,${r2(h * 0.86)}" fill="url(#wl)"/>` },
    { def: linear('wr', [[0, '#7a5030'], [1, '#3a2414']], { x2: 1, y2: 0 }), el: `<polygon points="${r2(w * 0.58)},0 ${w},0 ${w},${r2(h * 0.8)} ${r2(w * 0.58)},${r2(h * 0.72)}" fill="url(#wr)"/>` },
    `<polygon points="0,${r2(h * 0.86)} ${r2(w * 0.58)},${r2(h * 0.72)} ${w},${r2(h * 0.8)} ${w},${h} 0,${h}" fill="#24170e"/>`,
    glow('pool', { cx: w * 0.5, cy: h * 0.84, rx: w * 0.36, ry: h * 0.12, color: '#ffb46b', opacity: 0.4 }),
    glow('lamp', { cx: w * 0.5, cy: h * 0.18, rx: h * 0.3, ry: h * 0.3, color: '#ffcf8f', opacity: 0.75 }),
    `<line x1="${r2(w * 0.5)}" y1="0" x2="${r2(w * 0.5)}" y2="${r2(h * 0.1)}" stroke="#120c08" stroke-width="4"/>`,
    bulb(w * 0.5, h * 0.17, h / 1600),
    // a wooden chair and its long shadow
    `<polygon points="${r2(w * 0.43)},${r2(h * 0.86)} ${r2(w * 0.53)},${r2(h * 0.86)} ${r2(w * 0.8)},${r2(h * 0.98)} ${r2(w * 0.62)},${r2(h * 0.99)}" fill="#0c0805" opacity=".55"/>`,
    `<g fill="#120b06"><rect x="${r2(w * 0.43)}" y="${r2(h * 0.48)}" width="${r2(w * 0.016)}" height="${r2(h * 0.38)}"/><rect x="${r2(w * 0.515)}" y="${r2(h * 0.48)}" width="${r2(w * 0.016)}" height="${r2(h * 0.38)}"/><rect x="${r2(w * 0.425)}" y="${r2(h * 0.64)}" width="${r2(w * 0.11)}" height="${r2(h * 0.025)}"/><rect x="${r2(w * 0.43)}" y="${r2(h * 0.5)}" width="${r2(w * 0.1)}" height="${r2(h * 0.012)}"/><rect x="${r2(w * 0.43)}" y="${r2(h * 0.56)}" width="${r2(w * 0.1)}" height="${r2(h * 0.012)}"/></g>`,
    vignette('v', w, h, 0.5),
  ]);
}

// shared with scenes-2.mjs (the second program of sample films)
export { figure, profile, skyRect, vignette, bokeh, rain, ridge, sceneDoc, bulb };
