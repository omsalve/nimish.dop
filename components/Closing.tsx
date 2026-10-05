import type { CSSProperties } from 'react';
import Link from 'next/link';
import { site } from '@/content/site';
import { Icon } from '@/components/Icon';
import { BackToTop } from '@/components/BackToTop';
import styles from './Closing.module.css';

// Dust in the projector beam: fixed positions, so the server and client agree.
const MOTES = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * n) * 10000;
    return v - Math.floor(v);
  };
  return { x: 8 + r(12.9898) * 70, y: 10 + r(78.233) * 80, s: 1 + r(39.425) * 2.4, d: 9 + r(5.17) * 12, o: 0.25 + r(2.71) * 0.6 };
});

/** Contact: the end card. The address itself is the call to action. */
export function Contact() {
  const takes = site.takesOn.map((t, i) => (i === 0 ? t : t.toLowerCase()));
  const list = `${takes.slice(0, -1).join(', ')} and ${takes.at(-1)}.`;

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={styles.beam} aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className={styles.mote}
            style={{ '--x': `${m.x}%`, '--y': `${m.y}%`, '--s': `${m.s}px`, '--d': `${m.d}s`, '--o': m.o } as CSSProperties}
          />
        ))}
      </div>
      <div className={`grid12 ${styles.card}`}>
        <h2 id="contact-title" className={`t-section ${styles.title}`}>
          Commissions and collaborations
        </h2>
        <div className={styles.channels}>
          {site.email && (
            <a className={styles.channel} href={`mailto:${site.email}`}>
              {site.email}
            </a>
          )}
          <a className={styles.channel} href={site.instagram.url} target="_blank" rel="noopener noreferrer">
            @{site.instagram.handle}
            <Icon name="arrow-up-right" className={styles.arrow} />
            <span className="sr-only"> on Instagram (opens in a new tab)</span>
          </a>
        </div>
        <p className={styles.takes}>{list}</p>
      </div>
    </section>
  );
}

/** The end credits, on every page. */
export function SiteFooter() {
  return (
    <footer className={styles.credits}>
      <p className={styles.sign}>
        {site.name}
        <span>{site.roles.join(' · ')}</span>
      </p>
      <p className={styles.small}>
        © {new Date().getFullYear()} ·{' '}
        <Link href="/style-guide" className="link" transitionTypes={['page']}>
          Style guide
        </Link>
      </p>
      <BackToTop className={styles.top} />
    </footer>
  );
}
