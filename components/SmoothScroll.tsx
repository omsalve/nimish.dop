'use client';

import 'lenis/dist/lenis.css';
import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Inertial scrolling for the whole document. Lenis follows the user's
 * reduced-motion setting on its own (it drops to 1:1 scrolling).
 */
export function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        wheelMultiplier: 0.9,
        autoRaf: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <RouteSync />
    </ReactLenis>
  );
}

/** After a route change Next has already placed the scroll; start Lenis from there. */
function RouteSync() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [lenis, pathname]);

  return null;
}
