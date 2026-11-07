---
name: NIMISH.
description: I shoot concerts. A concert archive printed in white ink on a pure black ground.
colors:
  ground: "#000000"
  ink: "#f2f2f2"
  ink-dim: "#9d9d9d"
  paper: "#d5d5d5"
  muted: "#a5a5a5"
  caption: "#c9c9c9"
  stage-light: "#ffffff"
typography:
  display:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "clamp(64px, 12.4vw, 228px)"
    fontWeight: 400
    lineHeight: 0.93
    letterSpacing: "-0.015em"
  poster:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "calc((100cqw - 2 * var(--gutter)) * 0.3083)"
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
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 14px"
  button-ghost:
    backgroundColor: "#111111cc"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "48px"
  stamp:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.stamp}"
    size: "106px"
  booking-stub:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    height: "50px"
---

## Overview

A concert photographer's archive that looks like the night it came from: one pure black ground with no texture, white ink with film grain printed into it, and white stage light. The interface is strictly black and white; the photographs are the only colour on the page. The photographs are the proof. They are always shown whole, never tinted, grained, or cropped into ornament. The mood comes from everything around them.

The page runs as one continuous scroll: splash → poster hero → the Rig → ticket → nine artist chapters → close (with the booking form). Every section is transparent over the same ground, so the page never changes material between sections.

## Colors

- **Black `#000000`** is the only ground: pure black with no grain or noise on it (user decision, 2026-11-04). Sections never set their own background; the body paints it. Gradients that fade into the ground (hero shade, Rig edges, splash vignette) fade to `#000`.
- **White `#f2f2f2`** is the ink, kept just below pure white so the grain printed into type still shows: display type, labels that matter, the ticket, stamps, and primary buttons.
- **Paper `#d5d5d5`** is for printed paper pieces (contact print, tape tone) and the dot in `NIMISH.`.
- **Stage light `#ffffff`** is light only: haze, beams, the glow behind the live chapter name, the shutter flash. It never colours text or fills a surface. The brightest light belongs to the one element in focus.
- Secondary text is neutral grey (`#c9c9c9`, `#a5a5a5`). Nothing in the interface carries a hue.

## Typography

- **Anton** for every display line: the giant poster wordmark, chapter names, the Rig heading, the close. It is always uppercase, with tight leading (0.92–0.94). Its capitals stand 0.86em tall, so anything below 0.9 fuses two lines together.
- **IBM Plex Mono** for labels, captions, counters, and body copy, tracked out (0.5–1.2px) in uppercase for labels.
- Grain lives inside display type: `.film-type` clips `/film-grain.webp` over `currentColor` with `soft-light`, animated in steps. Outlined words (`STILL FRAMES.`, `LIFE.`, `LET’S TALK.`) stay pure strokes and never take the grain fill.
- Counters change like a departure board (`FlapText`): characters flip and land left to right in fixed cells.

## Layout

- Full-bleed sections with a single `--gutter`. Chapters follow a fixed grammar: title card → three-shot exposure (pinned, about 2.7 viewports) → the artist's whole archive.
- The archive is a justified gallery: each frame keeps its true aspect ratio (`flex-grow` and `flex-basis` proportional to `--ar`, plus `aspect-ratio`). Rows fill the measure, and the last row does not stretch.
- Mobile keeps the same order. The shot stage uses a 92vw × 64svh box, and the gallery's row height becomes 42vw.
- The poster wordmark fills gutter to gutter, so its height follows the width. Everything above it (copy, print, stamp, note) is placed against its top edge, `--band-end`, never by a share of the poster alone; the poster grows (`--fit`) when a wide, short window cannot hold both. Add new poster pieces the same way.
- Phones on their side (`orientation: landscape` and `max-height: 500px`) get their own composition: copy and print share the first view, the Rig keeps its height, and the lightbox moves its caption to a side rail so the photograph gets the full height.
- Small mono labels on the poster and around the chapters scale with `--fs` on screens 1800px and wider. The gutter clears the notch through `--safe-x`.

## Elevation & Depth

Depth comes from light and distance, not shadows on cards. Receding shots scale down and sink into the dark, frames on the far side of the Rig fade into the ground, and paper pieces (the contact print, the stub) carry one soft, offset drop shadow. No glass and no decorative blur.

## Shapes

Hard rectangles throughout, with no radius. Exceptions come from real objects: circular rubber stamps, perforated ticket edges and notches, torn tape, and the torn paper edge where the splash rips open.

## Components

- **Ticket:** the white perforated artist index. It is loved and fixed; change content only.
- **Poster hero:** the slideshow behind the type, where each frame arrives as an exposure (a light leak sweeps across and the photo develops from overexposed). The reel has a pause control and a split-flap caption.
- **Three-shot exposure:** a shutter gate opens by scaling while the film inside counter-scales, so the photo is revealed, never distorted. A white flash fires as it opens, and the previous frame falls back. Gates: horizontal slit, vertical slit, then the full aperture.
- **The Rig:** WebGL2, with every frame on a circular truss in counter-rotating tiers, plus moving-head beams, floor haze, and a crowd with raised phones. Drag to spin, click to open, keyboard previous/next/open. Its canvas is transparent, so the page's own ground shows through.
- **Lightbox:** native `<dialog>`. It opens with a flight from the clicked crop to the whole frame, then cuts hard between frames.
- **Booking stub:** a fixed white tear-off ticket. It hides during the splash, while the Rig is playing, and at the close.
- **Back stub:** the booking stub mirrored, fixed top left, returning to the ticket. It shows once the ticket has scrolled off and hides at the close, so it only appears in the chapters.
- **Booking form:** in the close. Fields are white ink on the ground with a single rule beneath; errors are ink, never red. The send button is the perforated white stub; a sent enquiry turns into a stamped receipt.
- **Social buttons:** Instagram, Behance and WhatsApp as 46px square ink-ruled icon buttons (Simple Icons glyphs), inverted on hover. They sit beside the hero CTA and under the facts in the close.

## Do's and Don'ts

- **Do** show every photograph whole, at its own aspect ratio, untouched by grain, tint, or overlays once it has settled. That includes the hero slideshow.
- **Do** keep every section transparent over the one ground.
- **Do** make every motion read as light or a camera: exposure, shutter, flash, develop.
- **Don't** add a second ground colour, a section background, or a white full-section field.
- **Don't** use speckle or dot textures as grain. Grain is dense and fine, like film stock.
- **Don't** use stage light as ink, or bring colour into the interface.
- **Don't** let any splash or loader run past 3 seconds. The boot script enforces a hard cap.
