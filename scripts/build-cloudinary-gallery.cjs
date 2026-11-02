/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS Node script. */
/* Produces public-only data. Never imports credentials or local source paths. */
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const root = path.resolve(__dirname, "..");
  const read = async filename => JSON.parse(await fs.readFile(path.join(root, filename), "utf8"));
  const [uploads, curation, inventory, prepared] = await Promise.all([
    read(".artifacts/cloudinary-upload-manifest.json"),
    read(".artifacts/photo-curation.json"),
    read(".artifacts/cloudinary-inventory.json"),
    read(".artifacts/cloudinary-exports.json"),
  ]);
  if (!prepared.complete) throw new Error("Prepare all upload masters before generating the gallery.");
  const photos = [];
  for (const artist of curation.artists) {
    const featured = artist.featured.map(filename => artist.photos.find(photo => photo.filename === filename));
    if (featured.some(photo => !photo)) throw new Error("Featured image is missing from curation.");
    const ordered = [...featured, ...artist.photos.filter(photo => !artist.featured.includes(photo.filename))];
    for (const photo of ordered) {
      const master = prepared.photos.find(item => item.artistId === artist.id && item.filename === photo.filename);
      const uploaded = uploads.photos.find(item => item.artistId === artist.id && item.filename === photo.filename && item.sha256 === master?.uploadSha256);
      if (!uploaded) throw new Error("Missing upload: " + artist.id + "/" + photo.filename);
      if (!photo.alt?.trim()) throw new Error("Missing alt text.");
      photos.push({ artistId: artist.id, filename: photo.filename, src: uploaded.src, width: uploaded.width, height: uploaded.height, alt: photo.alt });
    }
  }
  const keys = new Set(photos.map(photo => photo.artistId + "/" + photo.filename));
  if (photos.length !== inventory.imageCount || keys.size !== inventory.imageCount) {
    throw new Error("Public gallery must contain every source image exactly once.");
  }
  for (const selection of [curation.hero, curation.keepsake]) {
    if (!keys.has(selection.artistId + "/" + selection.filename)) throw new Error("Featured selection is absent.");
  }
  await fs.writeFile(path.join(root, "app/lib/cloudinary-photos.json"), JSON.stringify(photos, null, 2) + "\n");
  await fs.writeFile(path.join(root, "app/lib/cloudinary-featured.json"), JSON.stringify({ hero: curation.hero, keepsake: curation.keepsake }, null, 2) + "\n");
  console.log(JSON.stringify({ galleryPhotos: photos.length, artistCollections: curation.artists.length }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
