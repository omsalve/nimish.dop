'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import { useMedia } from '@/lib/use-media';
import styles from './ScreenLoop.module.css';

/** The film's silent loop behind its title. Holds on the still for reduced motion. */
export function ScreenLoop({ source }: { source: NonNullable<Project['preview']> }) {
  const video = useRef<HTMLVideoElement>(null);
  const still = useMedia('(prefers-reduced-motion: reduce)');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || still) return;
    v.play().catch(() => setPlaying(false));
  }, [still]);

  if (still) return null;
  return (
    <video
      ref={video}
      className={styles.loop}
      data-playing={playing ? '' : undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    >
      {source.webm && <source src={source.webm} type="video/webm" />}
      <source src={source.mp4} type="video/mp4" />
    </video>
  );
}
