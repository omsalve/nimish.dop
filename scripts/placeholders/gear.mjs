// Parametric drawings of studio gear, used for the hero "set" and the
// behind-the-scenes placeholders. Each function draws in local units with the
// origin on the floor under the object, and returns { defs, el }.

import { linear, radial, r2 } from './lib.mjs';

const BODY = (id, top = '#383834', bottom = '#121211') =>
  linear(id, [
    [0, top],
    [0.55, '#1f1f1d'],
    [1, bottom],
  ]);

const line = (x1, y1, x2, y2, w, c, extra = '') =>
  `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
const rect = (x, y, w, h, fill, rx = 0, extra = '') =>
  `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${rx}" fill="${fill}"${extra}/>`;
const lerp = (a, b, t) => a + (b - a) * t;

/** Twin-tube tripod/stand leg with a single lower section. */
function leg(top, mid, foot, { twin = true, w = 9, c = '#232321' } = {}) {
  let s = '';
  if (twin) {
    const dx = mid[0] - top[0];
    const dy = mid[1] - top[1];
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * 5.5;
    const ny = (dx / len) * 5.5;
    s += line(top[0] + nx, top[1] + ny, mid[0] + nx, mid[1] + ny, w * 0.8, c);
    s += line(top[0] - nx, top[1] - ny, mid[0] - nx, mid[1] - ny, w * 0.8, c);
  } else {
    s += line(top[0], top[1], mid[0], mid[1], w, c);
  }
  s += line(mid[0], mid[1], foot[0], foot[1], w * 0.78, c);
  s += `<ellipse cx="${r2(foot[0])}" cy="${r2(foot[1] + 2)}" rx="${w * 1.3}" ry="${w * 0.55}" fill="#0f0f0e"/>`;
  return s;
}

/** A 2K tungsten fresnel on a baby stand, barn doors open, pointing right. */
export function fresnelStand({ id, x, y, s = 1, tilt = 9, glowOn = true }) {
  const defs = [
    BODY(`${id}-body`, '#3d3d39', '#131312'),
    radial(`${id}-lens`, [
      [0, '#fffaf0'],
      [0.35, '#ffe2b4'],
      [0.75, '#ffb768'],
      [1, '#d9772c'],
    ]),
    radial(`${id}-spill`, [
      [0, '#ffd6a1', 0.85],
      [0.5, '#ffbf7a', 0.25],
      [1, '#ffb066', 0],
    ]),
    linear(`${id}-col`, [
      [0, '#2a2a28'],
      [0.45, '#4a4a46'],
      [1, '#1b1b1a'],
    ], { x1: 0, y1: 0, x2: 1, y2: 0 }),
  ].join('');

  const legC = '#20201e';
  const back = leg([2, -178], [20, -110], [44, -40], { twin: false, w: 7, c: '#3a3a37' });
  const fl = leg([-6, -176], [-80, -96], [-160, 0], { twin: false, w: 10, c: legC });
  const fr = leg([6, -176], [90, -96], [174, -4], { twin: false, w: 10, c: legC });
  const braces =
    line(0, -126, -54, -126 + 34, 5, '#2b2b29') + line(0, -126, 60, -126 + 34, 5, '#2b2b29');

  const column =
    rect(-17, -198, 34, 38, '#1c1c1b', 5) +
    rect(-12, -472, 24, 278, `url(#${id}-col)`, 3) +
    rect(-19, -490, 38, 24, '#1a1a19', 5) +
    rect(16, -484, 14, 8, '#1a1a19', 2) +
    `<circle cx="34" cy="-480" r="11" fill="#181817"/>` +
    rect(-9, -640, 18, 154, `url(#${id}-col)`, 3) +
    rect(-15, -656, 30, 20, '#1a1a19', 4) +
    rect(-6, -690, 12, 38, '#2a2a28', 2);

  // head, drawn around its own centre then placed and tilted
  const hx = 18;
  const hy = -800;
  const housing = `<path d="M -128,-82 Q -128,-93 -117,-94 L 62,-100 Q 92,-100 92,-70 L 92,70 Q 92,100 62,100 L -117,94 Q -128,93 -128,82 Z" fill="url(#${id}-body)"/>`;
  const topEdge = `<path d="M -117,-94 L 62,-100 Q 88,-100 91,-78" fill="none" stroke="#6a6a64" stroke-opacity=".45" stroke-width="2"/>`;
  let slits = '';
  for (let i = 0; i < 5; i++) {
    slits += rect(-100, -46 + i * 21, 78, 6, '#0b0b0a', 3);
    slits += rect(-100, -39 + i * 21, 78, 1.5, '#ffffff', 0, ' fill-opacity=".07"');
  }
  let louvres = '';
  for (let i = 0; i < 8; i++) louvres += rect(-104 + i * 19, -114, 10, 18, '#1a1a19', 2);
  const vent = rect(-112, -104, 156, 12, '#191918', 5) + louvres;
  const handle = rect(-146, -30, 20, 60, '#151514', 6);
  const yoke =
    `<path d="M -74,58 L -74,104 Q -74,112 -66,112 L 66,112 Q 74,112 74,104 L 74,58" fill="none" stroke="#1d1d1c" stroke-width="15" stroke-linejoin="round"/>` +
    `<circle cx="-2" cy="4" r="21" fill="#242422"/><circle cx="-2" cy="4" r="11" fill="#141413"/>`;
  const bezel = `<ellipse cx="100" cy="0" rx="31" ry="98" fill="#161615"/>`;
  const lens = `<ellipse cx="104" cy="0" rx="24" ry="85" fill="url(#${id}-lens)"/>`;
  let rings = '';
  for (const [rx, ry] of [
    [19, 70],
    [14, 55],
    [9, 39],
    [4.5, 22],
  ])
    rings += `<ellipse cx="105" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="#fff7e8" stroke-opacity=".38" stroke-width="1.6"/>`;
  const doors =
    `<polygon points="98,-96 116,-90 238,-142 232,-160" fill="#1b1b1a"/>` +
    `<polygon points="98,96 116,90 238,142 232,160" fill="#1b1b1a"/>` +
    `<polygon points="116,-90 238,-142 236,-136 118,-84" fill="#ffcf96" fill-opacity=".55"/>` +
    `<polygon points="116,90 238,142 236,136 118,84" fill="#ffcf96" fill-opacity=".35"/>`;
  const spill = glowOn
    ? `<ellipse cx="190" cy="0" rx="120" ry="150" fill="url(#${id}-spill)"/>`
    : '';
  const head = `<g transform="translate(${hx} ${hy}) rotate(${tilt})">${yoke}${handle}${housing}${topEdge}${vent}${slits}${bezel}${lens}${rings}${spill}${doors}</g>`;

  const cable = `<path d="M -98,-748 C -190,-640 -40,-470 -24,-300 C -12,-170 -30,-40 -60,-8 C -140,30 -420,8 -760,40" fill="none" stroke="#161615" stroke-width="5" stroke-linecap="round"/>`;
  const sandbag = `<path d="M 104,-34 Q 120,-60 152,-50 Q 186,-40 176,-12 Q 150,6 116,-4 Q 96,-14 104,-34 Z" fill="#2c2b28"/>` +
    `<path d="M 112,-30 Q 140,-44 168,-30" fill="none" stroke="#45443f" stroke-width="2"/>`;

  return {
    defs,
    el: `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})">${cable}${back}${fl}${fr}${braces}${column}${sandbag}${head}</g>`,
  };
}

/** Cinema camera on sticks: fluid head, matte box, follow focus, top monitor. Faces right. */
export function cameraRig({ id, x, y, s = 1, rim = true }) {
  const defs = [
    BODY(`${id}-body`, '#3b3b37', '#121211'),
    BODY(`${id}-mb`, '#2f2f2c', '#0f0f0e'),
    linear(`${id}-barrel`, [
      [0, '#3a3a36'],
      [0.4, '#202020'],
      [1, '#0e0e0d'],
    ]),
    radial(`${id}-warm`, [
      [0, '#ffc98b', 0.55],
      [1, '#ffb066', 0],
    ]),
  ].join('');
  const c = '#1f1f1d';
  const fl = leg([-26, -560], [-122, -282], [-206, 0], { w: 10, c });
  const fr = leg([26, -560], [126, -282], [214, -6], { w: 10, c });
  const bk = leg([4, -566], [12, -302], [28, -48], { w: 8, c: '#3b3b38' });
  const spreader =
    `<circle cx="2" cy="-252" r="9" fill="#262624"/>` +
    line(2, -252, -129, -252, 5, '#2a2a28') +
    line(2, -252, 134, -252, 5, '#2a2a28') +
    line(2, -252, 15, -244, 4, '#3a3a37');
  const clamps =
    rect(-132, -296, 22, 26, '#141413', 4) + rect(115, -296, 22, 26, '#141413', 4);
  const bowl =
    `<path d="M -54,-572 Q 0,-532 54,-572 Z" fill="#232321"/>` +
    `<ellipse cx="0" cy="-572" rx="54" ry="10" fill="#2e2e2b"/>`;
  const fluidHead =
    rect(-58, -652, 116, 80, `url(#${id}-body)`, 10) +
    `<circle cx="-2" cy="-612" r="25" fill="#181817"/><circle cx="-2" cy="-612" r="15" fill="none" stroke="#3a3a37" stroke-width="2"/>`;
  const panBar = line(-48, -628, -268, -560, 12, '#1b1b1a') + line(-226, -572, -284, -555, 20, '#0f0f0e');
  const plate = rect(-96, -666, 196, 14, '#2a2a28', 3);
  const body =
    rect(-110, -846, 232, 182, `url(#${id}-body)`, 10) +
    rect(-80, -804, 92, 48, '#232321', 4) +
    rect(-74, -798, 80, 36, '#34342f', 2) +
    `<circle cx="34" cy="-786" r="5" fill="#3e3e3a"/><circle cx="52" cy="-786" r="5" fill="#3e3e3a"/><circle cx="34" cy="-766" r="5" fill="#3e3e3a"/>` +
    rect(-70, -716, 150, 4, '#0d0d0c', 2) +
    rect(-70, -704, 150, 4, '#0d0d0c', 2) +
    rect(-70, -692, 150, 4, '#0d0d0c', 2);
  const handle =
    rect(-82, -896, 184, 14, '#1a1a19', 7) + rect(-72, -884, 12, 42, '#1a1a19', 3) + rect(78, -884, 12, 42, '#1a1a19', 3);
  const evf =
    rect(-126, -872, 34, 12, '#1b1b1a', 3) +
    rect(-214, -892, 104, 48, '#1c1c1b', 11) +
    rect(-242, -896, 34, 56, '#0e0e0d', 13);
  const battery = rect(-142, -834, 34, 152, '#262624', 6) + rect(-142, -834, 34, 3, '#4a4a45', 2);
  const monitor =
    line(64, -894, 92, -944, 10, '#1a1a19') +
    rect(30, -1014, 144, 86, '#141413', 7) +
    rect(38, -1006, 128, 70, '#2c2c29', 2) +
    rect(52, -996, 100, 50, 'none', 0, ' stroke="#ffffff" stroke-opacity=".14" stroke-width="1.5"');
  let knurl = '';
  for (let i = 0; i < 10; i++) knurl += line(170 + i * 5, -804, 170 + i * 5, -682, 1.8, '#ffffff', ' stroke-opacity=".07"');
  const lensEl =
    rect(120, -802, 178, 118, `url(#${id}-barrel)`, 8) +
    rect(164, -808, 54, 130, '#191918', 6) +
    knurl +
    rect(232, -806, 30, 126, '#1d1d1c', 5) +
    rect(294, -814, 16, 142, '#151514', 5);
  const rods = line(96, -668, 366, -668, 6, '#4b4b47') + line(96, -656, 366, -656, 6, '#3c3c39');
  const ff =
    rect(178, -694, 44, 34, '#222220', 5) +
    `<circle cx="200" cy="-648" r="15" fill="#181817"/><circle cx="200" cy="-648" r="6" fill="#3a3a37"/>`;
  const matte =
    `<polygon points="308,-826 404,-872 404,-606 308,-652" fill="url(#${id}-mb)"/>` +
    `<polygon points="318,-816 396,-856 396,-622 318,-662" fill="#090908"/>` +
    `<polygon points="306,-830 404,-876 446,-924 352,-880" fill="#1d1d1c"/>` +
    `<polygon points="306,-648 404,-602 404,-596 306,-642" fill="#2d2d2a"/>`;
  const warm = rim
    ? `<g stroke="#ffc27a" stroke-linecap="round" fill="none">` +
      `<line x1="-108" y1="-846" x2="118" y2="-846" stroke-width="3" stroke-opacity=".8"/>` +
      `<line x1="-80" y1="-896" x2="100" y2="-896" stroke-width="2.5" stroke-opacity=".75"/>` +
      `<line x1="-212" y1="-892" x2="-112" y2="-892" stroke-width="2.5" stroke-opacity=".6"/>` +
      `<line x1="122" y1="-802" x2="296" y2="-802" stroke-width="2.5" stroke-opacity=".7"/>` +
      `<line x1="306" y1="-830" x2="404" y2="-876" stroke-width="2.5" stroke-opacity=".75"/>` +
      `<line x1="-110" y1="-842" x2="-110" y2="-700" stroke-width="2.5" stroke-opacity=".55"/>` +
      `<line x1="-142" y1="-830" x2="-142" y2="-690" stroke-width="2" stroke-opacity=".45"/>` +
      `<line x1="-58" y1="-650" x2="-58" y2="-580" stroke-width="2" stroke-opacity=".4"/>` +
      `</g>`
    : '';
  return {
    defs,
    el: `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})">${bk}${fl}${fr}${spreader}${clamps}${bowl}${panBar}${fluidHead}${plate}${battery}${body}${handle}${evf}${monitor}${rods}${lensEl}${ff}${matte}${warm}</g>`,
  };
}

/** Timeline UI drawn into a screen rectangle. One warm clip, the rest in greys. */
export function timelineUI(sx, sy, sw, sh, { warm = '#e39a55', frames = true } = {}) {
  let s = rect(sx, sy, sw, sh, '#232321');
  s += rect(sx, sy, sw, sh * 0.035, '#1a1a19');
  const vh = sh * 0.48;
  const vw = sw / 2 - sw * 0.024;
  const pad = sw * 0.016;
  if (frames) {
    // two viewers: a pale exterior and a dark interior with a lamp
    const ly = sy + sh * 0.06;
    s += rect(sx + pad, ly, vw, vh, '#0d0d0c');
    const fh = vw / 2.39;
    const fy = ly + (vh - fh) / 2;
    s += rect(sx + pad, fy, vw, fh * 0.55, '#d9d9d4') + rect(sx + pad, fy + fh * 0.55, vw, fh * 0.45, '#c3c2bc');
    s += rect(sx + pad + vw * 0.62, fy + fh * 0.47, vw * 0.012, fh * 0.1, '#2a2a28');
    const rx0 = sx + sw / 2 + sw * 0.008;
    s += rect(rx0, ly, vw, vh, '#0d0d0c');
    s += rect(rx0, fy, vw, fh, '#1a1918');
    s += `<circle cx="${r2(rx0 + vw * 0.3)}" cy="${r2(fy + fh * 0.4)}" r="${r2(fh * 0.16)}" fill="${warm}" fill-opacity=".35"/>`;
    s += `<circle cx="${r2(rx0 + vw * 0.3)}" cy="${r2(fy + fh * 0.4)}" r="${r2(fh * 0.05)}" fill="#ffe2bd"/>`;
  }
  const ty = sy + sh * 0.58;
  const th = sh * 0.4;
  s += rect(sx + pad, ty, sw - pad * 2, th, '#191918');
  const lanes = 5;
  const lh = (th - 14) / lanes;
  const clips = [
    [[0.02, 0.18], [0.21, 0.12], [0.36, 0.24], [0.63, 0.16], [0.82, 0.1]],
    [[0.0, 0.14], [0.15, 0.2, 'warm'], [0.37, 0.11], [0.5, 0.3], [0.83, 0.14]],
    [[0.0, 0.33], [0.35, 0.22], [0.6, 0.38]],
    [[0.05, 0.26], [0.42, 0.5]],
    [[0.0, 0.62], [0.66, 0.3]],
  ];
  clips.forEach((lane, i) => {
    const y0 = ty + 7 + i * lh;
    lane.forEach(([o, w, kind]) => {
      const cx = sx + pad * 1.5 + o * (sw - pad * 3);
      const cw = w * (sw - pad * 3) - 2;
      const fill = kind === 'warm' ? warm : i < 2 ? (i === 0 ? '#8c8c86' : '#73736e') : '#4d4d49';
      s += rect(cx, y0, cw, lh - 3, fill, 2);
      if (i >= 2) {
        for (let k = 0; k < cw / 4; k++) {
          const hh = (lh - 7) * (0.25 + 0.7 * Math.abs(Math.sin(k * 1.7 + i)));
          s += rect(cx + k * 4 + 1, y0 + (lh - 3 - hh) / 2, 1.4, hh, '#2b2b29');
        }
      }
    });
  });
  const px = sx + sw * 0.6;
  s += line(px, ty - 4, px, ty + th, 2, '#ffdcb0');
  s += `<polygon points="${r2(px - 6)},${r2(ty - 10)} ${r2(px + 6)},${r2(ty - 10)} ${r2(px)},${r2(ty - 2)}" fill="#ffdcb0"/>`;
  return s;
}

/** Edit desk seen from the front: monitors, speaker, keyboard, a pulled-out chair. */
export function editStation({ id, x, y, s = 1 }) {
  const defs = [
    BODY(`${id}-chair`, '#34342f', '#111110'),
    linear(`${id}-top`, [
      [0, '#3a3a36'],
      [1, '#262624'],
    ]),
  ].join('');
  const desk =
    rect(-392, -428, 18, 428, '#1b1b1a', 2) +
    rect(374, -428, 18, 428, '#1b1b1a', 2) +
    rect(-374, -384, 748, 9, '#252523') +
    `<polygon points="-404,-452 404,-452 388,-476 -388,-476" fill="url(#${id}-top)"/>` +
    rect(-404, -452, 808, 24, '#1c1c1b', 2) +
    rect(-404, -452, 808, 2, '#5a5a55', 0, ' fill-opacity=".4"');
  const mon =
    rect(-112, -484, 140, 10, '#1b1b1a', 4) +
    rect(-52, -560, 20, 82, '#1c1c1b', 3) +
    rect(-304, -830, 524, 300, '#101010', 8) +
    timelineUI(-296, -822, 508, 284);
  const ref =
    rect(256, -482, 74, 8, '#1b1b1a', 3) +
    rect(288, -548, 10, 68, '#1c1c1b', 2) +
    rect(230, -664, 186, 110, '#101010', 5) +
    rect(236, -658, 174, 98, '#1d1d1c') +
    rect(236, -658, 174, 52, '#cfcfca') +
    rect(236, -606, 174, 46, '#a9a8a2') +
    `<path d="M 236,-608 Q 270,-624 300,-612 T 360,-616 T 410,-610 L 410,-606 L 236,-606 Z" fill="#8f8e88"/>`;
  const speaker =
    rect(-392, -614, 78, 138, '#1a1a19', 8) +
    `<circle cx="-353" cy="-520" r="27" fill="#0e0e0d"/><circle cx="-353" cy="-520" r="27" fill="none" stroke="#2f2f2c" stroke-width="3"/>` +
    `<circle cx="-353" cy="-586" r="10" fill="#0e0e0d"/>`;
  const keys = rect(-150, -486, 244, 12, '#2a2a28', 3) + `<ellipse cx="132" cy="-481" rx="16" ry="7" fill="#262624"/>`;
  // chair pulled out to the left, seen from behind
  const cx = -560;
  const chair =
    line(cx, -44, cx - 112, -12, 14, '#1b1b1a') +
    line(cx, -44, cx - 46, 2, 14, '#1b1b1a') +
    line(cx, -44, cx + 58, 4, 14, '#1b1b1a') +
    line(cx, -44, cx + 112, -10, 14, '#1b1b1a') +
    [cx - 112, cx - 46, cx + 58, cx + 112]
      .map((px, i) => `<circle cx="${px}" cy="${[-4, 8, 10, -2][i]}" r="13" fill="#121211"/>`)
      .join('') +
    `<circle cx="${cx}" cy="-46" r="16" fill="#222220"/>` +
    rect(cx - 10, -300, 20, 256, '#2c2c29', 4) +
    rect(cx - 10, -300, 4, 256, '#55554f', 2, ' fill-opacity=".5"') +
    rect(cx - 12, -362, 24, 44, '#1d1d1c', 4) +
    rect(cx - 122, -340, 244, 48, `url(#${id}-chair)`, 18) +
    rect(cx - 126, -434, 16, 98, '#1a1a19', 4) +
    rect(cx - 146, -442, 58, 14, '#1d1d1c', 6) +
    rect(cx + 110, -434, 16, 98, '#1a1a19', 4) +
    rect(cx + 88, -442, 58, 14, '#1d1d1c', 6) +
    rect(cx - 102, -652, 204, 300, `url(#${id}-chair)`, 32) +
    `<path d="M ${cx - 76},-520 Q ${cx},-500 ${cx + 76},-520" fill="none" stroke="#45453f" stroke-opacity=".5" stroke-width="2"/>` +
    rect(cx - 98, -650, 196, 3, '#6a6a63', 2, ' fill-opacity=".35"');
  return {
    defs,
    el: `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})">${desk}${speaker}${mon}${ref}${keys}${chair}</g>`,
  };
}

/** A 6x6 butterfly frame of white diffusion on a stand, for BTS frames. */
export function diffusionFrame({ id, x, y, s = 1, lit = 0.9 }) {
  const defs = linear(`${id}-silk`, [
    [0, '#f7f6f2', lit],
    [1, '#d8d6cf', lit],
  ]);
  const legs =
    leg([0, -170], [-70, -90], [-150, 0], { twin: false, w: 9 }) +
    leg([0, -170], [80, -90], [160, -6], { twin: false, w: 9 }) +
    rect(-10, -900, 20, 740, '#1f1f1d', 3);
  const frame =
    rect(-330, -1300, 660, 520, `url(#${id}-silk)`) +
    rect(-330, -1300, 660, 520, 'none', 0, ' stroke="#1c1c1b" stroke-width="12"');
  return { defs, el: `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})">${legs}${frame}</g>` };
}

/** A small director's monitor on a stand, showing a frame. */
export function videoVillage({ id, x, y, s = 1, screen = '#3a3a37' }) {
  const legs =
    leg([0, -150], [-60, -80], [-130, 0], { twin: false, w: 8 }) +
    leg([0, -150], [64, -80], [136, -4], { twin: false, w: 8 }) +
    rect(-8, -560, 16, 410, '#1f1f1d', 3);
  const mon =
    rect(-190, -800, 380, 240, '#111110', 10) +
    rect(-178, -788, 356, 200, screen) +
    rect(-150, -740, 300, 110, 'none', 0, ' stroke="#ffffff" stroke-opacity=".18" stroke-width="2"') +
    rect(-220, -812, 30, 120, '#151514', 6) +
    rect(190, -812, 30, 120, '#151514', 6);
  return { defs: '', el: `<g transform="translate(${r2(x)} ${r2(y)}) scale(${s})">${legs}${mon}</g>`, id };
}

export { lerp, line, rect };
