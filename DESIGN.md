---
name: Nimish Kandalkar
description: A black-box screening room for one filmmaker's work. Light, frame, cut.
colors:
  black: "#0a0a09"
  black-lift: "#121211"
  black-shade: "#191917"
  rule: "#2a2926"
  grey-1: "#3b3a36"
  grey-2: "#75746e"
  grey-3: "#a6a59f"
  white: "#eeede8"
  white-2: "#c9c8c1"
  screen: "#000000"
  tungsten: "#ffb46b"
  tungsten-hot: "#ffdcae"
  tungsten-deep: "#b4581a"
typography:
  display:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3.1rem, 7.4vw, 6rem)"
    fontWeight: 540
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  index:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 4.4vw, 4.1rem)"
    fontWeight: 520
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 2.3vw, 2.05rem)"
    fontWeight: 520
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.35rem, 2.35vw, 2.05rem)"
    fontWeight: 420
    lineHeight: 1.22
    letterSpacing: "-0.022em"
  body:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.005em"
    fontFeature: "\"tnum\", \"lnum\""
  label:
    fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 460
    lineHeight: 1.45
    letterSpacing: "0.005em"
    fontFeature: "\"tnum\", \"lnum\""
rounded:
  none: "0"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4.2vw, 72px)"
  section: "clamp(112px, 15vw, 224px)"
  nav: "64px"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.none}"
    padding: "16px 22px"
  button-primary-hover:
    backgroundColor: "{colors.tungsten-hot}"
    textColor: "{colors.black}"
  view-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.grey-3}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  view-toggle-active:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.pill}"
  filter:
    textColor: "{colors.grey-3}"
    typography: "{typography.label}"
    padding: "10px 0"
  filter-active:
    textColor: "{colors.white}"
  nav:
    textColor: "{colors.white}"
    height: "{spacing.nav}"
    padding: "0 {spacing.gutter}"
---

# Design System: Nimish Kandalkar

## Overview

**Creative North Star: "The Black-Box Screening Room"**

The site is a dark projection room for one filmmaker who lights the set, shoots the frame and cuts the film. The page is the black seamless; the work is the only light in it. Everything the visitor sees arrives the way film arrives: a projector warms up, bars part, frames are joined by wipes, irises and dissolves, a shutter closes between pages, and a single warm lamp marks whatever is live.

Density changes with the passage. The hero and the reel are spare and full-screen, one image at a time; the program is dense, fifteen titles set large in rows, with the chosen film projected behind them; the closing is an end card in a beam of light. One sans family carries every voice, set tight, with tabular numerals so runtimes and timecodes align.

This system replaced a white-cyclorama world (white seamless, soft greys, black accents) at the owner's direction: the inversion is confirmed, and the old light palette is not a fallback.

**Key Characteristics:**
- Black ground, print-white type, one tungsten accent used only for live things.
- Frames keep the aspect ratio they were shot in; letterbox and pillarbox bars are data, not decoration.
- Motion is film grammar with a job: reveal, join, cut, focus pull. Never a generic fade-and-rise.
- Square corners everywhere except the two pill controls and the round next-film button.
- Fine silver grain over the whole page, stepping at 10 fps.

## Colors

A restrained, near-monochrome palette of warm blacks and print whites with a single 3200K accent.

### Primary
- **Tungsten** (#ffb46b): the one warm light. Tally lamps beside a playing film, the reel's current segment, the hero's REC lamp, the playhead, the projector's gate light, focus rings, text selection, the filter count of the active category. Never a text colour for content, a button fill, or a surface.
- **Tungsten Hot** (#ffdcae): the hottest part of a light: the gate seam, the wipe's light bar, the primary button's hover.
- **Tungsten Deep** (#b4581a): reserved for the burnt end of the lamp; carried for completeness, rarely used.

### Neutral
- **Black Seamless** (#0a0a09): the page itself and every section background.
- **Black Lift** (#121211): empty frames while media loads; the film base of contact-sheet cells.
- **Black Shade** (#191917): a contact-sheet cell under the pointer.
- **Screen Black** (#000000): the projection itself: letterbox bars, the reel, the shutter, the screen behind a film's still, the end card and end credits.
- **Rule** (#2a2926): hairlines only: index rows, the facts table, the footer, the cell outline.
- **Grey 1** (#3b3a36): decorative strokes: viewfinder corners, the reel-number divider, the scrollbar thumb.
- **Grey 2** (#75746e): large secondary text and edge print only (4.2:1 on black).
- **Grey 3** (#a6a59f): secondary text at body size: meta, timecodes, captions (8:1).
- **Print White 2** (#c9c8c1): long-form secondary copy: ledes, bullet points, captions on frames.
- **Print White** (#eeede8): type, and the single solid button. Print white, never pure white.

### Named Rules
**The One Lamp Rule.** Tungsten appears only where something is live: playing, current, focused or selected. If nothing is happening, nothing is warm.

**The Projection Rule.** Pure black (#000000) belongs to the screen, the bars and the shutter; the page is a breath lighter (#0a0a09) so the projection reads as a surface in the room.

## Typography

**Display Font:** Switzer (with Helvetica Neue, Arial)
**Body Font:** Switzer (with Helvetica Neue, Arial)

**Character:** One self-hosted grotesque throughout, variable weight 400 to 540, tracked tight at display sizes and near-neutral at body size. Hierarchy comes from size and weight steps, never from a second family, italics or case.

### Hierarchy
- **Display** (540, clamp(3.1rem, 7.4vw, 6rem), 0.92): the name in the hero, film titles on their pages and title cards (reel titles run clamp(2.6rem, 7vw, 6rem)).
- **Headline** (500, clamp(2.1rem, 4.4vw, 3.6rem), 1): section headings: The program, Light, frame, cut., Key shots, Credits, the contact heading.
- **Index** (520, clamp(1.9rem, 4.4vw, 4.1rem), 1.02): titles in the program index, set as large as headlines so the list itself is the display.
- **Title** (520, clamp(1.55rem, 2.3vw, 2.05rem), 1.05): sub-headings such as Concept and Role; contact-sheet titles run smaller (up to 1.4rem).
- **Lede** (420, clamp(1.35rem, 2.35vw, 2.05rem), 1.22): loglines on film pages, the about paragraph, calls to action. Max about 30ch.
- **Body** (400, 1.0625rem, 1.55): running copy and bullet points, max 46ch.
- **Label** (460, 0.8125rem, 1.45, +0.005em): meta lines (format · year · runtime · ratio), timecodes, captions, filter counts.

### Named Rules
**The Tight Display Rule.** Anything at display or index size tracks at -0.04em; nothing tracks tighter.

**The Title-First Rule.** A title is never preceded by a label line. Position, format and ratio follow the title in a meta line beneath it.

**The Tabular Rule.** Numerals are tabular and lining everywhere, so timecodes, years and runtimes align in columns.

## Layout

A 12-column grid (column gap clamp(12px, 1.6vw, 28px)) inside a fluid side gutter of clamp(16px, 4.2vw, 72px). Sections are separated by a large rhythm of clamp(112px, 15vw, 224px); headings sit closer to their content than to the section above. The fixed nav is 64px tall.

The home page paces its density: the hero is one 3:1 plate and the name; the reel is a pinned full-screen sequence (100svh, scrolled through about 4.5 screen heights) of one film at a time; the program is a dense list or grid; the process returns to three equal columns; the end card is a single full-height black panel.

Frames are sized by their own ratio: a film's frame is min(100vw, available height × ratio) wide, so scope films get bars above and below and 4:3 films get pillarbox bars at the sides. Inside the contact sheet, each 16:10 cell contains its frame at true ratio using container units.

Breakpoints: 1023px (two-column splits become one), 767px (index rows reflow to title + year over format; the BTS sheet becomes one column), 599px (the hero beats stack into bands; the contact sheet becomes two columns), and a portrait query at max-aspect-ratio 4/5, where screen frames top the screen at 44 to 56svh with the title card beneath.

## Elevation & Depth

The system is flat. There are no drop shadows anywhere; depth comes from light. Surfaces separate by tone (black, black lift, screen black), by hairline rules, and by scrims, gradients from screen black that hold type over a projected frame. Glows exist only on objects that emit light: the tally lamp, the playhead, the gate seam and the wipe's light bar.

### Named Rules
**The Light-Not-Shadow Rule.** Nothing casts a shadow; only lamps glow. A glow on an object that is not a light source is a defect.

**The House Lights Rule.** Any text over a projected frame sits under a scrim (up to rgb(0 0 0 / 0.92) at the base, or 0.9 to 0.3 across the index), and the scrim always paints above the frame, including frames that are mid-transition.

## Shapes

Square corners are the default: frames, cells, buttons, rules and bars are all 0 radius, like film and the gate that projects it. Two exceptions are deliberate: the view toggle is a pill (999px) because it is a switch, not a frame; the next-film button is a 64px circle. Clipping is a material: frames clip their stills, the reel's joins are clip-paths (inset wipes, circular irises), and the projector and shutter are pairs of bars.

## Components

### Buttons
Few and plain: the work is the action.
- **Shape:** square (0).
- **Primary:** print white with black text, 16px 22px, weight 520, an up-right arrow. Used for Watch the film / Request a screener.
- **Hover / Focus:** the fill warms to tungsten hot, the arrow nudges up-right 2px over 500ms; :active scales to 0.985. Focus is a 2px tungsten outline, 4px offset.
- **Secondary:** a text link with a trailing arrow that slides 3px on hover.
- **Underlined action:** the "Open the film" and "Watch" links carry a 1px underline drawn as a background, which wipes away on hover.

### Chips (category filters)
- **Style:** text-only buttons in grey 3, 0.9375rem weight 500, a superscript count in grey 2.
- **State:** the pressed filter turns print white with a 1px underline drawn from the left (500ms) and its count turns tungsten. aria-pressed carries the state.

### View toggle
- A pill track with a 1px rule outline; the active option is a print-white pill with black text. Index and Contact sheet, each with a 14px drawn glyph.

### Navigation
- Name at left, Films · About · Contact at right, 0.9375rem weight 500, print white. Transparent over the hero, screen black at 92% once scrolled; hides on scroll down and returns on scroll up. Links underline from the left on hover. Leaving a film page uses the shutter transition.

### The reel (signature)
- Four films pinned to one screen. Each still sits in a frame at its true ratio on screen black. The first starts scaled to cover the screen and pulls back into its letterbox as the reel settles. Joins are scrubbed by scroll: a wipe with a light bar on its edge, an iris that closes on the old frame and opens on the new, and an overexposed dissolve. A screenplay slug (WIPE TO:, IRIS IN:, DISSOLVE TO:) rides each join. The title card racks into focus (blur and clip reveal, about 1s, staggered) once a join is three-quarters through. Progress is four 2px segments; the current one fills in tungsten.

### The program index (signature)
- Titles at index size in ruled rows with format, year and runtime columns. Reaching for a row (hover, focus, or crossing the middle of a phone screen) projects that film full-bleed behind the list on a sticky screen: the lamp strikes over a few stepped frames, the still pushes in slowly, and after 1.4s it cuts through the key shots. Other rows dim to 32% white; the lit row grows a tally lamp.

### Contact sheet
- Cells of film base (black lift, 1px rule outline) at 16:10 with the frame inside at true ratio, edge-printed with frame number and ratio in grey 2. Hover or play-in-view lights the tally and cuts through key shots.

### Film page header
- The still at true ratio on screen black, the title below it at display size (racks in after the screen comes up), then the meta line: position in the program, category, year, runtime, ratio.

## Do's and Don'ts

### Do:
- **Do** keep every frame at its shot aspect ratio wherever it is shown whole; let bars absorb the difference.
- **Do** join frames with film grammar (cut, wipe, iris, dissolve, shutter, focus pull) and give each section its own gesture rather than one shared entrance.
- **Do** put tungsten (#ffb46b) only on live state: playing, current, focused, selected.
- **Do** give the frame a visitor clicks the film's shared name, so it grows into the page; only one element may wear it at a time.
- **Do** mark every placeholder film as a sample entry wherever it appears.
- **Do** provide a reduced-motion path: joins become cuts, pushes stop, grain freezes, the projector is skipped.

### Don't:
- **Don't** set a label or eyebrow line above a title; meta follows the title.
- **Don't** use drop shadows or glows on anything that is not a light source.
- **Don't** introduce a second typeface, italics for emphasis, or gradient text.
- **Don't** round frames, cells or buttons; the pill toggle and the round next-film button are the only curves.
- **Don't** return to the white-cyc palette or use pure white (#ffffff) for type.
- **Don't** let text sit on a projected frame without a scrim above it.
