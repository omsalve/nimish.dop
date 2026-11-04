/**
 * Generates the torn-paper edge used by the splash (public/torn/) and the crowd
 * silhouette under the rig (public/crowd.svg).
 *
 * Each variant is a 1000×88 tile that repeats horizontally:
 *   mask-top-N.svg    opaque below the tear (the photograph's alpha)
 *   rim-top-N.svg     the exposed paper core, its fibres, and the shadow it casts
 *   mask-bottom-N / rim-bottom-N are the same tear mirrored vertically.
 * Noise is periodic over the tile width, so every edge tiles without a seam,
 * and a mask and its rim always share one tear line.
 *
 *   node scripts/generate-torn-edges.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const W = 1000;
const H = 88;
const STEP = 2.5;
const out = path.join(__dirname, "..", "public", "torn");
fs.mkdirSync(out, { recursive: true });

function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Periodic value noise: `cells` lattice points around one tile width.
function noise(cells, random) {
  const values = Array.from({ length: cells }, () => random() * 2 - 1);
  return (x) => {
    const p = (((x / W) % 1) + 1) % 1 * cells;
    const i = Math.floor(p);
    const f = p - i;
    const s = f * f * (3 - 2 * f);
    return values[i % cells] + (values[(i + 1) % cells] - values[i % cells]) * s;
  };
}

const fmt = (n) => Number(n.toFixed(1));

function variant(seed) {
  const random = rng(seed);
  const broad = noise(7, random);
  const mid = noise(31, random);
  const fine = noise(150, random);
  const grit = noise(420, random);
  const band = noise(23, random);
  const fray = noise(260, random);

  const xs = [];
  for (let x = 0; x <= W + 0.01; x += STEP) xs.push(Math.min(x, W));

  // The photograph's tear line, and the outer edge of the exposed paper core.
  const tear = xs.map(
    (x) => 56 + broad(x) * 12 + mid(x) * 4.2 + fine(x) * 1.5 + grit(x) * 0.55,
  );
  const outer = xs.map((x, i) => {
    const width = 4 + Math.pow((band(x) + 1) / 2, 1.5) * 15 + fray(x) * 2;
    return Math.max(12, tear[i] - Math.max(3, width));
  });

  const line = (ys) => xs.map((x, i) => `${fmt(x)} ${fmt(ys[i])}`).join(" L");
  const back = (ys) =>
    xs
      .map((x, i) => [x, ys[i]])
      .reverse()
      .map(([x, y]) => `${fmt(x)} ${fmt(y)}`)
      .join(" L");

  const maskPath = `M${line(tear)} L${W} ${H} L0 ${H}Z`;
  // The paper core overlaps the photograph by a hair to hide antialiasing seams.
  const rimPath = `M${line(outer)} L${back(tear.map((y) => y + 0.9))}Z`;
  const shadowPath = `M${line(outer.map((y) => y - 1))} L${back(outer.map((y) => y + 5))}Z`;

  // Loose fibres: short hairs pulled out of the outer edge, a few inward.
  const fibres = [];
  for (let k = 0; k < 320; k++) {
    const i = Math.floor(random() * xs.length);
    const x = xs[i] + (random() - 0.5) * STEP;
    const inward = random() < 0.12;
    const y = inward ? tear[i] + 0.4 : outer[i] + 0.6;
    const length = inward ? 1 + random() * 2.6 : 1.6 + Math.pow(random(), 1.7) * 10;
    const angle = (-90 + (random() - 0.5) * 70) * (Math.PI / 180) * (inward ? -1 : 1);
    const bend = (random() - 0.5) * 2.2;
    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    const width = (0.3 + random() * 0.55).toFixed(2);
    const opacity = (0.45 + random() * 0.5).toFixed(2);
    fibres.push(
      `<path d="M${fmt(x)} ${fmt(y)} Q${fmt((x + x2) / 2 + bend)} ${fmt((y + y2) / 2)} ${fmt(x2)} ${fmt(y2)}" stroke-width="${width}" stroke-opacity="${opacity}"/>`,
    );
  }

  const defs = `<defs><linearGradient id="core" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#efefef"/><stop offset=".55" stop-color="#dcdcdc"/><stop offset="1" stop-color="#b4b4b4"/></linearGradient><filter id="soft" x="-5%" y="-60%" width="110%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter><filter id="tooth" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .35" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .22  0 0 0 0 .22  0 0 0 0 .22  0 0 0 -1.5 1.05"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>`;
  const rimBody = `<path d="${shadowPath}" fill="#040404" fill-opacity=".62" filter="url(#soft)"/><path d="${rimPath}" fill="url(#core)"/><path d="${rimPath}" fill="#000" filter="url(#tooth)" opacity=".5"/><g fill="none" stroke="#ececec" stroke-linecap="round">${fibres.join("")}</g>`;
  const maskBody = `<path d="${maskPath}"/>`;
  return { defs, rimBody, maskBody };
}

const svg = (inner, flipped) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${inner.defs ?? ""}${
    flipped ? `<g transform="matrix(1 0 0 -1 0 ${H})">${inner.body}</g>` : inner.body
  }</svg>`;

// The splash tears along variant 2; the other seeds are kept for future cuts.
[[27, 2]].forEach(([seed, n]) => {
  const { defs, rimBody, maskBody } = variant(seed);
  const write = (name, content) => fs.writeFileSync(path.join(out, name), content);
  write(`mask-top-${n}.svg`, svg({ body: maskBody }, false));
  write(`mask-bottom-${n}.svg`, svg({ body: maskBody }, true));
  write(`rim-top-${n}.svg`, svg({ defs, body: rimBody }, false));
  write(`rim-bottom-${n}.svg`, svg({ defs, body: rimBody }, true));
});

// The crowd: a tileable silhouette strip with phones held up to the stage.
{
  const random = rng(404);
  const CW = 1600;
  const CH = 280;
  const back = [];
  const front = [];
  const screens = [];
  const person = (x, base, size, layer, raise) => {
    const head = 15 * size;
    const shoulder = 46 * size;
    const top = base - 62 * size;
    const parts = [
      `<ellipse cx="${fmt(x)}" cy="${fmt(top)}" rx="${fmt(head * 0.82)}" ry="${fmt(head)}"/>`,
      `<path d="M${fmt(x - shoulder)} ${CH} L${fmt(x - shoulder * 0.92)} ${fmt(top + head * 2.1)} Q${fmt(x)} ${fmt(top + head * 0.9)} ${fmt(x + shoulder * 0.92)} ${fmt(top + head * 2.1)} L${fmt(x + shoulder)} ${CH}Z"/>`,
    ];
    if (raise) {
      const side = random() < 0.5 ? -1 : 1;
      const sx = x + side * shoulder * 0.62;
      const sy = top + head * 2.4;
      const angle = (-90 + side * (8 + random() * 26)) * (Math.PI / 180);
      const length = (95 + random() * 70) * size;
      const ex = sx + Math.cos(angle) * length;
      const ey = sy + Math.sin(angle) * length;
      parts.push(
        `<path d="M${fmt(sx)} ${fmt(sy)} L${fmt(ex)} ${fmt(ey)}" stroke-width="${fmt(13 * size)}" stroke-linecap="round" fill="none" stroke="currentColor"/>`,
      );
      if (raise === "phone") {
        const w = 17 * size;
        const h = 30 * size;
        parts.push(
          `<rect x="${fmt(ex - w / 2)}" y="${fmt(ey - h)}" width="${fmt(w)}" height="${fmt(h)}" rx="${fmt(3 * size)}"/>`,
        );
        if (layer === front)
          screens.push(
            `<rect x="${fmt(ex - w / 2 + 2 * size)}" y="${fmt(ey - h + 2.5 * size)}" width="${fmt(w - 4 * size)}" height="${fmt(h - 5 * size)}" rx="${fmt(2 * size)}"/>`,
          );
      } else {
        parts.push(`<circle cx="${fmt(ex)}" cy="${fmt(ey - 6 * size)}" r="${fmt(9 * size)}"/>`);
      }
    }
    layer.push(parts.join(""));
  };
  for (let x = 30; x < CW - 30; x += 34 + random() * 30) {
    person(x, CH - 18, 0.75 + random() * 0.2, back, random() < 0.3 ? (random() < 0.6 ? "phone" : "fist") : null);
  }
  for (let x = 50; x < CW - 50; x += 58 + random() * 46) {
    person(x, CH + 6, 1 + random() * 0.28, front, random() < 0.42 ? (random() < 0.7 ? "phone" : "fist") : null);
  }
  fs.writeFileSync(
    path.join(__dirname, "..", "public", "crowd.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="xMidYMax slice"><defs><filter id="g" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6"/></filter></defs><g fill="#0f0f0f" color="#0f0f0f">${back.join("")}</g><rect y="${CH - 30}" width="${CW}" height="30" fill="#030303"/><g fill="#030303" color="#030303">${front.join("")}</g><g fill="#d2d2d2" opacity=".55" filter="url(#g)">${screens.join("")}</g><g fill="#dedede">${screens.join("")}</g></svg>`,
  );
}

console.log("Torn edge and crowd written.");
