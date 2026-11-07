import Image from "./components/portfolio-image";
import Archive from "./components/archive";
import BackStub from "./components/back-stub";
import BookingStub from "./components/booking-stub";
import Closing from "./components/closing";
import { HeroReelControls, HeroSlideshow } from "./components/hero-slideshow";
import PageMotion from "./components/page-motion";
import PhotoJourney from "./components/photo-journey";
import { SocialLinks } from "./components/social-links";
import Splash from "./components/splash";
import { Arrow, Asterisk } from "./components/symbols";
import { keepsakePhotograph } from "./lib/featured";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#archive">
        Skip to the concert archive
      </a>
      <Splash />
      <PageMotion />
      <header className="cinema-header page-gutter">
        <a
          className="cinema-brand"
          href="#top"
          aria-label="Nimish, back to top"
        >
          <Asterisk />
          <span>
            NIMISH<span>.</span>
          </span>
        </a>
        <span className="cinema-header-note">
          <span className="status-dot" /> IN THE PIT. IN THE MOMENT.
        </span>
        <nav aria-label="Main navigation">
          <a href="#archive">
            THE ARCHIVE <Arrow direction="down" />
          </a>
          <a href="#contact" className="cinema-contact-nav">
            LET’S TALK <Arrow />
          </a>
        </nav>
      </header>
      <main id="top">
        <div className="poster-scene">
          <section
            className="cinema-poster"
            aria-labelledby="poster-title"
            data-hero-stage
          >
            <figure className="cinema-backdrop">
              <HeroSlideshow />
              <div className="cinema-shade" />
            </figure>
            <div className="cinema-viewfinder" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="cinema-kicker">
              <span>LIVE MUSIC. THROUGH MY LENS.</span>
              <span>INDIA / WHEREVER THE MUSIC TAKES ME</span>
            </div>
            <h1 id="poster-title" className="cinema-main-title">
              <span className="film-type">
                NIMISH<span className="cinema-title-dot film-type">.</span>
              </span>
            </h1>
            <div className="cinema-copy">
              <p className="cinema-edition">
                INDEPENDENT EYE. FRONT-ROW HEART.
              </p>
              <h2>
                <span className="film-type">I SHOOT</span>
                <br />
                <span>CONCERTS.</span>
              </h2>
              <p className="cinema-description">
                The split second. The sweat. The silence after the last song.
                Photographs you can almost hear.
              </p>
              <div className="cinema-actions">
                <a className="cinema-cta" href="#archive">
                  <span>FIND YOUR NIGHT</span>
                  <Arrow direction="down" />
                </a>
                <SocialLinks className="cinema-socials" />
              </div>
            </div>
            <figure className="cinema-contact-print">
              <span className="cinema-print-label">
                ANOTHER NIGHT. SAME FEELING. ↙
              </span>
              <span className="tape tape-top" aria-hidden="true" />
              <div className="cinema-print-image">
                <Image
                  src={keepsakePhotograph.src}
                  alt={keepsakePhotograph.alt}
                  fill
                  sizes="(max-width: 700px) 120px, 210px"
                />
              </div>
              <figcaption>
                <span>N. / {keepsakePhotograph.number}</span>
                <span>KEEP THE FEELING.</span>
              </figcaption>
            </figure>
            <div className="cinema-stamp" aria-label="All access, no distance">
              <span>ALL ACCESS</span>
              <Asterisk />
              <span>NO DISTANCE</span>
            </div>
            <span className="cinema-handwritten handwritten" aria-hidden="true">
              See you at
              <br />
              the front.
            </span>
            <div className="cinema-bottom">
              <HeroReelControls />
              <span className="cinema-bottom-note">
                A COLLECTION OF LOUD MEMORIES{" "}
                <span className="cinema-bottom-year">/ LIVE ARCHIVE</span>
              </span>
              <a href="#encore">
                SCROLL INTO THE NOISE <Arrow direction="down" />
              </a>
            </div>
            <span className="cinema-frame-mark" aria-hidden="true">
              N° 001 — LIVE, ALWAYS.
            </span>
            <div
              className="hero-handoff-dimmer"
              data-hero-dimmer
              aria-hidden="true"
            />
          </section>
        </div>
        {/* Hero → the Rig → the ticket → nine chapters. */}
        <PhotoJourney ticket={<Archive />} />
      </main>
      <Closing />
      <BackStub />
      <BookingStub />
    </>
  );
}
