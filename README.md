# Nimish Kandalkar: portfolio

A portfolio for Nimish Kandalkar (filmmaker, director, editor), built as a black-box screening room. A projector warms up and the three-beat hero reveals (light, frame, cut). A four-film reel cuts between films with scroll-scrubbed wipes, irises and dissolves. Then a strip of photographs is pinned the same way and carried left to right by the scroll. Below it, the program lists every film.

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (tokens only; styles are CSS modules), and Lenis for smooth scrolling.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Add `?reveal` to the home page URL to replay the projector and hero reveal (they normally play once per browser session).

## Where things live

| What | Where |
|---|---|
| Name, roles, tagline, Instagram, email, about copy | `content/site.ts` |
| Every film: facts, copy, images, reel position | `content/projects.ts` |
| The photographs strip: heading, intro, every photograph | `content/photos.ts` |
| Images (stills, key shots, BTS, hero) | `content/media/` |
| Silent preview loops | `public/media/<slug>/preview.mp4` |
| Palette, grain, page transitions | `app/globals.css` |
| The visual system, written down | `DESIGN.md`, plus `/style-guide` on the running site |
| Product brief | `PRODUCT.md` |

## Adding or replacing a film

Each film is one entry in `content/projects.ts`, in program order (newest first). "Next film" follows the same order.

1. Make a folder `content/media/<slug>/` with:
   - `still.jpg`: the defining frame, at the film's own aspect ratio, at least 2400px wide.
   - `shot-1.jpg`, `shot-2.jpg`, `shot-3.jpg`: key shots in story order, same ratio.
   - `bts-1.jpg` to `bts-3.jpg`: behind-the-scenes frames, 3:2, at least 1800px wide.
2. Import them at the top of `content/projects.ts`, as the existing films do.
3. Fill in the entry. Notes on a few fields:
   - `ratio` is width ÷ height of the still (e.g. `2400 / 1004` for 2.39:1). It decides the letterbox in the reel and the frame on the film's page.
   - `category` is one of `brand`, `music`, `fiction`, `documentary`, `experimental`. It drives the program filters.
   - `reel: 1`–`4` puts a film in the reel at that position. Exactly four films should have it. The reel's joins run in order (wipe, iris, dissolve), and films of different aspect ratios make the bars change shape between them.
   - `film: { url }` links the full film (Vimeo or YouTube). Without it the page offers "Request a screener", which goes to email when one is set, otherwise to Instagram.
   - Remove `placeholder: true` once an entry is real. Placeholders show a "Sample" or "Sample entry" mark everywhere and are kept out of search engines and the sitemap.

All fifteen films that ship are sample entries with generated art. Replace or delete them before launch.

## Preview loops

Put a 6–10 second silent loop at `public/media/<slug>/preview.mp4` (H.264, CRF about 23, faststart, under 2.5 MB, 1280px wide at the film's ratio; an optional `preview.webm` alongside). Then add it to the film's entry:

```ts
preview: { mp4: '/media/salt/preview.mp4', webm: '/media/salt/preview.webm' },
```

The loop plays in the reel, behind the index and in the contact sheet, and behind the title on the film's page. Without one, previews cut between the still and the key shots.

## Photographs

The strip after the reel shows Nimish's own photographs, separate from the films. It ships with twelve generated sample prints in `content/media/photos/`, each marked "Sample".

1. Put each photograph in `content/media/photos/`, at least 2000px on its long side. Any shape works (4:5, 2:3, 3:2, 1:1); the strip sets every print to the same height, so the widths follow the shape. Mixing shapes reads best.
2. Import it at the top of `content/photos.ts` and add an entry in the order it should appear: `title`, `place`, `year` and an `alt` description.
3. Remove `placeholder: true` once an entry is real, and confirm or rewrite the intro line there.

The scroll length adjusts itself to however many photographs there are. With reduced motion turned on, the strip is an ordinary sideways scroller instead.

## The hero photograph

`content/media/hero/set.jpg` is a drawn placeholder. Replace it with one wide frame of Nimish:
- 3:1, at least 3840 × 1280.
- On a **black** backdrop, with each beat in its own pool of light: lighting a set (left), behind the camera (centre, sharpest, the one tungsten key), at the edit desk (right).
- The frame's edges should fall off to black so they melt into the page.

The reveal splits it into thirds on its own. On phones each third shows as a band; adjust the `focusY` values in `content/site.ts` if a beat sits high or low.

## Regenerating the placeholder art

```bash
node scripts/placeholders/generate.mjs           # everything
node scripts/placeholders/generate.mjs hero      # just the hero
node scripts/placeholders/generate.mjs <slug>    # one film
```

Scenes are drawn in `scripts/placeholders/scenes.mjs` (films 1–6) and `scenes-2.mjs` (films 7–15). Nothing here runs at build time.

## Before launch

- [ ] Replace the sample films with real ones, and remove `placeholder: true`.
- [ ] Shoot and drop in the real hero photograph (black backdrop, see above).
- [ ] Set `email` in `content/site.ts`. Until then every contact action points to Instagram.
- [ ] Confirm the about and process copy in `content/site.ts`, drafted from the brief.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production URL (used for canonical links and share cards).
- [ ] Keep the repository private: Switzer's licence (`app/fonts/Switzer-LICENSE.txt`) does not allow redistributing the font files.

## Motion and accessibility

Every animation has a reduced-motion path. The projector is skipped, the reel's joins become straight cuts, pushes and grain stop, and page transitions are instant. Browsers without View Transitions or scroll-driven animations get the same content without the transitions.
