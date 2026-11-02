# NIMISH. — Loud Nights. Still Frames.

A concert photography portfolio built with Next.js 16, React 19, CSS, and a dependency-free WebGL2 set piece. One charcoal ground under a moving layer of film grain, pink ink with the grain printed into it, a perforated concert ticket, and all 101 photographs shown whole. The design system is recorded in `DESIGN.md`, and product facts in `PRODUCT.md`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build` followed by `npm start`. Run `npm run lint` for ESLint.

## Make it yours

- Update the ticket artist names in `app/lib/artists.ts`.
- The gallery is generated from `app/lib/cloudinary-photos.json`; keep accurate alt text and artist IDs for every frame.
- Choose each artist's three exposure frames, the hero slideshow, and the handwritten asides in `app/lib/curation.ts`. The keepsake print is in `app/lib/cloudinary-featured.json`.
- **Replace the sample contact email** (`hello@nimish.photo`) in `app/components/closing.tsx`. The ticket's contact strip uses the same constant.
- Set `NEXT_PUBLIC_SITE_URL` to your deployed URL for social sharing images. Vercel's production domain is detected automatically.

The original Unsplash demonstration assets remain in `public/images/` but are not displayed; their attribution remains in `public/images/manifest.json`. Anton and IBM Plex Mono are self-hosted, with their SIL Open Font Licenses in `public/fonts/`.

## Cloudinary images

All 101 supplied photographs are uploaded to Cloudinary under `nimish/artists/<artist-id>`. The public gallery data contains only delivery URLs, dimensions, filenames, artist IDs, and alt text. No credentials are needed by the deployed frontend.

All displayed portfolio photographs use `app/components/portfolio-image.tsx`. It generates responsive image variants directly on Cloudinary with `c_limit,w_<width>/q_auto:best/f_auto`. The less aggressive `auto:best` setting prioritizes photographic quality. Existing `sizes`, lazy loading, and hero preload behavior are preserved. Contact sheets preserve each frame's aspect ratio, and the lightbox shows the complete image. Repeated shutter images share their source with the corresponding gallery photograph.

Original files stay untouched outside the repository. Already-compliant files are copied byte-for-byte. Larger files use JPEG quality 95–98, 4:4:4 chroma, embedded sRGB, and only enough resizing to meet the Free plan's **10 MB per image / 25 MP processing** limits. There is no cropping or sharpening of upload masters. Generated masters, source inventory, curation notes, and resumable upload records are local files under ignored `.artifacts/`.

Local maintenance scripts:

```bash
node scripts/prepare-cloudinary.cjs
node scripts/upload-cloudinary.cjs
node scripts/build-cloudinary-gallery.cjs
```

The preparation script consumes `.artifacts/cloudinary-inventory.json`; the gallery builder also consumes `.artifacts/photo-curation.json`. Keep these local records to repeat the import. Uploads load `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from ignored `.env.local`. Upload filenames include a content hash, existing remote assets are never overwritten, and completed uploads are checkpointed so an interrupted run can resume. No secret is written into the upload records or public gallery JSON.

The Free plan currently has **25 shared credits** for storage, bandwidth, and transformations combined. A credit is 1 GB of storage, 1 GB of image bandwidth, or 1,000 transformations. Originals and generated variants use storage; delivered images use bandwidth. Watch the Cloudinary dashboard as traffic grows. See [plan limits](https://cloudinary.com/pricing/compare-plans), [credit accounting](https://cloudinary.com/documentation/billing_and_plans), and [image optimization](https://cloudinary.com/documentation/image_optimization).

## How the page works

**Splash (`app/components/splash.tsx`).** An inline boot script (`app/lib/boot.ts`) starts downloading a ~25 KB preview of all 101 frames while the HTML is still parsing. The splash counts them in on a contact-sheet mosaic, then tears open onto the hero. It never runs past 3 seconds: the boot script enforces a hard cap that does not depend on React hydrating. The same previews then serve as instant placeholders under every photo, as the opening shot of the viewer, and as the Rig's textures, so full-quality images can load just ahead of the scroll without any slot ever showing blank. Return visits in the same session get a short version.

**Hero.** The poster composition is unchanged. Behind the type, a slideshow brings in each frame as an exposure: a light leak sweeps across and the photo develops out of it. The slideshow pauses offscreen, and its pause button sits in the bottom rail. Reduced motion starts it paused.

**The Rig (`app/components/rig.tsx`, `app/lib/rig-gl.ts`).** Directly after the ticket, every frame hangs on a circular lighting truss in counter-rotating tiers, with moving-head beams and haze. Scrolling runs a "light check" and dollies in; drag spins it; click opens a frame; arrow buttons and Open Frame work from the keyboard. It is plain WebGL2 in one transparent canvas:

- it renders only while on screen;
- the pixel ratio is capped, and resolution steps down automatically if frame time climbs;
- textures are the splash previews;
- browsers without WebGL2 get a strip of every frame instead.

**Artist chapters (`app/components/chapters.tsx`).** Each artist has a title card, then a pinned three-shot exposure. Each frame opens whole through a shutter gate with a burst of light (the gate scales while the film counter-scales, so photos are never distorted or cropped). Then comes the artist's whole archive in a justified gallery at true aspect ratios. Those galleries are the 101 home slots; the three-shot sequence is a reprise and is hidden from assistive technology.

**Motion (`app/components/page-motion.tsx`, `app/lib/director.ts`).** One clock advances Lenis and the director. Layout is measured on resize only; scrolling writes transforms and opacity. Reduced motion turns off smoothing and pinning, and shows the three shots as a static row.

**Viewer.** Every photograph opens in a native modal dialog. The opening shot flies from the exact crop you clicked to the whole frame; moving between frames is a hard cut with a split-flap counter. Arrow keys, Escape, swipe, and focus return all work.

**Assets.** `node scripts/generate-film-grain.cjs` renders `public/film-grain.webp` (it uses the local Playwright Chromium). `node scripts/generate-torn-edges.cjs` renders the splash's torn edge and the crowd silhouette under the Rig.
