---
name: NIMISH.
description: Loud nights. Still frames. A concert archive printed in pink ink on a grain-alive charcoal ground.
colors:
  charcoal: "#191a18"
  pink: "#e8afbf"
  pink-dark: "#c8889c"
  paper: "#dbd4c8"
  muted: "#a9a59c"
  caption: "#d8c4c4"
  stage-red: "#ff3b2a"
typography:
  display:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "clamp(64px, 12.4vw, 228px)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "-0.015em"
  poster:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "28.2vw"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "1px"
  body:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  none: "0px"
  stamp: "50%"
spacing:
  gutter: "clamp(22px, 3.8vw, 76px)"
  gallery-gap: "clamp(10px, 1.1vw, 18px)"
  chapter-top: "clamp(110px, 13vw, 230px)"
components:
  ticket:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.none}"
  button-primary:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 14px"
  button-ghost:
    backgroundColor: "#191a18cc"
    textColor: "{colors.pink}"
    rounded: "{rounded.none}"
    height: "48px"
  stamp:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.stamp}"
    size: "106px"
  booking-stub:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.charcoal}"
    height: "50px"
---

## Overview

A concert photographer's archive that looks like the night it came from: one charcoal ground under a single, constantly moving layer of film grain, pink ink with the grain printed into it, and stage light as the only other colour. The photographs are the proof. They are always shown whole, never tinted, grained, or cropped into ornament. The mood comes from everything around them.

The page runs as one continuous scroll: splash → poster hero → ticket → the Rig → nine artist chapters → close. Every section is transparent over the same ground, so the page never changes material between sections.

## Colors

- **Charcoal `#191a18`** is the only ground. Sections never set their own background; the body paints it, and `body::before` lays one fixed, animated grain layer (`/film-grain.webp`, `mix-blend-mode: overlay`) over it.
- **Pink `#e8afbf`** is the ink: display type, labels that matter, the ticket, stamps, and primary buttons.
- **Paper `#dbd4c8`** is for printed paper pieces (contact print, tape tone) and the dot in `NIMISH.`.
- **Stage red `#ff3b2a`** is light only: haze, beams, the glow behind the live chapter name, the shutter flash. It never colours text or fills a surface. The hottest red belongs to the one element in focus.
- Secondary text is warm-tinted (`#d8c4c4`, `#a9a59c`), never neutral grey.

## Typography

- **Anton** for every display line: the giant poster wordmark, chapter names, the Rig heading, the close. It is always uppercase, with tight leading (0.84–0.94).
- **IBM Plex Mono** for labels, captions, counters, and body copy, tracked out (0.5–1.2px) in uppercase for labels.
- Grain lives inside display type: `.film-type` clips `/film-grain.webp` over `currentColor` with `soft-light`, animated in steps. Outlined words (`STILL FRAMES.`, `LIFE.`, `LET’S TALK.`) stay pure strokes and never take the grain fill.
- Counters change like a departure board (`FlapText`): characters flip and land left to right in fixed cells.

## Layout

- Full-bleed sections with a single `--gutter`. Chapters follow a fixed grammar: title card → three-shot exposure (pinned, about 2.7 viewports) → the artist's whole archive.
- The archive is a justified gallery: each frame keeps its true aspect ratio (`flex-grow` and `flex-basis` proportional to `--ar`, plus `aspect-ratio`). Rows fill the measure, and the last row does not stretch.
- Mobile keeps the same order. The shot stage uses a 92vw × 64svh box, and the gallery's row height becomes 42vw.

## Elevation & Depth

Depth comes from light and distance, not shadows on cards. Receding shots scale down and sink into the dark, frames on the far side of the Rig fade into the ground, and paper pieces (the contact print, the stub) carry one soft, offset drop shadow. No glass and no decorative blur.

## Shapes

Hard rectangles throughout, with no radius. Exceptions come from real objects: circular rubber stamps, perforated ticket edges and notches, torn tape, and the torn paper edge where the splash rips open.

## Components

- **Ticket:** the pink perforated artist index. It is loved and fixed; change content only.
- **Poster hero:** the slideshow behind the type, where each frame arrives as an exposure (a light leak sweeps across and the photo develops from overexposed). The reel has a pause control and a split-flap caption.
- **Three-shot exposure:** a shutter gate opens by scaling while the film inside counter-scales, so the photo is revealed, never distorted. A white-to-red flash fires as it opens, and the previous frame falls back. Gates: horizontal slit, vertical slit, then the full aperture.
- **The Rig:** WebGL2, with every frame on a circular truss in counter-rotating tiers, plus moving-head beams, red floor haze, and a crowd with raised phones. Drag to spin, click to open, keyboard previous/next/open. Its canvas is transparent, so the page's own ground shows through.
- **Lightbox:** native `<dialog>`. It opens with a flight from the clicked crop to the whole frame, then cuts hard between frames.
- **Booking stub:** a fixed pink tear-off ticket. It hides during the splash, while the Rig is playing, and at the close.

## Do's and Don'ts

- **Do** show every photograph whole, at its own aspect ratio, untouched by grain, tint, or overlays once it has settled.
- **Do** keep every section transparent over the one ground.
- **Do** make every motion read as light or a camera: exposure, shutter, flash, develop.
- **Don't** add a second ground colour, a section background, or a pink full-section field.
- **Don't** use speckle or dot textures as grain. Grain is dense and fine, like film stock.
- **Don't** use stage red as ink.
- **Don't** let any splash or loader run past 3 seconds. The boot script enforces a hard cap.
