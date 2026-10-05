'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLenis } from 'lenis/react';
import type { Project } from '@/content/projects';
import { arm, useArmed } from '@/lib/morph';
import { morphName } from '@/lib/morph-name';
import { SCREEN_SIZES } from '@/components/film/sizes';
import { Icon } from '@/components/Icon';
import styles from './Reel.module.css';

/** How each film after the first comes in: the join into scene k is JOINS[k - 1]. */
const JOINS = ['wipe', 'iris', 'dissolve'] as const;
type Join = (typeof JOINS)[number];
const JOIN_LABEL: Record<Join, string> = { wipe: 'Wipe to', iris: 'Iris in', dissolve: 'Dissolve to' };

// Scroll budget, in screen heights: each film holds, then the join to the next
// is scrubbed by the scroll itself.
const HOLD = 0.45;
const JOIN = 0.9;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The reel: four films, one screen. Each still sits in its own letterbox at the
 * ratio it was shot in, so the bars change shape from film to film; the first
 * starts full-bleed and pulls back into its frame as the reel settles.
 */
export function Reel({ films }: { films: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const total = films.length * HOLD + (films.length - 1) * JOIN;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const scenes = Array.from(el.querySelectorAll<HTMLElement>('[data-scene]'));
    const frames = scenes.map((s) => s.querySelector<HTMLElement>('[data-frame]')!);
    const pictures = scenes.map((s) => s.querySelector<HTMLElement>('[data-picture]')!);
    const shades = scenes.map((s) => s.querySelector<HTMLElement>('[data-shade]'));
    const edge = el.querySelector<HTMLElement>('[data-edge]')!;
    const slug = el.querySelector<HTMLElement>('[data-join-label]')!;
    const segs = Array.from(el.querySelectorAll<HTMLElement>('[data-seg]'));
    let raf = 0;
    let lastActive = -1;
    let lastJoin = -1;

    const paint = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const run = Math.max(1, rect.height - vh);
      const s = clamp(-rect.top / run) * total;
      const reduce = still.matches;
      // the matte: full-bleed while the reel rises into place, framed once pinned
      const m = reduce ? 1 : ease(clamp(1 - rect.top / vh));

      const joinT = (k: number) => {
        if (k <= 0) return 1;
        if (k >= films.length) return 0;
        const t = clamp((s - (k * HOLD + (k - 1) * JOIN)) / JOIN);
        return reduce ? (t >= 0.5 ? 1 : 0) : t;
      };

      let current = 0;
      let joining = -1;
      let joinE = 0;
      for (let k = 0; k < films.length; k++) {
        const t = joinT(k);
        const x = joinT(k + 1);
        if (k > 0 && t >= 0.75) current = k;
        if (k > 0 && t > 0 && t < 1) {
          joining = k;
          joinE = Math.sin(Math.PI * t);
        }
        const scene = scenes[k];
        const join = k > 0 ? JOINS[k - 1] : null;
        const te = ease(t);

        // the entrance
        scene.style.clipPath = 'none';
        scene.style.opacity = '1';
        if (join === 'wipe') scene.style.clipPath = `inset(0 0 0 ${((1 - te) * 100).toFixed(3)}%)`;
        if (join === 'iris') scene.style.clipPath = `circle(${(clamp(t * 2 - 1) * 72).toFixed(3)}% at 50% 50%)`;
        if (join === 'dissolve') scene.style.opacity = te.toFixed(3);
        scene.style.visibility = t <= 0 ? 'hidden' : 'visible';

        // the exit: an iris closes on the old frame; a dissolve overexposes it
        const nextJoin = JOINS[k];
        const shade = shades[k];
        if (shade) shade.style.setProperty('--r', `${((1 - clamp(x * 2)) * 100).toFixed(2)}%`);
        if (shade) shade.style.opacity = nextJoin === 'iris' && x > 0 && !reduce ? '1' : '0';
        pictures[k].style.filter = nextJoin === 'dissolve' && x > 0 && !reduce ? `brightness(${(1 + x * 0.9).toFixed(3)}) blur(${(x * 6).toFixed(2)}px)` : '';

        // a slow push-in across the film's whole time on screen
        const a = k === 0 ? -1 : k * HOLD + (k - 1) * JOIN;
        const b = Math.min(total, (k + 1) * HOLD + k * JOIN + JOIN);
        const u = clamp((s - a) / (b - a));
        if (!reduce) pictures[k].style.transform = `scale(${(1.02 + u * 0.08).toFixed(4)})`;
        if (segs[k]) segs[k].style.setProperty('--fill', String(k < current ? 1 : k > current ? 0 : u));
      }

      // the first frame pulls back from full-bleed into its letterbox
      const f0 = frames[0];
      if (f0) {
        const w = f0.offsetWidth;
        const h = f0.offsetHeight;
        const cx = f0.offsetLeft + w / 2;
        const cy = f0.offsetTop + h / 2;
        const cover = Math.max((Math.max(cx, vw - cx) * 2) / w, (Math.max(cy, vh - cy) * 2) / h);
        f0.style.transform = `scale(${(1 + (cover - 1) * (1 - m)).toFixed(4)})`;
      }

      // the light bar on the wipe, and the screenplay slug for whichever join is running
      const wipeT = joinT(1);
      edge.style.left = `${((1 - ease(wipeT)) * 100).toFixed(3)}%`;
      edge.style.opacity = !reduce && wipeT > 0 && wipeT < 1 ? String(Math.sin(Math.PI * wipeT)) : '0';
      if (joining !== lastJoin) {
        lastJoin = joining;
        if (joining > 0) slug.textContent = JOIN_LABEL[JOINS[joining - 1]];
      }
      slug.style.opacity = joining > 0 ? (joinE * 0.9).toFixed(3) : '0';

      if (current !== lastActive) {
        lastActive = current;
        setActive(current);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    still.addEventListener('change', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      still.removeEventListener('change', onScroll);
    };
  }, [films.length, total]);

  // whichever film holds the screen is the one that will grow into its page
  useEffect(() => {
    const film = films[active];
    if (film) arm(film.slug, 'reel');
  }, [active, films]);

  const skip = () => {
    const target = document.getElementById('program');
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={root}
      id="films"
      className={styles.reel}
      style={{ '--total': total } as CSSProperties}
      aria-labelledby="reel-title"
    >
      <h2 id="reel-title" className="sr-only">
        The reel: four films
      </h2>
      <div className={styles.pin}>
        {films.map((film, k) => (
          <Scene key={film.slug} film={film} index={k} count={films.length} active={k === active} />
        ))}

        <span className={styles.edge} data-edge aria-hidden="true" />
        <p className={styles.joinLabel} data-join-label aria-hidden="true" />

        <div className={styles.chrome}>
          <ol className={styles.progress} aria-label="Films in the reel">
            {films.map((film, k) => (
              <li key={film.slug} className={styles.seg} data-seg data-on={k === active ? '' : undefined}>
                <span className="sr-only">
                  {film.title}
                  {k === active ? ' (on screen)' : ''}
                </span>
              </li>
            ))}
          </ol>
          <a
            href="#program"
            className={styles.skip}
            onClick={(event) => {
              event.preventDefault();
              skip();
            }}
          >
            All films
            <Icon name="down" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Scene({ film, index, count, active }: { film: Project; index: number; count: number; active: boolean }) {
  const armed = useArmed(film.slug, 'reel');
  const claim = () => arm(film.slug, 'reel');

  return (
    <div
      className={styles.scene}
      data-scene
      data-active={active ? '' : undefined}
      style={{ zIndex: index + 1, '--ratio': film.ratio } as CSSProperties}
      onPointerEnter={claim}
      onPointerDown={claim}
      onFocus={claim}
      inert={!active}
    >
      <ViewTransition name={armed ? morphName(film.slug) : undefined} share="morph" default="none">
        <div className={styles.frame} data-frame>
          <div className={styles.picture} data-picture>
            <Image
              src={film.still.src}
              alt={film.still.alt}
              fill
              sizes={SCREEN_SIZES}
              quality={85}
              placeholder="blur"
              loading={index === 0 ? 'eager' : 'lazy'}
              className={styles.still}
            />
          </div>
        </div>
      </ViewTransition>
      <span className={styles.shade} data-shade aria-hidden="true" />
      <span className={styles.scrim} aria-hidden="true" />
      {/* the whole screen opens the film; the title is the accessible way in */}
      <Link href={`/work/${film.slug}`} transitionTypes={['cut']} className={styles.hit} tabIndex={-1} aria-hidden="true" />

      <div className={styles.card}>
        <h3 className={styles.title}>
          <Link href={`/work/${film.slug}`} transitionTypes={['cut']} className={styles.titleLink}>
            {film.title}
          </Link>
        </h3>
        <p className={styles.meta}>
          <span className={`tally ${styles.lamp}`} aria-hidden="true" />
          {film.format} · {film.year} · {film.runtime} · {film.aspect}
          {film.placeholder && <span className={styles.sample}> · Sample entry</span>}
          <span className="sr-only">
            {' '}
            (film {index + 1} of {count})
          </span>
        </p>
        <p className={styles.logline}>{film.logline}</p>
        <p className={styles.roles}>{film.roles.join(', ')}</p>
        <span className={styles.open} aria-hidden="true">
          Open the film
          <Icon name="arrow" size={14} />
        </span>
      </div>
    </div>
  );
}
