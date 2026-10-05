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

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const pad = (n: number) => String(n).padStart(2, '0');

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
 */
export function Photographs({ title, intro, photos }: { title: string; intro: string; photos: Photo[] }) {
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const still = useMedia('(prefers-reduced-motion: reduce)');

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
    const port = el.querySelector<HTMLElement>('[data-port]')!;
    const track = el.querySelector<HTMLElement>('[data-track]')!;
    const prints = Array.from(track.querySelectorAll<HTMLElement>('[data-print]'));
    const shades = prints.map((p) => p.querySelector<HTMLElement>('[data-shade]')!);
    const pictures = prints.map((p) => p.querySelector<HTMLElement>('[data-picture]')!);
    const segs = Array.from(el.querySelectorAll<HTMLElement>('[data-seg]'));
    const counter = el.querySelector<HTMLElement>('[data-count]')!;
    let raf = 0;
    let travel = 0;
    let inset = 0;
    let boxes: { left: number; width: number }[] = [];
    let lastOn = -1;

    const measure = () => {
      boxes = prints.map((p) => ({ left: p.offsetLeft, width: p.offsetWidth }));
      inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      travel = Math.max(0, track.scrollWidth - port.clientWidth);
      el.style.setProperty('--travel', `${Math.round(travel)}px`);
    };

    const paint = () => {
      raf = 0;
      if (motion.matches) {
        track.style.transform = '';
        prints.forEach((_, k) => {
          shades[k].style.opacity = '';
          pictures[k].style.transform = '';
        });
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = port.clientWidth;
      const hold = HOLD * vh;
      const s = clamp((-rect.top - hold) / Math.max(1, rect.height - vh - hold * 2));
      // the prints are laid out last to first, so the strip starts at its right
      // end (the first print) and is carried rightwards
      const x = -(1 - s) * travel;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;

      // a reading line sweeps the screen against the strip, right to left, so
      // the first print and the last each get their turn as the current one
      const line = vw - inset - s * (vw - inset * 2);
      let on = 0;
      for (let k = 0; k < prints.length; k++) {
        const { left: l0, width } = boxes[k];
        const left = l0 + x;
        if (left + width >= line) on = k;
        // the print comes up out of the dark across its own width as it enters
        // from the left, slowly at first, like an image surfacing in the developer
        const up = Math.pow(clamp((left + width) / width), 1.5);
        shades[k].style.opacity = (1 - up).toFixed(3);
        // and the picture drifts a touch against the travel, a slow pan inside the frame
        const c = clamp((left + width / 2 - vw / 2) / vw, -1, 1);
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
      onScroll();
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
    };
  }, [photos.length]);

  return (
    <section ref={root} id="photographs" className={styles.photographs} aria-labelledby="photographs-title">
      <div className={styles.pin}>
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
              <Print key={photo.src.src} photo={photo} index={k} count={photos.length} load={near} />
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

function Print({ photo, index, count, load }: { photo: Photo; index: number; count: number; load: boolean }) {
  const ratio = photo.src.width / photo.src.height;
  // the frame is min(strip height × ratio, 84vw) wide; a 16:10 screen gives the desktop guess
  const sizes = `(max-aspect-ratio: 4/5) ${Math.round(Math.min(84, 90 * ratio))}vw, ${Math.round(Math.min(84, 34 * ratio))}vw`;

  return (
    <li className={styles.print} data-print data-on={index === 0 ? '' : undefined} style={{ '--ratio': ratio } as CSSProperties}>
      <figure className={styles.figure}>
        <div className={styles.frame}>
          <div className={styles.picture} data-picture>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={sizes}
              placeholder="blur"
              loading={load ? 'eager' : 'lazy'}
              className={styles.image}
            />
          </div>
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
            {photo.place}, {photo.year}
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
