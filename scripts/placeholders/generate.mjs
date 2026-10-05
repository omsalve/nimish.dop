// Generates every placeholder image the site ships with.
//
//   node scripts/placeholders/generate.mjs
//
// Output goes to content/media/. Each file is synthetic art standing in for
// real photography: swap them for Nimish's own frames with the same names, or
// point content/projects.ts at new files. Nothing here runs at build time.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './lib.mjs';
import { heroSvg } from './hero.mjs';
import { composeBts } from './bts.mjs';
import * as S from './scenes.mjs';
import * as T from './scenes-2.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const media = (...p) => path.join(root, 'content', 'media', ...p);

const ASPECT = {
  scope: [2400, 1004], // 2.39:1
  flat: [2220, 1200], // 1.85:1
  hd: [2400, 1350], // 16:9
  euro: [2240, 1350], // 1.66:1
  academy: [1600, 1200], // 4:3
};

const films = [
  { slug: 'salt', aspect: 'scope', scenes: [S.saltWide, S.saltCrystals, S.saltPortrait, S.saltDusk], halation: 0.5 },
  { slug: 'last-local', aspect: 'flat', scenes: [S.localCarriage, S.localBokeh, S.localPlatform, S.localWindow], halation: 1 },
  { slug: 'warp-and-weft', aspect: 'hd', scenes: [S.weftThreads, S.weftLoom, S.weftStacks, S.weftSpools], halation: 0.6 },
  { slug: 'monsoon-letters', aspect: 'euro', scenes: [S.monsoonWindow, S.monsoonEnvelopes, S.monsoonUmbrellas, S.monsoonDoor], halation: 0.7 },
  { slug: 'first-light', aspect: 'scope', scenes: [S.lightHills, S.lightSteam, S.lightRoaster, S.lightBeans], halation: 0.6 },
  { slug: 'tungsten', aspect: 'academy', scenes: [S.tungstenBulb, S.tungstenProfile, S.tungstenCold, S.tungstenRoom], halation: 1.2 },
  // the second program
  { slug: 'neon-dhaba', aspect: 'flat', scenes: [T.dhabaNeon, T.dhabaChai, T.dhabaTrucks, T.dhabaCot], halation: 1.1 },
  { slug: 'half-court', aspect: 'scope', scenes: [T.courtDusk, T.courtBall, T.courtFence, T.courtLines], halation: 0.7 },
  { slug: 'tailor-of-lalbaug', aspect: 'euro', scenes: [T.tailorShop, T.tailorHands, T.tailorTape, T.tailorRack], halation: 0.8 },
  { slug: 'paper-boats', aspect: 'flat', scenes: [T.boatsPuddle, T.boatsRooftops, T.boatsDoorway, T.boatsGutter], halation: 0.5 },
  { slug: 'tide-tables', aspect: 'scope', scenes: [T.tideDawn, T.tideNets, T.tideLighthouse, T.tideRope], halation: 0.6 },
  { slug: 'velvet-hour', aspect: 'scope', scenes: [T.velvetSpot, T.velvetMic, T.velvetSeats, T.velvetCurtain], halation: 1 },
  { slug: 'static', aspect: 'academy', scenes: [T.staticWall, T.staticScan, T.staticBars, T.staticRoom], halation: 0.9 },
  { slug: 'kiln', aspect: 'hd', scenes: [T.kilnFire, T.kilnWheel, T.kilnShelves, T.kilnGlaze], halation: 1 },
  { slug: 'altitude', aspect: 'scope', scenes: [T.altRidge, T.altFlags, T.altRoad, T.altStars], halation: 0.6 },
];

// The photographs strip on the home page: stills, not frames from a film, so
// they come in the shapes photographs do (portrait, square, 3:2) and some in
// black and white.
const PRINT = {
  p45: [1600, 2000], // 4:5
  p23: [1400, 2100], // 2:3
  l32: [2400, 1600], // 3:2
  sq: [1800, 1800], // 1:1
};

const photos = [
  { scene: S.tungstenBulb, print: 'p45', halation: 1.2 },
  { scene: T.altFlags, print: 'l32', halation: 0.6 },
  { scene: T.boatsDoorway, print: 'p45', halation: 0.5, mono: true },
  { scene: T.dhabaChai, print: 'sq', halation: 1.1 },
  { scene: S.monsoonUmbrellas, print: 'l32', halation: 0.7, mono: true },
  { scene: S.saltPortrait, print: 'p45', halation: 0.5 },
  { scene: T.velvetMic, print: 'p23', halation: 1 },
  { scene: S.localPlatform, print: 'l32', halation: 1, mono: true },
  { scene: S.lightSteam, print: 'p23', halation: 0.6 },
  { scene: T.kilnWheel, print: 'l32', halation: 1 },
  { scene: S.tungstenProfile, print: 'p23', halation: 1.2, mono: true },
  { scene: T.staticRoom, print: 'sq', halation: 0.9 },
];

// node generate.mjs            → everything
// node generate.mjs hero       → the hero set only
// node generate.mjs bts        → behind-the-scenes frames only (needs the stills)
// node generate.mjs photos     → the photographs strip only
// node generate.mjs <slug>     → one film
const only = process.argv[2];

async function main() {
  const t0 = Date.now();
  if (!only || only === 'hero') {
    const r = await render(heroSvg(), media('hero', 'set.jpg'), { grain: 9, quality: 84 });
    console.log('hero', r);
  }
  for (const film of films) {
    if (only && only !== film.slug && only !== 'films' && only !== 'bts') continue;
    const [w, h] = ASPECT[film.aspect];
    const names = ['still', 'shot-1', 'shot-2', 'shot-3'];
    if (only !== 'bts') {
      for (let i = 0; i < film.scenes.length; i++) {
        await render(film.scenes[i](w, h), media(film.slug, `${names[i]}.jpg`), { grain: 13, halation: film.halation, quality: 82 });
      }
    }
    const bts = [
      ['camera', { scene: media(film.slug, 'still.jpg') }],
      ['light', { scene: media(film.slug, 'shot-1.jpg') }],
      ['monitor', { scene: media(film.slug, 'shot-2.jpg'), screen: media(film.slug, 'still.jpg') }],
    ];
    for (let i = 0; i < bts.length; i++) {
      const png = await composeBts(bts[i][0], bts[i][1]);
      await render(png, media(film.slug, `bts-${i + 1}.jpg`), { grain: 18, quality: 80, mono: true });
    }
    console.log(film.slug, `${w}x${h}`);
  }
  if (!only || only === 'photos') {
    for (let i = 0; i < photos.length; i++) {
      const { scene, print, halation, mono = false } = photos[i];
      const [w, h] = PRINT[print];
      const name = `photo-${String(i + 1).padStart(2, '0')}.jpg`;
      await render(scene(w, h), media('photos', name), { grain: mono ? 18 : 14, halation, quality: 80, mono });
    }
    console.log('photos', photos.length);
  }
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
