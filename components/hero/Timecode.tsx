'use client';

import { useEffect, useRef } from 'react';

const FPS = 24;
const pad = (n: number) => String(n).padStart(2, '0');

/** Running SMPTE timecode since the page opened. Stops offscreen and for reduced motion. */
export function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now();
    let raf = 0;
    let last = -1;
    let visible = true;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const f = Math.floor(((now - t0) / 1000) * FPS);
      if (f === last) return;
      last = f;
      const s = Math.floor(f / FPS);
      el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % FPS)}`;
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', run);
    run();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return (
    <span ref={ref} className={className}>
      00:00:00:00
    </span>
  );
}
