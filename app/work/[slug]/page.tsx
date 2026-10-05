import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition, type CSSProperties } from 'react';
import { projects, getProject, nextProject, categoryLabel } from '@/content/projects';
import { site, contactHref, contactIsEmail } from '@/content/site';
import { morphName } from '@/lib/morph-name';
import { PageTransition } from '@/components/PageTransition';
import { Icon } from '@/components/Icon';
import { SCREEN_SIZES } from '@/components/film/sizes';
import { ScreenLoop } from '@/components/film/ScreenLoop';
import { SiteFooter } from '@/components/Closing';
import styles from './page.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const film = getProject(slug);
  if (!film) return {};
  return {
    title: film.title,
    description: film.logline,
    openGraph: { title: `${film.title} · ${site.name}`, description: film.logline },
    // sample entries stay out of search until they are real
    robots: film.placeholder ? { index: false, follow: true } : undefined,
  };
}

export default async function FilmPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const film = getProject(slug);
  if (!film) notFound();

  const next = nextProject(slug);
  const position = projects.findIndex((p) => p.slug === slug) + 1;
  const ratio = { '--ratio': film.ratio } as CSSProperties;
  const facts: Array<[string, string]> = [
    ['Format', film.format],
    ['Year', String(film.year)],
    ['Runtime', film.runtime],
    ['Aspect ratio', film.aspect],
    ...(film.client ? ([['For', film.client]] as Array<[string, string]>) : []),
    ['Nimish', film.roles.join(', ')],
    ...(film.kit?.camera ? ([['Camera', film.kit.camera]] as Array<[string, string]>) : []),
    ...(film.kit?.lenses ? ([['Lenses', film.kit.lenses]] as Array<[string, string]>) : []),
    ...(film.kit?.location ? ([['Location', film.kit.location]] as Array<[string, string]>) : []),
  ];

  const watch = film.film
    ? { href: film.film.url, label: film.film.label ?? 'Watch the film', external: true, note: '' }
    : {
        href: contactHref(`Screener request: ${film.title}`),
        label: 'Request a screener',
        external: !contactIsEmail(),
        note: contactIsEmail() ? '' : ' on Instagram',
      };

  return (
    <PageTransition>
      <main id="main" tabIndex={-1}>
        <article className={styles.film}>
          <header className={styles.screen}>
            <div className={styles.stage}>
              <ViewTransition name={morphName(film.slug)} share="morph" default="none">
                <div className={styles.frame} style={ratio}>
                  {/* decoded before paint, so the transition captures the frame itself */}
                  <Image
                    src={film.still.src}
                    alt={film.still.alt}
                    fill
                    preload
                    decoding="sync"
                    sizes={SCREEN_SIZES}
                    quality={85}
                    placeholder="blur"
                    className={styles.still}
                  />
                  {film.preview && <ScreenLoop source={film.preview} />}
                </div>
              </ViewTransition>
            </div>

            <div className={styles.titles}>
              <div className={styles.titleBlock}>
                <h1 className={styles.title}>{film.title}</h1>
                <p className={styles.screenMeta}>
                  <span className={styles.reelNo}>
                    {position} of {projects.length}
                  </span>
                  {categoryLabel(film.category)} · {film.year} · {film.runtime} · {film.aspect}
                  {film.placeholder && <span className={styles.sampleMark}> · Sample entry</span>}
                </p>
              </div>
              <a
                className={styles.watch}
                href={watch.href}
                {...(watch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {watch.label}
                <Icon name="arrow-up-right" />
                {watch.note && <span className="sr-only">{watch.note}</span>}
              </a>
            </div>
          </header>

          <section className={`grid12 ${styles.brief}`} aria-label="About the film">
            <p className={`t-lede ${styles.logline}`}>{film.logline}</p>
            <dl className={styles.facts}>
              {facts.map(([term, value]) => (
                <div key={term} className={styles.fact}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`grid12 ${styles.notes}`} aria-label="Concept and role">
            <div className={styles.note}>
              <h2 className={styles.noteTitle}>Concept</h2>
              <ul className={styles.points}>
                {film.concept.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.note} ${styles.noteRole}`}>
              <h2 className={styles.noteTitle}>Role</h2>
              <ul className={styles.points}>
                {film.role.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.shots} aria-labelledby="shots-title">
            <h2 id="shots-title" className={`t-section ${styles.sectionTitle}`}>
              Key shots
            </h2>
            <ol className={`grid12 ${styles.shotList}`}>
              {film.shots.map((shot, i) => (
                <li key={shot.timecode} className={styles.shot}>
                  <figure>
                    <div className={styles.shotFrame} style={ratio}>
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        sizes={i === 0 ? '100vw' : '(max-width: 1023px) 100vw, 70vw'}
                        placeholder="blur"
                        className={styles.cover}
                      />
                    </div>
                    <figcaption className={styles.shotCaption}>
                      <span className={styles.timecode}>{shot.timecode}</span>
                      {shot.note}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.bts} aria-labelledby="bts-title">
            <h2 id="bts-title" className={`t-section ${styles.sectionTitle}`}>
              Behind the scenes
            </h2>
            <ul className={styles.sheet}>
              {film.bts.map((frame) => (
                <li key={frame.caption}>
                  <figure>
                    <div className={styles.btsFrame}>
                      <Image
                        src={frame.src}
                        alt={frame.alt}
                        fill
                        sizes="(max-width: 767px) 100vw, 33vw"
                        placeholder="blur"
                        className={styles.cover}
                      />
                    </div>
                    <figcaption className={styles.btsCaption}>{frame.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.credits} aria-labelledby="credits-title">
            <h2 id="credits-title" className={`t-section ${styles.sectionTitle} ${styles.creditsTitle}`}>
              Credits
            </h2>
            <dl className={styles.roll}>
              {film.credits.map((credit, i) => (
                <div key={`${credit.role}-${i}`} className={styles.credit}>
                  <dt>{credit.role}</dt>
                  <dd>{credit.name}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`grid12 ${styles.cta}`} aria-label="Watch or get in touch">
            <p className={`t-lede ${styles.ctaLine}`}>
              {film.film
                ? `See ${film.title} in full, or talk to Nimish about a film of your own.`
                : `${film.title} is shared privately. Ask for a screener, or talk to Nimish about a film of your own.`}
            </p>
            <div className={styles.actions}>
              <a
                className={styles.primary}
                href={watch.href}
                {...(watch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {watch.label}
                <Icon name="arrow-up-right" />
                {watch.note && <span className="sr-only">{watch.note}</span>}
              </a>
              <Link className={styles.secondary} href="/#contact" transitionTypes={['page']}>
                Get in touch
                <Icon name="arrow" />
              </Link>
            </div>
          </section>

          <nav className={styles.next} aria-label="Next film">
            <Link href={`/work/${next.slug}`} transitionTypes={['cut']} className={styles.nextLink}>
              <ViewTransition name={morphName(next.slug)} share="morph" default="none">
                <span className={styles.nextFrame}>
                  <Image src={next.still.src} alt="" fill sizes={SCREEN_SIZES} quality={85} className={styles.nextStill} />
                </span>
              </ViewTransition>
              <span className={styles.nextText}>
                <span className={styles.nextTitle}>{next.title}</span>
                <span className={styles.nextMeta}>
                  <span className={`tally ${styles.nextLamp}`} aria-hidden="true" />
                  <span className={styles.nextLabel}>Next film</span>
                  {next.format} · {next.year} · {next.runtime}
                  {next.placeholder && ' · Sample entry'}
                </span>
              </span>
              <span className={styles.nextArrow} aria-hidden="true">
                <Icon name="arrow" size={22} />
              </span>
            </Link>
          </nav>
        </article>
        <SiteFooter />
      </main>
    </PageTransition>
  );
}
