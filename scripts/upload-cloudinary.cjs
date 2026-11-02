/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS Node script. */
/* Uploads prepared masters; credentials stay in .env.local and never enter the gallery. */
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, ".artifacts/cloudinary-upload-manifest.json");
const preparedPath = path.join(root, ".artifacts/cloudinary-exports.json");

async function readJson(filename, fallback) {
  try {
    return JSON.parse(await fs.readFile(filename, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== undefined) return fallback;
    throw error;
  }
}

function cloudinaryCredentials() {
  process.loadEnvFile(path.join(root, ".env.local"));
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing from .env.local.");
  }
  if (!/^[a-z0-9_-]+$/i.test(cloudName)) throw new Error("Invalid cloud name.");
  return { cloudName, apiKey, apiSecret };
}

async function main() {
  const credentials = cloudinaryCredentials();
  const prepared = await readJson(preparedPath);
  const manifest = await readJson(manifestPath, { cloudName: credentials.cloudName, photos: [] });
  if (manifest.cloudName !== credentials.cloudName) {
    throw new Error("Existing upload manifest belongs to a different cloud.");
  }
  const limitIndex = process.argv.indexOf("--limit");
  const limit = limitIndex < 0 ? prepared.photos.length : Number(process.argv[limitIndex + 1]);
  if (!Number.isInteger(limit) || limit < 1) throw new Error("Invalid --limit.");
  let pendingWrite = Promise.resolve();
  function saveManifest() {
    const json = JSON.stringify(manifest, null, 2) + "\n";
    pendingWrite = pendingWrite.then(async () => {
      await fs.writeFile(manifestPath + ".tmp", json);
      await fs.rename(manifestPath + ".tmp", manifestPath);
    });
    return pendingWrite;
  }

  async function upload(photo, position) {
    const buffer = await fs.readFile(photo.uploadPath);
    if (buffer.length >= 10000000 || photo.width * photo.height > 25000000) {
      throw new Error("Prepared photo exceeds Free plan limits: " + photo.artistId + "/" + photo.filename);
    }
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const previous = manifest.photos.find(item => item.artistId === photo.artistId && item.filename === photo.filename && item.sha256 === sha256);
    if (previous) {
      return;
    }
    const stem = path.parse(photo.filename).name.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const publicId = `nimish/artists/${photo.artistId}/${stem}-${sha256.slice(0, 12)}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      const parameters = {
        asset_folder: `nimish/artists/${photo.artistId}`,
        overwrite: "false",
        public_id: publicId,
        tags: `nimish-portfolio,${photo.artistId}`,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "upload",
      };
      const signed = Object.keys(parameters).sort().map(key => key + "=" + parameters[key]).join("&") + credentials.apiSecret;
      const signature = crypto.createHash("sha256").update(signed).digest("hex");
      const form = new FormData();
      for (const [key, value] of Object.entries(parameters)) form.append(key, value);
      form.append("api_key", credentials.apiKey);
      form.append("signature", signature);
      const mime = photo.format === "png" ? "image/png" : photo.format === "webp" ? "image/webp" : "image/jpeg";
      form.append("file", new Blob([buffer], { type: mime }), path.basename(photo.uploadPath));
      let response;
      try {
        response = await fetch(`https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/upload`, {
          method: "POST", body: form, signal: AbortSignal.timeout(90000),
        });
      } catch {
        if (attempt === 2) throw new Error("Upload network failure: " + photo.artistId + "/" + photo.filename);
        await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }
      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        throw new Error(`Cloudinary upload returned HTTP ${response.status} for ${photo.artistId}/${photo.filename}.`);
      }
      const uploaded = await response.json();
      if (uploaded.public_id !== publicId || uploaded.width !== photo.width || uploaded.height !== photo.height || uploaded.bytes !== buffer.length || !uploaded.secure_url?.startsWith(`https://res.cloudinary.com/${credentials.cloudName}/image/upload/`)) {
        throw new Error("Upload response did not match the prepared master: " + photo.artistId + "/" + photo.filename);
      }
      manifest.photos = manifest.photos.filter(item => !(item.artistId === photo.artistId && item.filename === photo.filename));
      manifest.photos.push({
        artistId: photo.artistId, filename: photo.filename, sha256,
        publicId: uploaded.public_id, src: uploaded.secure_url,
        width: uploaded.width, height: uploaded.height, bytes: uploaded.bytes,
        createdAt: uploaded.created_at,
      });
      await saveManifest();
      console.log(`Uploaded ${position + 1}/${prepared.photos.length}: ${photo.artistId}/${photo.filename}`);
      return;
    }
  }

  const photos = prepared.photos.slice(0, limit);
  let cursor = 0;
  let stopped = false;
  const failures = [];
  await Promise.all(Array.from({ length: Math.min(3, photos.length) }, async () => {
    while (!stopped && cursor < photos.length) {
      const position = cursor++;
      try { await upload(photos[position], position); }
      catch (error) { failures.push(error); stopped = true; }
    }
  }));
  await pendingWrite;
  if (failures.length) throw failures[0];
  console.log(JSON.stringify({ uploadedPhotos: manifest.photos.length, preparedPhotos: prepared.photos.length }));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
