'use client';

import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { ViewTransition, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Project } from '@/content/projects';
import { arm, useArmed } from '@/lib/morph';
import { morphName } from '@/lib/morph-name';
import { claim, release, useNowPlaying } from '@/lib/now-playing';
import { useMedia } from '@/lib/use-media';
import { SCREEN_SIZES } from '@/components/film/sizes';
import { Preview } from './Preview';
import styles from './ContactSheet.module.css';

const CELL = {
  enter: { filter: 'row-in', default: 'none' },
  exit: { filter: 'row-out', default: 'none' },
  update: { filter: 'auto', default: 'none' },
} as const;

const SIZES = '(max-width: 599px) 50vw, (max-width: 1023px) 33vw, 25vw';

/**
 * The contact sheet: every film's frame at once, each in a cell of film base
 * at its true aspect ratio, edge-printed with its frame number and ratio.
 */
export function ContactSheet({ films }: { films: Project[] }) {
  return (
    <ol className={styles.sheet}>
      {films.map((film, i) => (
        <ViewTransition key={film.slug} name={`cell-${film.slug}`} {...CELL}>
          <li className={styles.item}>
            <Cell film={film} frame={i + 1} eager={i < 4} />
          </li>
        </ViewTransition>
      ))}
    </ol>
  );
}

function Cell({ film, frame, eager }: { film: Project; frame: number; eager: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [hovering, setHovering] = useState(false);
  const [take, setTake] = useState(0);
  const canHover = useMedia('(hover: hover) and (pointer: fine)');
  const still = useMedia('(prefers-reduced-motion: reduce)');
  const playingHere = useNowPlaying(`sheet-${film.slug}`);
  const armed = useArmed(film.slug, 'sheet');
  const warmed = useRef(false);

  // On touch screens there is no hover: the frame that holds the screen plays.
  useEffect(() => {
    const el = ref.current;
    const id = `sheet-${film.slug}`;
    if (canHover || still || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.75) {
          claim(id);
          arm(film.slug, 'sheet');
        } else release(id);
      },
      { threshold: [0, 0.75, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      release(id);
    };
  }, [canHover, still, film.slug]);

  const active = !still && (canHover ? hovering : playingHere);

  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    const { props } = getImageProps({ src: film.still.src, alt: '', sizes: SCREEN_SIZES, quality: 85 });
    const img = new window.Image();
    img.sizes = props.sizes ?? '';
    if (props.srcSet) img.srcset = props.srcSet;
    img.src = props.src;
    img.decode().catch(() => undefined);
  };

  const start = () => {
    warm();
    arm(film.slug, 'sheet');
    setHovering(true);
    setTake((t) => t + 1);
  };

  return (
    <article
      ref={ref}
      className={styles.cell}
      data-active={active ? '' : undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && start()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovering(false)}
      onPointerDown={() => {
        warm();
        arm(film.slug, 'sheet');
      }}
      onFocus={start}
      onBlur={() => setHovering(false)}
    >
      <div className={styles.base}>
        <ViewTransition name={armed ? morphName(film.slug) : undefined} share="morph" default="none">
          <div className={styles.frame} style={{ '--ratio': film.ratio } as CSSProperties}>
            <Image
              src={film.still.src}
              alt={film.still.alt}
              fill
              sizes={SIZES}
              placeholder="blur"
              loading={eager ? 'eager' : 'lazy'}
              className={styles.still}
            />
            <Preview project={film} active={active} take={take} sizes={SIZES} />
          </div>
        </ViewTransition>
        <span className={styles.edgeTop} aria-hidden="true">
          <span>{frame}</span>
          <span>{frame}A</span>
        </span>
        <span className={styles.edgeBottom} aria-hidden="true">
          {film.aspect}
        </span>
      </div>
      <div className={styles.caption}>
        <h3 className={styles.title}>
          <Link href={`/work/${film.slug}`} transitionTypes={['cut']} className={styles.link}>
            <span className={`tally ${styles.lamp}`} aria-hidden="true" />
            {film.title}
          </Link>
        </h3>
        <p className={styles.meta}>
          {film.format} · {film.year} · {film.runtime}
          {film.placeholder && <span className={styles.sample}> · Sample entry</span>}
        </p>
      </div>
    </article>
  );
}
