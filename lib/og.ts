import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

/** Switzer, as TTF, for share-card rendering (the WOFF2 files serve the site). */
export async function ogFonts() {
  const [medium, regular] = await Promise.all([
    readFile(join(root, 'app/fonts/Switzer-Medium.ttf')),
    readFile(join(root, 'app/fonts/Switzer-Regular.ttf')),
  ]);
  return [
    { name: 'Switzer', data: medium, style: 'normal' as const, weight: 500 as const },
    { name: 'Switzer', data: regular, style: 'normal' as const, weight: 400 as const },
  ];
}

/** A JPEG from content/media as a data URI, or null when it is not there. */
export async function ogImage(...segments: string[]) {
  try {
    const data = await readFile(join(root, 'content/media', ...segments));
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  } catch {
    return null;
  }
}
