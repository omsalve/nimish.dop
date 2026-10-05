'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { useEffect, useState, type MouseEvent } from 'react';
import { site } from '@/content/site';
import styles from './SiteNav.module.css';

const SECTIONS = [
  { id: 'films', label: 'Films' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export function SiteNav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const onHome = pathname === '/';
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    // Get out of the way while reading down; come back on the way up.
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setSolid(y > 24);
      if (y < 120 || y < last - 6) setHidden(false);
      else if (y > last + 6) setHidden(true);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // On the home page, travel to a section instead of jumping.
  const glide = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onHome) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  const toTop = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onHome) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '/');
  };

  // leaving a film's page closes the shutter; on the home page links glide instead
  const types = onHome ? undefined : ['page'];

  return (
    <header className={styles.nav} data-nav="" data-solid={solid} data-hidden={hidden}>
      <Link href="/" className={styles.name} onClick={toTop} transitionTypes={types}>
        {site.name}
      </Link>
      <nav aria-label="Main">
        <ul className={styles.links}>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                href={`/#${s.id}`}
                className={styles.link}
                onClick={glide(s.id)}
                scroll={!onHome}
                transitionTypes={types}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
