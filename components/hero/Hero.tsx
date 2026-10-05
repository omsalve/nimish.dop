'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import { useLenis } from 'lenis/react';
import { site } from '@/content/site';
import { InlineScript } from '@/components/InlineScript';
import { Icon } from '@/components/Icon';
import { Timecode } from './Timecode';
import { playReveal } from './reveal';
import styles from './Hero.module.css';

// Runs before first paint: decide whether this visit gets the projector and the
// reveal. Once per session, never with reduced motion; ?reveal forces a replay.
// A safety timer shows the plate anyway if the page never hydrates.
const PRELUDE = `(function(){try{var d=document.documentElement,force=/[?&]reveal\\b/.test(location.search);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(!force&&sessionStorage.getItem('nk:reveal'))return;d.setAttribute('data-reveal','pending');setTimeout(function(){var s=d.getAttribute('data-reveal');if(s==='pending'||s==='intro')d.setAttribute('data-reveal','done')},9000)}catch(e){}})();`;

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

const SIZES = '(max-width: 599px) 300vw, 100vw';

export function Hero({ filmCount }: { filmCount: number }) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (document.documentElement.dataset.reveal !== 'pending' || !root.current) return;
    return playReveal(root.current, {
      onClass: styles.on,
      onDone: () => {
        try {
          sessionStorage.setItem('nk:reveal', '1');
        } catch {}
      },
    });
  }, []);

  const films = `${WORDS[filmCount] ?? filmCount} films`;

  return (
    <section ref={root} className={styles.hero} aria-labelledby="hero-name">
      <InlineScript html={PRELUDE} />

      {/* the projector warming up: a slit of gate light, then the bars part */}
      <div className={styles.projector} aria-hidden="true">
        <span className={styles.barTop} />
        <span className={styles.barBottom} />
        <span className={styles.lamp} />
        <span className={styles.seam} />
      </div>

      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <filter id="nk-mblur" x="-25%" y="0" width="150%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur data-r="mblur" stdDeviation="0 0" />
        </filter>
        <filter id="nk-chroma" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset data-r="red" in="r" dx="0" dy="0" result="ro" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset data-r="blue" in="b" dx="0" dy="0" result="bo" />
          <feBlend in="ro" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bo" mode="screen" />
        </filter>
      </svg>

      <div className={styles.stage}>
        {/* a camera monitor's readout around the plate */}
        <div className={styles.hud} aria-hidden="true">
          <span className={styles.rec}>
            <span className={`tally ${styles.recLamp}`} />
            Rec
            <Timecode className={styles.tc} />
          </span>
          <span className={styles.readout}>24 fps · 180° · T2 · 3200K</span>
        </div>
        <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />

        <div className={styles.plate} data-r="plate" style={{ '--fy': `${site.hero.focusY}%` } as CSSProperties}>
          {site.beats.map((beat, i) => (
            <div
              key={beat.key}
              className={`${styles.beat} ${styles[beat.key]}`}
              style={{ '--i': i, '--band-fy': `${beat.focusY}%` } as CSSProperties}
            >
              {beat.key === 'cut' && <Plate ghost r="cut-ghost" preload={false} />}
              <Plate r={`${beat.key}-layer`} preload={i === 0} described={beat.key === 'frame'} />
              {beat.key === 'light' && <span className={styles.beatGrain} data-r="light-grain" />}
              {beat.key === 'cut' && <span className={styles.playhead} data-r="playhead" />}
            </div>
          ))}
        </div>
        <ol className={styles.captions} aria-label="The three parts of the work">
          {site.beats.map((beat) => (
            <li key={beat.key} className={styles.caption} data-r={`cue-${beat.key}`}>
              {beat.label}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.titles}>
        <h1 id="hero-name" className={`t-display ${styles.name}`}>
          {site.name}
        </h1>
        <div className={styles.aside}>
          <p className={styles.roles}>{site.roles.join(' · ')}</p>
          <p className={styles.tagline} data-r="cue-tagline">
            {site.tagline}
          </p>
          <a
            className={styles.toFilms}
            href="#films"
            onClick={(event) => {
              const target = document.getElementById('films');
              if (!target || !lenis) return;
              event.preventDefault();
              lenis.scrollTo(target, { duration: 1.6 });
            }}
          >
            Watch the reel · {films}
            <Icon name="down" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

// The three thirds are windows onto one photograph; only one of them describes it.
function Plate({ r, ghost = false, preload, described = false }: { r: string; ghost?: boolean; preload: boolean; described?: boolean }) {
  return (
    <div className={`${styles.layer} ${ghost ? styles.ghost : ''}`} data-r={r}>
      <div className={styles.window}>
        <Image
          src={site.hero.image}
          alt={described ? site.hero.alt : ''}
          fill
          sizes={SIZES}
          preload={preload}
          loading="eager"
          placeholder="empty"
          quality={85}
          className={styles.img}
        />
      </div>
    </div>
  );
}
