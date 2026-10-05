'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import styles from './Preview.module.css';

/**
 * The silent preview for one film. With a real loop it plays the loop; until
 * then it cuts between the film's key shots like a short trailer, holding each
 * shot for `hold` milliseconds (nine frames at 10 fps by default).
 */
export function Preview({
  project,
  active,
  take,
  sizes,
  hold = 900,
  delay = 0,
}: {
  project: Project;
  active: boolean;
  take: number;
  sizes: string;
  hold?: number;
  delay?: number;
}) {
  if (project.preview) return <Loop source={project.preview} active={active} />;
  if (!active) return null;
  const frames = [...project.shots.map((s) => s.src), project.still.src];
  return <Cuts key={take} frames={frames} sizes={sizes} hold={hold} delay={delay} />;
}

function Cuts({ frames, sizes, hold, delay }: { frames: Project['still']['src'][]; sizes: string; hold: number; delay: number }) {
  const [shown, setShown] = useState(delay > 0 ? -1 : 0);

  useEffect(() => {
    let id = 0;
    const start = window.setTimeout(() => {
      setShown(0);
      id = window.setInterval(() => setShown((k) => (k + 1) % frames.length), hold);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [frames.length, hold, delay]);

  return (
    <div className={styles.preview} aria-hidden="true" style={{ ['--hold' as string]: `${hold}ms` }}>
      {frames.map((src, k) => (
        <Image
          key={src.src}
          src={src}
          alt=""
          fill
          sizes={sizes}
          className={styles.cut}
          data-shown={k === shown ? '' : undefined}
        />
      ))}
    </div>
  );
}

function Loop({ source, active }: { source: NonNullable<Project['preview']>; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(active);
  const [playing, setPlaying] = useState(false);
  if (active && !armed) setArmed(true);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [active, armed]);

  if (!armed) return null;
  return (
    <video
      ref={video}
      className={styles.loop}
      data-playing={playing && active ? '' : undefined}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
    >
      {source.webm && <source src={source.webm} type="video/webm" />}
      <source src={source.mp4} type="video/mp4" />
    </video>
  );
}
