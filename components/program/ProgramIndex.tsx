'use client';

import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { ViewTransition, useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import { arm, useArmed } from '@/lib/morph';
import { morphName } from '@/lib/morph-name';
import { useMedia } from '@/lib/use-media';
import { SCREEN_SIZES } from '@/components/film/sizes';
import { Preview } from './Preview';
import styles from './ProgramIndex.module.css';

const ROW = {
  enter: { filter: 'row-in', default: 'none' },
  exit: { filter: 'row-out', default: 'none' },
  update: { filter: 'auto', default: 'none' },
} as const;

/** Fetch and decode a film's full-screen still ahead of the click, so the cut lands sharp. */
const warmed = new Set<string>();
function warm(film: Project) {
  if (warmed.has(film.slug)) return;
  warmed.add(film.slug);
  const { props } = getImageProps({ src: film.still.src, alt: '', sizes: SCREEN_SIZES, quality: 85 });
  const img = new window.Image();
  img.sizes = props.sizes ?? '';
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
  img.decode().catch(() => undefined);
}

/**
 * The index: titles set large in a dark room. Reaching for one projects its
 * film full-bleed behind the list; on touch screens the row crossing the
 * middle of the screen is the one projected.
 */
export function ProgramIndex({ films }: { films: Project[] }) {
  const [lit, setLit] = useState<string | null>(null);
  const canHover = useMedia('(hover: hover) and (pointer: fine)');
  const list = useRef<HTMLOListElement>(null);

  const light = (film: Project) => {
    warm(film);
    arm(film.slug, 'index');
    setLit(film.slug);
  };

  useEffect(() => {
    const el = list.current;
    if (canHover || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const film = films.find((f) => f.slug === (entry.target as HTMLElement).dataset.slug);
          if (film) {
            arm(film.slug, 'index');
            setLit(film.slug);
          }
        }
      },
      { rootMargin: '-46% 0px -46% 0px' },
    );
    el.querySelectorAll('[data-slug]').forEach((row) => io.observe(row));
    return () => io.disconnect();
  }, [canHover, films]);

  const litFilm = films.find((f) => f.slug === lit) ?? null;

  return (
    <div
      className={styles.index}
      data-lit={litFilm ? '' : undefined}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setLit(null)}
    >
      <Projection film={litFilm} />

      <ol ref={list} className={styles.rows}>
        {films.map((film) => (
          <ViewTransition key={film.slug} name={`row-${film.slug}`} {...ROW}>
            <li
              className={styles.row}
              data-slug={film.slug}
              data-lit={lit === film.slug ? '' : undefined}
              onPointerEnter={(e) => e.pointerType === 'mouse' && light(film)}
              onPointerDown={() => light(film)}
              onFocus={() => light(film)}
            >
              <Link href={`/work/${film.slug}`} transitionTypes={['cut']} className={styles.link}>
                <span className={styles.title}>
                  <span className={`tally ${styles.lamp}`} aria-hidden="true" />
                  {film.title}
                  {film.placeholder && <span className={styles.sample}>Sample</span>}
                </span>
                <span className={styles.format}>{film.format}</span>
                <span className={styles.year}>{film.year}</span>
                <span className={styles.runtime}>{film.runtime}</span>
              </Link>
            </li>
          </ViewTransition>
        ))}
      </ol>
    </div>
  );
}

/**
 * The screen behind the list. Keeps the last two films mounted so the
 * outgoing frame can fade under the incoming one, which flickers up like a
 * lamp striking.
 */
function Projection({ film }: { film: Project | null }) {
  const [stack, setStack] = useState<Project[]>([]);
  const [take, setTake] = useState(0);
  if (film && stack[stack.length - 1]?.slug !== film.slug) {
    setStack([...stack.filter((f) => f.slug !== film.slug), film].slice(-2));
    setTake(take + 1);
  }
  return (
    <div className={styles.projection} aria-hidden="true">
      <div className={styles.screen}>
        {stack.map((f) => (
          <Projected key={f.slug} film={f} on={f.slug === film?.slug} take={take} />
        ))}
      </div>
      <span className={styles.beam} />
    </div>
  );
}

function Projected({ film, on, take }: { film: Project; on: boolean; take: number }) {
  const armed = useArmed(film.slug, 'index');
  const still = useMedia('(prefers-reduced-motion: reduce)');
  return (
    <ViewTransition name={armed && on ? morphName(film.slug) : undefined} share="morph" default="none">
      <div className={styles.projected} data-on={on ? '' : undefined}>
        <Image src={film.still.src} alt="" fill sizes={SCREEN_SIZES} quality={85} className={styles.still} />
        <Preview project={film} active={on && !still} take={take} sizes={SCREEN_SIZES} hold={1600} delay={1400} />
      </div>
    </ViewTransition>
  );
}
