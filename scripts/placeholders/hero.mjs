// The hero placeholder: one continuous black-cyc set read left to right as
// light → camera → edit. Each station stands in its own pool of light against
// the black, the gear picked out by rim light. It stands in for the real
// three-beat photograph of Nimish and should be replaced by it (see
// /style-guide for the brief).

import { svgDoc, linear, radial, blurFilter, glow } from './lib.mjs';
import { fresnelStand, cameraRig, editStation } from './gear.mjs';

export const HERO_W = 3840;
export const HERO_H = 1280;

/** Draws `el` once as a flat light silhouette, nudged toward the light, then the gear over it. */
function rimmed(id, el, { dx, dy, color, opacity }) {
  return {
    def: `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feFlood flood-color="${color}" flood-opacity="${opacity}"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="1.4"/></filter>`,
    el: `<g transform="translate(${dx} ${dy})" filter="url(#${id})">${el}</g>${el}`,
  };
}

export function heroSvg() {
  const W = HERO_W;
  const H = HERO_H;
  const floor = 1010;

  const defs = [];
  const body = [];

  // the black seamless: wall, the faint lift where it curves, then the floor
  defs.push(
    linear('cyc', [
      [0, '#0a0a09'],
      [0.55, '#0d0d0c'],
      [0.76, '#131311'],
      [0.82, '#11110f'],
      [1, '#0b0b0a'],
    ]),
  );
  body.push(`<rect width="${W}" height="${H}" fill="url(#cyc)"/>`);
  defs.push(blurFilter('soft', 40), blurFilter('softer', 90));
  body.push(`<rect x="-200" y="${floor - 60}" width="${W + 400}" height="110" fill="#1d1d1a" opacity=".55" filter="url(#softer)"/>`);

  // three pools: the fresnel's own warm throw, a neutral pool behind the
  // camera, the cool spill of the edit monitors
  const pools = [
    glow('throw', { cx: 1180, cy: 560, rx: 820, ry: 520, color: '#ff9f52', opacity: 0.2 }),
    glow('throwHot', { cx: 980, cy: 470, rx: 360, ry: 300, color: '#ffc183', opacity: 0.16 }),
    glow('camPool', { cx: 1900, cy: 600, rx: 560, ry: 520, color: '#8f8c84', opacity: 0.2 }),
    glow('editPool', { cx: 3250, cy: 540, rx: 640, ry: 460, color: '#a9bccb', opacity: 0.13 }),
    glow('fl1', { cx: 980, cy: 1160, rx: 760, ry: 90, color: '#ffae66', opacity: 0.22 }),
    glow('fl2', { cx: 1920, cy: 1172, rx: 420, ry: 60, color: '#b8b4aa', opacity: 0.16 }),
    glow('fl3', { cx: 3260, cy: 1150, rx: 560, ry: 70, color: '#b4c6d4', opacity: 0.12 }),
  ];
  for (const p of pools) {
    defs.push(p.def);
    body.push(p.el);
  }

  // a shaft of the key through the haze, from the fresnel toward the camera
  defs.push(linear('shaft', [[0, '#ffd2a0', 0.22], [1, '#ffd2a0', 0]], { x1: 0, y1: 0, x2: 1, y2: 0.2 }));
  body.push(`<polygon points="700,300 700,420 2050,840 2120,520" fill="url(#shaft)" filter="url(#soft)"/>`);

  // the three stations, each rimmed from the side its light falls
  const light = fresnelStand({ id: 'fz', x: 520, y: 1152, s: 0.98, tilt: 11 });
  const cam = cameraRig({ id: 'cm', x: 1890, y: 1168, s: 1.0, rim: true });
  const edit = editStation({ id: 'ed', x: 3290, y: 1146, s: 0.92 });
  const rl = rimmed('rimL', light.el, { dx: 3, dy: -2, color: '#6e6a62', opacity: 0.9 });
  const rc = rimmed('rimC', cam.el, { dx: -3, dy: -3, color: '#ffc58a', opacity: 0.6 });
  const re = rimmed('rimE', edit.el, { dx: 3, dy: -3, color: '#9fb2c2', opacity: 0.75 });
  defs.push(light.defs, cam.defs, edit.defs, rl.def, rc.def, re.def);
  body.push(rl.el, rc.el, re.el);

  // the monitors light the desk and the back of the chair
  const screenGlow = glow('screen', { cx: 3270, cy: 770, rx: 420, ry: 260, color: '#cfe0ee', opacity: 0.12 });
  defs.push(screenGlow.def);
  body.push(screenGlow.el);

  // lens halation on top
  const halo = glow('halo', { cx: 640, cy: 352, rx: 230, ry: 270, color: '#ffd9a8', opacity: 0.85, core: 0.12 });
  defs.push(halo.def);
  body.push(halo.el);

  // a gentle falloff to the edges so the plate sinks into the page
  defs.push(
    radial('vig', [
      [0.5, '#000', 0],
      [1, '#000', 0.55],
    ], { cx: 0.5, cy: 0.45, r: 0.75 }),
  );
  body.push(`<rect width="${W}" height="${H}" fill="url(#vig)"/>`);

  return svgDoc(W, H, body.join('\n'), defs.join('\n'));
}
