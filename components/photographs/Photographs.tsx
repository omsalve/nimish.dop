'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Photo } from '@/content/photos';
import { useMedia } from '@/lib/use-media';
import styles from './Photographs.module.css';

// Scroll budget, in screen heights: the strip holds still for a beat once it is
// pinned, and again when the last print arrives. The travel between is 1:1 with
// the scroll, so the prints move exactly as fast as the page would.
const HOLD = 0.2;

// The opening, when the first photograph comes with its layers: it is made in
// front of the visitor before the strip begins. In screen heights of scroll from
// the moment the section reaches the top; the lettering starts a little before,
// while the black is still rising into place.
const OPEN = {
  rack: [-0.4, 0.2], // the lettering racks into focus, alone in the dark
  light: [0.2, 0.95], // the backlight comes up behind him, brightest first
  flash: [1.02, 1.26], // the shutter: one overexposed frame, and it is a print
  settle: [1.32, 1.95], // the print is pulled back onto the strip
} as const;
const OPEN_LEN = OPEN.settle[1];

// The lamp strikes before it holds: the black point over the first steps of the
// light, then an even rise to the full picture.
const STRIKE = [1, 0.84, 0.97, 0.78, 0.9, 0.74];
const STRIKE_LEN = 0.22;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const pad = (n: number) => String(n).padStart(2, '0');
const span = (t: number, [a, b]: readonly [number, number]) => clamp((t - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Levels with the black point at `t`: everything darker than t is held black and
 * the rest is stretched to full range, so as t falls the picture comes up in the
 * order its own light falls on it, the glow behind him first and his face last.
 */
function levels(t: number) {
  if (t >= 0.995) return 'brightness(0)';
  if (t <= 0.001) return '';
  return `brightness(${(1 / (1 + t)).toFixed(4)}) contrast(${((1 + t) / (1 - t)).toFixed(3)})`;
}

const RATIOS: [number, string][] = [
  [1, '1:1'], [4 / 5, '4:5'], [2 / 3, '2:3'], [3 / 4, '3:4'], [5 / 7, '5:7'], [9 / 16, '9:16'],
  [5 / 4, '5:4'], [3 / 2, '3:2'], [4 / 3, '4:3'], [7 / 5, '7:5'], [16 / 9, '16:9'], [1.85, '1.85:1'], [2.39, '2.39:1'],
];

/** The shape of a print as a photographer would say it: 4:5, 3:2, 1:1. */
function ratioLabel(r: number) {
  const hit = RATIOS.find(([v]) => Math.abs(v - r) / v < 0.015);
  return hit ? hit[1] : `${r.toFixed(2)}:1`;
}

/**
 * Photographs: Nimish's own stills on one long strip, pinned to the screen
 * like the reel above it. The first print sits at the right and scrolling down
 * carries the strip from left to right; each print comes up out of the dark as
 * it enters, the way a print comes up in the tray.
 *
 * When the first photograph comes with its layers, the section opens on it:
 * its lettering racks into focus in the dark, the light comes up behind him and
 * the lettering turns against it, a shutter fires, and the finished print is
 * pulled back into its place at the head of the strip.
 */
export function Photographs({ title, intro, photos }: { title: string; intro: string; photos: Photo[] }) {
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const still = useMedia('(prefers-reduced-motion: reduce)');
  const opens = Boolean(photos[0]?.reveal) && !still;

  // the prints are heavy: fetch them only once the section is a couple of screens away
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: '200% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const pin = el.querySelector<HTMLElement>('[data-pin]')!;
    const port = el.querySelector<HTMLElement>('[data-port]')!;
    const track = el.querySelector<HTMLElement>('[data-track]')!;
    const prints = Array.from(track.querySelectorAll<HTMLElement>('[data-print]'));
    const shades = prints.map((p) => p.querySelector<HTMLElement>('[data-shade]')!);
    const pictures = prints.map((p) => p.querySelector<HTMLElement>('[data-picture]')!);
    const segs = Array.from(el.querySelectorAll<HTMLElement>('[data-seg]'));
    const counter = el.querySelector<HTMLElement>('[data-count]')!;

    // the opening's layers, when the first print has them
    const head = prints[0];
    const plate = head?.querySelector<HTMLElement>('[data-plate]');
    const type = head?.querySelector<HTMLElement>('[data-type]');
    const lead =
      plate && type
        ? {
            frame: head.querySelector<HTMLElement>('[data-frame]')!,
            plate,
            type,
            print: head.querySelector<HTMLElement>('[data-poster]')!,
            flash: head.querySelector<HTMLElement>('[data-flash]')!,
            picture: pictures[0],
          }
        : null;

    // only write a style when it changes: most frames of the strip leave the opening alone
    const written = new Map<string, string>();
    const put = (node: HTMLElement, key: string, prop: string, value: string) => {
      if (written.get(key) === value) return;
      written.set(key, value);
      node.style.setProperty(prop, value);
    };

    let raf = 0;
    let travel = 0;
    let inset = 0;
    let lastX = 0;
    let boxes: { left: number; width: number }[] = [];
    let leadBox = { left: 0, top: 0, width: 1, height: 1 };
    let lastOn = -1;

    const measure = () => {
      // measure the strip at rest: the opening print, blown up to the screen, would widen it
      if (lead) {
        lead.frame.style.transform = '';
        written.delete('frame');
      }
      boxes = prints.map((p) => ({ left: p.offsetLeft, width: p.offsetWidth }));
      inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      travel = Math.max(0, track.scrollWidth - port.clientWidth);
      el.style.setProperty('--travel', `${Math.round(travel)}px`);
      if (lead) {
        // where the first print rests on the strip, net of the strip's own travel
        const p = pin.getBoundingClientRect();
        const f = lead.frame.getBoundingClientRect();
        leadBox = { left: f.left - p.left - lastX, top: f.top - p.top, width: f.width, height: f.height };
      }
    };

    const clearLead = () => {
      if (!lead) return;
      written.clear();
      el.style.removeProperty('--settle');
      lead.frame.style.transform = '';
      lead.picture.style.filter = '';
      // next/image keeps its own inline styles on these, so take back only ours
      for (const prop of ['filter', 'opacity', 'transform', 'visibility']) {
        lead.plate.style.removeProperty(prop);
        lead.type.style.removeProperty(prop);
      }
      lead.print.style.opacity = '';
      lead.flash.style.opacity = '';
    };

    /** The opening, scrubbed by `t`, in screen heights past the section's top. Returns how settled it is. */
    const open = (t: number, x: number) => {
      if (!lead) return 1;
      const vw = pin.clientWidth;
      const vh = pin.clientHeight;

      // the lettering, alone in the dark: out of focus, then racked sharp
      const r = span(t, OPEN.rack);
      const re = easeOut(r);
      put(lead.type, 'type-o', 'opacity', clamp(r * 1.8).toFixed(3));
      put(lead.type, 'type-f', 'filter', re >= 1 ? 'none' : `blur(${(14 * (1 - re)).toFixed(2)}px)`);
      put(lead.type, 'type-t', 'transform', re >= 1 ? 'none' : `scale(${(1 + 0.06 * (1 - re)).toFixed(4)})`);

      // the light comes up behind him: a few stepped strikes, then an even rise.
      // The lettering is laid in exclusion, so it turns dark wherever the light reaches it.
      const l = span(t, OPEN.light);
      const black =
        l <= 0 ? 1 : l < STRIKE_LEN ? STRIKE[Math.floor((l / STRIKE_LEN) * STRIKE.length)] : STRIKE[STRIKE.length - 1] * (1 - easeInOut((l - STRIKE_LEN) / (1 - STRIKE_LEN)));
      put(lead.plate, 'plate-f', 'filter', levels(black));

      // the shutter: a frame of overexposure, and under it the layers become the print
      const f = span(t, OPEN.flash);
      const burst = f > 0 && f < 1 ? Math.sin(Math.PI * f) : 0;
      const made = f >= 0.5;
      put(lead.flash, 'flash', 'opacity', (Math.pow(burst, 1.6) * 0.92).toFixed(3));
      put(lead.picture, 'burst', 'filter', burst > 0 ? `brightness(${(1 + burst * 2.4).toFixed(3)})` : '');
      put(lead.print, 'print', 'opacity', made ? '1' : '0');
      put(lead.plate, 'plate-v', 'visibility', made ? 'hidden' : 'visible');
      put(lead.type, 'type-v', 'visibility', made ? 'hidden' : 'visible');

      // the print is pulled back from the full height of the screen into its place on the strip
      const settle = easeInOut(span(t, OPEN.settle));
      const q = 1 - settle;
      const { left, top, width, height } = leadBox;
      const scale = Math.min(vh / height, vw / width);
      const dx = vw / 2 - (left + x + width / 2);
      const dy = vh / 2 - (top + height / 2);
      put(
        lead.frame,
        'frame',
        'transform',
        q <= 0 ? '' : `translate3d(${(dx * q).toFixed(2)}px, ${(dy * q).toFixed(2)}px, 0) scale(${(1 + (scale - 1) * q).toFixed(4)})`,
      );
      put(el, 'settle', '--settle', settle.toFixed(3));
      return settle;
    };

    const paint = () => {
      raf = 0;
      if (motion.matches) {
        track.style.transform = '';
        lastX = 0;
        prints.forEach((_, k) => {
          shades[k].style.opacity = '';
          pictures[k].style.transform = '';
        });
        clearLead();
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = port.clientWidth;
      const hold = HOLD * vh;
      const opening = lead ? OPEN_LEN * vh : 0;
      const s = clamp((-rect.top - opening - hold) / Math.max(1, rect.height - vh - opening - hold * 2));
      // the prints are laid out last to first, so the strip starts at its right
      // end (the first print) and is carried rightwards
      const x = -(1 - s) * travel;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      lastX = x;

      const settle = open(-rect.top / vh, x);

      // a reading line sweeps the screen against the strip, right to left, so
      // the first print and the last each get their turn as the current one
      const line = vw - inset - s * (vw - inset * 2);
      let on = 0;
      for (let k = 0; k < prints.length; k++) {
        const { left: l0, width } = boxes[k];
        const left = l0 + x;
        if (left + width >= line) on = k;
        // the print comes up out of the dark across its own width as it enters
        // from the left, slowly at first, like an image surfacing in the developer;
        // while the opening plays, the rest of the strip waits in the dark
        const up = Math.pow(clamp((left + width) / width), 1.5) * (lead && k > 0 ? settle : 1);
        shades[k].style.opacity = (1 - up).toFixed(3);
        // and the picture drifts a touch against the travel, a slow pan inside the frame
        const c = clamp((left + width / 2 - vw / 2) / vw, -1, 1) * (lead && k === 0 ? settle : 1);
        pictures[k].style.transform = `translate3d(${(c * -3.5).toFixed(3)}%, 0, 0) scale(1.08)`;
      }

      for (let k = 0; k < segs.length; k++) {
        const fill = k < on ? 1 : k > on ? 0 : clamp((boxes[k].left + x + boxes[k].width - line) / boxes[k].width);
        segs[k].style.setProperty('--fill', fill.toFixed(3));
      }

      if (on !== lastOn) {
        lastOn = on;
        prints.forEach((p, k) => p.toggleAttribute('data-on', k === on));
        segs.forEach((seg, k) => seg.toggleAttribute('data-on', k === on));
        counter.textContent = pad(on + 1);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onResize = () => {
      measure();
      cancelAnimationFrame(raf);
      paint();
    };

    measure();
    paint();
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    ro.observe(port);
    window.addEventListener('scroll', onScroll, { passive: true });
    motion.addEventListener('change', onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      motion.removeEventListener('change', onResize);
      clearLead();
    };
  }, [photos.length, opens]);

  return (
    <section
      ref={root}
      id="photographs"
      className={styles.photographs}
      style={opens ? ({ '--open': OPEN_LEN } as CSSProperties) : undefined}
      aria-labelledby="photographs-title"
    >
      <div className={styles.pin} data-pin>
        <header className={`grid12 ${styles.head}`}>
          <h2 id="photographs-title" className={`t-section ${styles.heading}`}>
            {title}
          </h2>
          <p className={styles.intro}>{intro}</p>
        </header>

        <div
          className={styles.port}
          data-port
          role={still ? 'region' : undefined}
          aria-label={still ? `${title}, scroll sideways` : undefined}
          tabIndex={still ? 0 : undefined}
          data-lenis-prevent={still ? '' : undefined}
        >
          <ol className={styles.track} data-track>
            {photos.map((photo, k) => (
              <Print key={photo.src.src} photo={photo} index={k} count={photos.length} load={near} opens={opens && k === 0} />
            ))}
          </ol>
        </div>

        <div className={styles.chrome} aria-hidden="true">
          <ol className={styles.progress}>
            {photos.map((photo, k) => (
              <li key={photo.src.src} className={styles.seg} data-seg data-on={k === 0 ? '' : undefined} />
            ))}
          </ol>
          <p className={styles.count}>
            <span data-count>01</span>
            <span className={styles.of}> / {pad(photos.length)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Print({ photo, index, count, load, opens }: { photo: Photo; index: number; count: number; load: boolean; opens: boolean }) {
  const ratio = photo.src.width / photo.src.height;
  const reveal = opens ? photo.reveal : undefined;
  // the frame is min(strip height × ratio, 84vw) wide; a 16:10 screen gives the desktop guess.
  // The opening print fills the height of the screen first, so it asks for that.
  const sizes = reveal
    ? `(max-aspect-ratio: ${Math.round(ratio * 1000)}/1000) 100vw, (max-aspect-ratio: 1/1) ${Math.round(ratio * 100)}vw, (max-aspect-ratio: 4/3) ${Math.round(ratio * 75)}vw, ${Math.round(ratio * 62.5)}vw`
    : `(max-aspect-ratio: 4/5) ${Math.round(Math.min(84, 90 * ratio))}vw, ${Math.round(Math.min(84, 34 * ratio))}vw`;
  const loading = load ? 'eager' : 'lazy';

  return (
    <li
      className={styles.print}
      data-print
      data-on={index === 0 ? '' : undefined}
      data-lead={reveal ? '' : undefined}
      style={{ '--ratio': ratio } as CSSProperties}
    >
      <figure className={styles.figure}>
        <div className={styles.frame} data-frame>
          <div className={styles.picture} data-picture>
            {reveal && (
              <>
                <Image src={reveal.plate} alt="" fill sizes={sizes} quality={85} loading={loading} className={`${styles.image} ${styles.plate}`} data-plate />
                <Image src={reveal.type} alt="" fill sizes={sizes} quality={85} loading={loading} className={`${styles.image} ${styles.type}`} data-type />
              </>
            )}
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={sizes}
              quality={reveal ? 85 : undefined}
              placeholder="blur"
              loading={loading}
              className={styles.image}
              data-poster={reveal ? '' : undefined}
            />
          </div>
          {reveal && <span className={styles.flash} data-flash aria-hidden="true" />}
          <span className={styles.shade} data-shade aria-hidden="true" />
        </div>
        <figcaption className={styles.caption}>
          <span className={styles.edge} aria-hidden="true">
            <span>{pad(index + 1)}</span>
            <span>{ratioLabel(ratio)}</span>
          </span>
          <span className={styles.title}>
            <span className={`tally ${styles.lamp}`} aria-hidden="true" />
            {photo.title}
          </span>
          <span className={styles.meta}>
            {[photo.place, photo.year].filter(Boolean).join(', ')}
            {photo.placeholder && <span className={styles.sample}> · Sample</span>}
            <span className="sr-only">
              {' '}
              (photograph {index + 1} of {count})
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}
