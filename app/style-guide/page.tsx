import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { site } from '@/content/site';
import { PageTransition } from '@/components/PageTransition';
import { SiteFooter } from '@/components/Closing';
import { light, frame, cut, bandsPolygon, TOTAL_FRAMES, FPS } from '@/components/hero/reveal';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Style guide',
  description: 'The black-studio look of the site: palette, grain, the one warm light, type, motion and asset specs.',
  robots: { index: false, follow: false },
};

const SWATCHES = [
  { name: 'Black', token: '--black', hex: '#0a0a09', use: 'The page. A black seamless a breath off pure, so a frame shot on black cyc sinks into it.' },
  { name: 'Black lift', token: '--black-lift', hex: '#121211', use: 'Empty frames while media loads; the film base of the contact sheet.' },
  { name: 'Rule', token: '--rule', hex: '#2a2926', use: 'Hairlines, used sparingly: the index rows, the facts table, the footer.' },
  { name: 'Grey 2', token: '--grey-2', hex: '#75746e', use: 'Large secondary text and edge print only (4.2:1).' },
  { name: 'Grey 3', token: '--grey-3', hex: '#a6a59f', use: 'Secondary text at body size: meta, timecodes, captions (8:1).' },
  { name: 'White', token: '--white', hex: '#eeede8', use: 'Type, and the one solid button. Print white, never pure.' },
  { name: 'Screen', token: '--screen', hex: '#000000', use: 'The projection itself: letterbox bars, the shutter, the screen behind a film.' },
  { name: 'Tungsten', token: '--tungsten', hex: '#ffb46b', use: '3200K. The only warm colour, reserved for what is live.' },
];

const TYPE = [
  { label: 'Name', className: 't-display', sample: site.name, spec: 'Switzer 540, up to 6rem, line 0.92, tracking −0.04em' },
  { label: 'Section', className: 't-section', sample: 'Light, frame, cut.', spec: 'Switzer 500, up to 3.6rem, tracking −0.035em' },
  { label: 'Film title', className: 't-title', sample: 'Monsoon Letters', spec: 'Switzer 520, up to 2.05rem, tracking −0.025em' },
  { label: 'Lede and tagline', className: 't-lede', sample: site.tagline, spec: 'Switzer 420, up to 2.05rem, tracking −0.022em (tagline −0.032em)' },
  { label: 'Body', className: 't-small', sample: 'A salt-pan worker in the Little Rann counts the days until the monsoon floods the flats.', spec: 'Switzer 400, 17px, line 1.55, tracking −0.005em' },
  { label: 'Meta', className: 't-meta', sample: 'Short fiction · 2026 · 14 min · 2.39:1 · 00:04:51:12', spec: 'Switzer 460, 13px, tabular lining figures' },
];

const MOTION = [
  ['Projector', '1.5 s before the reveal, once per visit: the gate light sputters through a slit, then the letterbox bars part.'],
  ['Hero reveal', `${(TOTAL_FRAMES / FPS).toFixed(1)} s at ${FPS} fps. Light slides in with motion blur and grain; frame racks focus and snaps; cut resolves behind a playhead in timeline bands.`],
  ['The reel', 'Four films pinned to one screen, joined by the scroll itself: the first pulls back from full-bleed into its letterbox, then a wipe with a bar of light, an iris, and an overexposed dissolve. Title cards rack into focus as each film takes the screen.'],
  ['The index', 'Reaching for a title projects its film behind the list: the lamp strikes over a few uneven frames, then the still pushes in and cuts through its key shots.'],
  ['Filtering', 'The program re-cuts in place: films slide to their new rows; the ones that leave go soft and fade.'],
  ['Page change', 'The shutter: letterbox bars meet in the middle over a dip to black, then part on the new page (900 ms).'],
  ['Opening a film', 'A cut: one overexposed tungsten frame at the splice, and the frame you chose grows into the screen.'],
  ['Scroll', 'Inertial (Lenis), off for reduced motion. The bar hides while reading down. The process beats arrive in their own grammar: the lamp comes up, the frame racks focus, the cut wipes in.'],
  ['Grain', 'Fine silver over the whole site, stepping ten times a second; frozen for reduced motion.'],
];

const SPECS = [
  {
    title: 'Hero photograph',
    points: [
      'One frame at 3:1, at least 3840 × 1280, sRGB JPEG at quality 85. File: content/media/hero/set.jpg.',
      'Black cyc, each beat in its own pool of light, with the frame’s edges falling off to black so they match the page. Keep at least 12% headroom above Nimish.',
      'Three beats in thirds, read left to right: lighting a set, behind the camera (sharpest, centre), at the edit desk.',
      'One tungsten key on Nimish in the centre third; the other pools neutral. Rim light separates the gear from the black. No coloured gels; a breath of haze at most.',
      'On phones each third is shown as a band about 45% of its height, centred on the beat’s focus line (content/site.ts).',
    ],
  },
  {
    title: 'Film stills and key shots',
    points: [
      'At the film’s own aspect ratio, never cropped where it is shown whole: the reel’s letterbox and the contact sheet shape themselves around it.',
      'At least 2400 px wide, graded as in the film. One still plus three to five key shots, in story order. The still also fills the screen behind the index, so it must hold at full-bleed.',
      'Each key shot carries its timecode and one line on why it matters.',
    ],
  },
  {
    title: 'Preview loops',
    points: [
      'Six to ten seconds, silent, looping without a visible jump. 1280 px wide at the film’s ratio.',
      'H.264 MP4 (CRF 23, faststart), under 2.5 MB; an optional VP9 WebM alongside. Path: public/media/<film>/preview.mp4.',
      'Without a loop the preview cuts between the still and the key shots, so it never sits empty.',
    ],
  },
  {
    title: 'Behind the scenes',
    points: [
      'Three or four frames per film at 3:2, at least 1800 px wide. Colour or black and white, but one or the other per film.',
      'Show the work, not the crew posing: rigging, framing, the monitor, the cut.',
    ],
  },
];

const STRIP = [0, 2, 4, 7, 9, 11, 13, 15, 17, 19, 22, 27];

export default function StyleGuide() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1}>
        <div className={styles.page}>
          <header className={`grid12 ${styles.intro}`}>
            <h1 className="t-section">Style guide</h1>
            <p className={`t-lede ${styles.lede}`}>
              A black studio, a fine silver grain, one warm light. This page is the reference for anyone shooting, grading or
              cutting material for the site.
            </p>
          </header>

          <section className={styles.block} aria-labelledby="sg-palette">
            <h2 id="sg-palette" className={styles.h2}>
              Palette
            </h2>
            <ul className={styles.swatches}>
              {SWATCHES.map((s) => (
                <li key={s.token} className={styles.swatch}>
                  <span className={styles.chip} style={{ background: `var(${s.token})` }} data-light={['--black', '--black-lift', '--screen'].includes(s.token) ? '' : undefined} />
                  <span className={styles.swatchName}>{s.name}</span>
                  <span className={styles.swatchCode}>
                    {s.hex} · {s.token}
                  </span>
                  <span className={styles.swatchUse}>{s.use}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block} aria-labelledby="sg-light">
            <h2 id="sg-light" className={styles.h2}>
              The one warm light
            </h2>
            <div className={styles.split}>
              <p className={styles.prose}>
                Tungsten appears only where something is live: the key light on Nimish in the hero, the tally lamp beside a
                film that is playing, the reel’s current film, the playhead as the edit resolves, the projector’s gate light,
                focus rings, selected text, and the single overexposed frame when a film opens. It is never a text colour, a
                button or a background.
              </p>
              <div className={styles.tallyDemo} aria-hidden="true">
                <span className={styles.tally} />
                <span>Salt</span>
              </div>
            </div>
          </section>

          <section className={styles.block} aria-labelledby="sg-grain">
            <h2 id="sg-grain" className={styles.h2}>
              Grain
            </h2>
            <div className={styles.split}>
              <p className={styles.prose}>
                Fine and silver, screened over the black so it reads as the film base catching light, not noise on the
                screen. It lifts briefly during the hero’s light beat and otherwise stays at the edge of notice. The
                photographs keep their own grain from the grade; the page adds no more than a breath.
              </p>
              <div className={styles.grainTiles}>
                <figure>
                  <span className={styles.tile} />
                  <figcaption>Black, as rendered</figcaption>
                </figure>
                <figure>
                  <span className={`${styles.tile} ${styles.tileGrain}`} />
                  <figcaption>Grain at four times strength</figcaption>
                </figure>
              </div>
            </div>
          </section>

          <section className={styles.block} aria-labelledby="sg-type">
            <h2 id="sg-type" className={styles.h2}>
              Type
            </h2>
            <p className={styles.prose}>
              Switzer, from the Indian Type Foundry, self-hosted. One family throughout: weight and size carry the
              hierarchy, the name set large and tight, the tagline tighter than the body. Numbers are tabular so runtimes
              and timecodes align.
            </p>
            <dl className={styles.specimens}>
              {TYPE.map((t) => (
                <div key={t.label} className={styles.specimen}>
                  <dt>
                    <span>{t.label}</span>
                    <span className={styles.spec}>{t.spec}</span>
                  </dt>
                  <dd className={t.className}>{t.sample}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.block} aria-labelledby="sg-motion">
            <h2 id="sg-motion" className={styles.h2}>
              Motion
            </h2>
            <p className={styles.prose}>
              Motion follows film grammar: a projector warming up, a reveal at ten frames a second, wipes, irises and
              dissolves, a shutter between pages, a focus pull. Below, the hero reveal printed as a strip, frame by frame.
            </p>
            <ol className={styles.strip} aria-label="Frames of the hero reveal">
              {STRIP.map((f) => (
                <li key={f} className={styles.cell}>
                  <RevealFrame f={f} />
                  <span className={styles.cellNo}>
                    {String(f).padStart(2, '0')} · {(f / FPS).toFixed(1)} s
                  </span>
                </li>
              ))}
            </ol>
            <dl className={styles.grammar}>
              {MOTION.map(([term, text]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.block} aria-labelledby="sg-assets">
            <h2 id="sg-assets" className={styles.h2}>
              Assets
            </h2>
            <div className={styles.specGrid}>
              {SPECS.map((s) => (
                <div key={s.title}>
                  <h3 className={styles.h3}>{s.title}</h3>
                  <ul className={styles.points}>
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
        <SiteFooter />
      </main>
    </PageTransition>
  );
}

/** One frame of the reveal, drawn with the same timeline the hero plays. */
function RevealFrame({ f }: { f: number }) {
  const L = light(f);
  const F = frame(f);
  const C = cut(f);
  const pane = (i: number) => (
    <div className={styles.window} style={{ '--i': i } as CSSProperties}>
      <Image src={site.hero.image} alt="" fill sizes="(max-width: 767px) 50vw, 25vw" className={styles.windowImg} />
    </div>
  );
  return (
    <div className={styles.mini} aria-hidden="true">
      <div className={styles.miniBeat}>
        <div
          className={styles.miniLayer}
          style={{
            opacity: L.opacity,
            transform: `translateX(${L.x}%)`,
            filter: `blur(${(L.velocity * 0.6).toFixed(2)}px) brightness(${L.exposure}) sepia(${L.warm})`,
          }}
        >
          {pane(0)}
        </div>
      </div>
      <div className={styles.miniBeat}>
        <div
          className={styles.miniLayer}
          style={{ opacity: F.opacity, transform: `scale(${F.scale})`, filter: `blur(${(F.blur / 5).toFixed(2)}px)` }}
        >
          {pane(1)}
        </div>
      </div>
      <div className={styles.miniBeat}>
        <div className={`${styles.miniLayer} ${styles.miniGhost}`} style={{ opacity: C.ghost, transform: `translateX(${C.jitter}%)` }}>
          {pane(2)}
        </div>
        <div className={styles.miniLayer} style={{ clipPath: bandsPolygon(C.bands) }}>
          {pane(2)}
        </div>
        <span className={styles.miniHead} style={{ left: `${C.head}%`, opacity: C.headOpacity }} />
      </div>
    </div>
  );
}
