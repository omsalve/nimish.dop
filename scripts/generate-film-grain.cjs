/**
 * Renders public/film-grain.webp: a 256×256 tile of monochrome, gaussian film
 * grain with slight clumping, the way silver halide reads on a scan. It is
 * mid-grey centred with partial alpha, so CSS can lay it over the charcoal
 * ground or blend it into pink ink and paper.
 *
 *   node scripts/generate-film-grain.cjs   (uses the local Playwright Chromium)
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const dataUrl = await page.evaluate(() => {
    const size = 256;
    let seed = 1337;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const gauss = () => {
      const u = Math.max(random(), 1e-9);
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
    };
    const fine = new Float32Array(size * size).map(() => gauss());
    // Clumps: a half-resolution field, wrapped so the tile repeats seamlessly.
    const half = size / 2;
    const coarse = new Float32Array(half * half).map(() => gauss());
    const at = (x, y) => coarse[((y + half) % half) * half + ((x + half) % half)];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d");
    const image = context.createImageData(size, size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const cx = x / 2;
        const cy = y / 2;
        const x0 = Math.floor(cx);
        const y0 = Math.floor(cy);
        const fx = cx - x0;
        const fy = cy - y0;
        const clump =
          at(x0, y0) * (1 - fx) * (1 - fy) +
          at(x0 + 1, y0) * fx * (1 - fy) +
          at(x0, y0 + 1) * (1 - fx) * fy +
          at(x0 + 1, y0 + 1) * fx * fy;
        const value = Math.max(0, Math.min(255, 128 + (fine[y * size + x] * 0.72 + clump * 0.55) * 52));
        const i = (y * size + x) * 4;
        image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
        image.data[i + 3] = 150;
      }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL("image/webp", 0.86);
  });
  await browser.close();
  const target = path.join(__dirname, "..", "public", "film-grain.webp");
  fs.writeFileSync(target, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log("film-grain.webp", fs.statSync(target).size, "bytes");
})();
