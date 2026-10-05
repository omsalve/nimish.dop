import Image from 'next/image';
import type { CSSProperties } from 'react';
import { site } from '@/content/site';
import styles from './Process.module.css';

/**
 * About, told as the three beats of the hero: each one a window onto its
 * third, arriving with its own gesture as it scrolls in. Light comes up like a
 * dimmer, frame racks into focus, cut wipes in behind a playhead.
 */
export function Process() {
  return (
    <section id="about" className={styles.process} aria-labelledby="about-title">
      <div className={`grid12 ${styles.head}`}>
        <h2 id="about-title" className="t-section">
          Light, frame, cut.
        </h2>
        <p className={`t-lede ${styles.lede}`}>{site.about}</p>
      </div>

      <ol className={`grid12 ${styles.beats}`}>
        {site.beats.map((beat, i) => (
          <li key={beat.key} className={styles.beat} data-beat={beat.key}>
            <div className={styles.crop}>
              <div className={styles.window} style={{ '--i': i, '--fy': `${beat.focusY}%` } as CSSProperties}>
                <Image src={site.hero.image} alt="" fill sizes="(max-width: 599px) 300vw, 100vw" quality={85} className={styles.img} />
              </div>
              {beat.key === 'cut' && <span className={styles.head2} aria-hidden="true" />}
            </div>
            <h3 className={styles.word}>{beat.label}</h3>
            <p className={styles.line}>{beat.line}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
