'use client';

import { useLenis } from 'lenis/react';

export function BackToTop({ className }: { className?: string }) {
  const lenis = useLenis();
  return (
    <a
      className={className}
      href="#main"
      onClick={(event) => {
        if (!lenis) return;
        event.preventDefault();
        lenis.scrollTo(0, { duration: 1.8 });
        document.getElementById('main')?.focus({ preventScroll: true });
      }}
    >
      Back to the top
    </a>
  );
}
