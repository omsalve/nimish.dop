// Behind-the-scenes placeholders: the hero's gear photographed on each film's
// own location (its stills, thrown out of focus behind), printed in monochrome.

import { readFile } from 'node:fs/promises';
import { sharp, svgDoc } from './lib.mjs';
import { fresnelStand, cameraRig, videoVillage } from './gear.mjs';

export const BTS_W = 1800;
export const BTS_H = 1200;

async function plate(file, { blur, brightness }) {
  return sharp(await readFile(file))
    .resize(BTS_W, BTS_H, { fit: 'cover' })
    .blur(blur)
    .modulate({ brightness })
    .png()
    .toBuffer();
}

/** Returns a PNG buffer. `scene` is the background still, `screen` what the monitor shows. */
export async function composeBts(variant, { scene, screen }) {
  let bg;
  let fg;
  if (variant === 'camera') {
    bg = await plate(scene, { blur: 9, brightness: 0.85 });
    const cam = cameraRig({ id: 'cr', x: 1180, y: 1520, s: 1.55, rim: true });
    fg = svgDoc(BTS_W, BTS_H, cam.el, cam.defs);
  } else if (variant === 'light') {
    bg = await plate(scene, { blur: 12, brightness: 0.78 });
    const fz = fresnelStand({ id: 'fz', x: 360, y: 1420, s: 1.38, tilt: 7 });
    fg = svgDoc(BTS_W, BTS_H, fz.el, fz.defs);
  } else {
    bg = await plate(scene, { blur: 16, brightness: 0.62 });
    const shot = (await sharp(await readFile(screen)).resize(712, 400, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()).toString('base64');
    const mon = videoVillage({ id: 'vv', x: 900, y: 1950, s: 2.0, screen: '#1c1c1b' });
    const img = `<image x="544" y="374" width="712" height="400" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${shot}"/>`;
    const glare = `<polygon points="544,374 820,374 640,774 544,774" fill="#ffffff" fill-opacity=".05"/>`;
    fg = svgDoc(BTS_W, BTS_H, mon.el + img + glare);
  }
  const fgBuf = await sharp(Buffer.from(fg), { density: 72 }).png().toBuffer();
  return sharp(bg).composite([{ input: fgBuf }]).png().toBuffer();
}
