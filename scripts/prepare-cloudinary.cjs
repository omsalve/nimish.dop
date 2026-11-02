/* Create Cloudinary Free-compatible upload masters without modifying originals. */
/* eslint-disable @typescript-eslint/no-require-imports -- This standalone Node CLI uses CommonJS. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const inventoryPath = path.resolve(process.argv[2] || path.join(projectRoot, '.artifacts/cloudinary-inventory.json'));
const outputRoot = path.join(projectRoot, '.artifacts/cloudinary-exports');
const manifestPath = path.join(projectRoot, '.artifacts/cloudinary-exports.json');
const byteLimit = 10_000_000;
const pixelLimit = 25_000_000;
const resizedPixelTarget = 24_900_000;
const qualities = [98, 97, 96, 95];
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const slug = value => value.normalize('NFKD').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();

sharp.cache({ memory: 128 });
sharp.concurrency(1);

function processingPipeline(source, dimensions) {
  return sharp(source, { failOn: 'error' })
    .rotate()
    .resize({ width: dimensions.width, height: dimensions.height, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
    .toColourspace('srgb')
    .withIccProfile('srgb');
}

async function writeManifest(photos, complete, originalCount) {
  const manifest = {
    complete,
    policy: {
      originalFilesUntouched: true,
      maximumBytesExclusive: byteLimit,
      maximumPixels: pixelLimit,
      copiedWhenAlreadyCompliant: true,
      jpegQualities: qualities,
      chromaSubsampling: '4:4:4',
      resizing: 'Only when required by image-processing or upload-size limits; Lanczos3, no cropping or sharpening',
      colour: 'Converted exports use sRGB with embedded ICC profile',
    },
    summary: {
      expectedPhotos: originalCount,
      preparedPhotos: photos.length,
      originalBytes: photos.reduce((sum, photo) => sum + photo.originalBytes, 0),
      uploadBytes: photos.reduce((sum, photo) => sum + photo.bytes, 0),
      copiedOriginals: photos.filter(photo => photo.copiedOriginal).length,
      encodedPhotos: photos.filter(photo => !photo.copiedOriginal).length,
      minimumJpegQuality: Math.min(...photos.filter(photo => photo.quality !== null).map(photo => photo.quality)),
      resizedPhotos: photos.filter(photo => photo.resized).length,
      originalsVerifiedBySha256: photos.length,
    },
    photos,
  };
  const temporary = manifestPath + '.tmp';
  await fs.writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n');
  await fs.rename(temporary, manifestPath);
}

async function prepare(file) {
  const sourcePath = path.resolve(file.inputPath);
  const original = await fs.readFile(sourcePath);
  const originalHash = hash(original);
  const metadata = await sharp(original).metadata();
  const inputWidth = metadata.autoOrient?.width || metadata.width;
  const inputHeight = metadata.autoOrient?.height || metadata.height;
  let dimensions = { width: inputWidth, height: inputHeight };
  const copiedOriginal = original.length < byteLimit && inputWidth * inputHeight <= pixelLimit;
  let encoded;
  let quality = null;
  let format = metadata.format;
  let resizedForBytes = false;

  if (copiedOriginal) {
    encoded = original;
  } else {
    if (inputWidth * inputHeight > pixelLimit) {
      const scale = Math.sqrt(resizedPixelTarget / (inputWidth * inputHeight));
      dimensions = { width: Math.floor(inputWidth * scale), height: Math.floor(inputHeight * scale) };
    }
    // Preserve any future PNG inputs losslessly where the free upload limit allows it.
    if (metadata.format === 'png') {
      encoded = await processingPipeline(original, dimensions).png({ compressionLevel: 9 }).toBuffer();
      if (encoded.length < byteLimit) {
        format = 'png';
      } else {
        encoded = await processingPipeline(original, dimensions).webp({ lossless: true, effort: 6 }).toBuffer();
        format = 'webp';
      }
      if (encoded.length >= byteLimit && metadata.hasAlpha) {
        throw new Error(`Lossless transparent export exceeds limit: ${file.artistSlug}/${file.filename}`);
      }
    }

    if (metadata.format !== 'png' || encoded.length >= byteLimit) {
      format = 'jpeg';
      let fits = false;
      for (let dimensionAttempt = 0; dimensionAttempt < 5 && !fits; dimensionAttempt++) {
        for (const candidate of qualities) {
          encoded = await processingPipeline(original, dimensions).jpeg({
            quality: candidate,
            chromaSubsampling: '4:4:4',
            mozjpeg: true,
            // Avoid very slow, lossy trellis search; retain high quality and full chroma.
            trellisQuantisation: false,
            optimiseScans: false,
            optimiseCoding: true,
          }).toBuffer();
          if (encoded.length < byteLimit) {
            quality = candidate;
            fits = true;
            break;
          }
        }
        if (!fits) {
          const scale = Math.min(0.96, Math.sqrt((byteLimit - 100_000) / encoded.length) * 0.98);
          dimensions = { width: Math.floor(dimensions.width * scale), height: Math.floor(dimensions.height * scale) };
          resizedForBytes = true;
        }
      }
      if (!fits) throw new Error(`Could not prepare high-quality export within limit: ${file.artistSlug}/${file.filename}`);
    }
  }

  const extension = copiedOriginal ? path.extname(file.filename).toLowerCase() : format === 'jpeg' ? '.jpg' : `.${format}`;
  const exportName = `${file.artistSlug}-${slug(path.parse(file.filename).name)}${extension}`;
  const artistRoot = path.join(outputRoot, file.artistSlug);
  const uploadPath = path.join(artistRoot, exportName);
  await fs.mkdir(artistRoot, { recursive: true });
  await fs.writeFile(uploadPath, encoded);
  const verified = await fs.readFile(uploadPath);
  const outputMetadata = await sharp(verified).metadata();
  const width = outputMetadata.autoOrient?.width || outputMetadata.width;
  const height = outputMetadata.autoOrient?.height || outputMetadata.height;
  if (verified.length >= byteLimit || width * height > pixelLimit) throw new Error(`Output violates Cloudinary limit: ${exportName}`);
  const outputHash = hash(verified);
  if (copiedOriginal && outputHash !== originalHash) throw new Error(`Copied original changed: ${exportName}`);
  if (hash(await fs.readFile(sourcePath)) !== originalHash) throw new Error(`Original was modified while exporting: ${file.artistSlug}/${file.filename}`);

  return {
    artistId: file.artistSlug,
    artistName: file.artistName,
    filename: file.filename,
    sourcePath,
    uploadPath,
    originalBytes: original.length,
    bytes: verified.length,
    width,
    height,
    originalWidth: inputWidth,
    originalHeight: inputHeight,
    copiedOriginal,
    quality,
    format: outputMetadata.format,
    resized: width !== inputWidth || height !== inputHeight,
    resizedForBytes,
    originalSha256: originalHash,
    uploadSha256: outputHash,
    originalVerifiedUnchanged: true,
  };
}

async function createQualityComparisons(photos) {
  const qaRoot = path.join(outputRoot, '_qa');
  await fs.mkdir(qaRoot, { recursive: true });
  const samples = ['ayushman', 'chaar-diwari', 'gajendar-verma'].map(artist => photos.find(photo => photo.artistId === artist && !photo.copiedOriginal));
  const metrics = [];
  for (const photo of samples) {
    if (!photo) continue;
    const size = Math.min(600, photo.width, photo.height);
    const region = { left: Math.max(0, Math.round(photo.width * 0.47 - size / 2)), top: Math.max(0, Math.round(photo.height * 0.45 - size / 2)), width: size, height: size };
    const source = await fs.readFile(photo.sourcePath);
    const reference = await processingPipeline(source, { width: photo.width, height: photo.height }).extract(region).removeAlpha().raw().toBuffer();
    const exported = await sharp(photo.uploadPath).extract(region).toColourspace('srgb').removeAlpha().raw().toBuffer();
    let squaredError = 0;
    for (let i = 0; i < reference.length; i++) squaredError += (reference[i] - exported[i]) ** 2;
    const mse = squaredError / reference.length;
    const psnr = mse === 0 ? null : 10 * Math.log10(255 ** 2 / mse);
    const width = size * 2;
    const label = Buffer.from(`<svg width="${width}" height="60"><rect width="100%" height="100%" fill="#151515"/><g fill="#fff" font-family="sans-serif" font-size="17"><text x="14" y="23">SOURCE AT UPLOAD DIMENSIONS — 100% CROP</text><text x="${size + 14}" y="23">UPLOAD COPY — JPEG ${photo.quality}, 4:4:4</text><text x="14" y="47">${photo.artistName} / ${photo.width} × ${photo.height}</text></g></svg>`);
    const comparisonPath = path.join(qaRoot, `quality-comparison-${photo.artistId}.png`);
    const left = await sharp(reference, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer();
    const right = await sharp(exported, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer();
    await sharp({ create: { width, height: size + 60, channels: 3, background: '#151515' } }).composite([{ input: label, top: 0, left: 0 }, { input: left, top: 60, left: 0 }, { input: right, top: 60, left: size }]).png().toFile(comparisonPath);
    metrics.push({ artistId: photo.artistId, filename: photo.filename, quality: photo.quality, comparisonPath, cropSize: size, psnrDb: psnr });
  }
  await fs.writeFile(path.join(qaRoot, 'quality-metrics.json'), JSON.stringify(metrics, null, 2) + '\n');
}

async function main() {
  if (process.argv.includes('--qa-only')) {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    await createQualityComparisons(manifest.photos);
    console.log('Quality comparison crops generated.');
    return;
  }
  const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'));
  await fs.mkdir(outputRoot, { recursive: true });
  const ready = new Map();
  const previous = await fs.readFile(manifestPath, 'utf8').then(JSON.parse).catch(() => ({ photos: [] }));
  for (const photo of previous.photos) {
    const index = inventory.files.findIndex(file => path.resolve(file.inputPath) === photo.sourcePath);
    if (index === -1) continue;
    const output = await fs.readFile(photo.uploadPath).catch(() => null);
    const input = await fs.readFile(photo.sourcePath);
    if (output && hash(output) === photo.uploadSha256 && hash(input) === photo.originalSha256 && output.length < byteLimit) ready.set(index, photo);
  }
  if (ready.size) console.log(`Resuming ${ready.size} verified masters.`);
  const jobs = inventory.files.map((file, index) => ({ file, index })).filter(job => !ready.has(job.index));
  // Copy compliant originals first, so uploads can run while large images are processed.
  jobs.sort((a, b) => Number(a.file.exceeds10MB || a.file.exceeds25MP) - Number(b.file.exceeds10MB || b.file.exceeds25MP) || a.index - b.index);
  const sortedPhotos = () => [...ready.entries()].sort(([a], [b]) => a - b).map(([, photo]) => photo);
  let cursor = 0;
  let checkpoint = Promise.resolve();
  const worker = async () => {
    while (cursor < jobs.length) {
      const { file, index } = jobs[cursor++];
      const photo = await prepare(file);
      ready.set(index, photo);
      const snapshot = sortedPhotos();
      checkpoint = checkpoint.then(() => writeManifest(snapshot, false, inventory.files.length));
      await checkpoint;
      console.log(`${ready.size}/${inventory.files.length} ${photo.artistId}: ${photo.copiedOriginal ? 'original' : `q${photo.quality ?? 'lossless'}`} ${photo.width}x${photo.height} ${(photo.bytes / 1e6).toFixed(2)} MB${photo.resizedForBytes ? ' (size-limited dimensions)' : ''}`);
    }
  };
  await Promise.all([worker(), worker()]);
  await checkpoint;
  const photos = sortedPhotos();
  if (new Set(photos.map(photo => photo.uploadPath.toLowerCase())).size !== photos.length) throw new Error('Sanitized export filename collision');
  await writeManifest(photos, true, inventory.files.length);
  await createQualityComparisons(photos);
  console.log('All upload masters verified; originals unchanged.');
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
