"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { FlapText } from "./flap-text";
import { heroLoader } from "../lib/cloudinary";
import { concerts, photographs } from "../lib/collection";
import { slideshow } from "../lib/featured";

const HOLD = 6200;
const EXPOSE = 1500;

// Each frame covers the poster and is pushed in to 113% (hero-push), so on a tall
// screen it is drawn far wider than the viewport. Poster heights follow
// .cinema-poster in cinema.css.
function heroSizes(aspect: number) {
  const ratio = aspect.toFixed(3);
  return [
    `(max-width: 700px) calc(max(100vw, clamp(840px, 100vh, 1000px) * ${ratio}) * 1.13)`,
    `calc(max(100vw, clamp(900px, 100vh, 1180px) * ${ratio}) * 1.13)`,
  ].join(", ");
}

// A tiny shared store: the slides live in the backdrop, the controls in the
// poster's bottom rail, and both follow the same reel. `reach` is the furthest
// frame worth fetching: full-resolution frames are large, so the reel loads one
// ahead of what it shows instead of all of them at once.
type Reel = { active: number; playing: boolean; reach: number };
let reel: Reel = { active: 0, playing: true, reach: 1 };
const listeners = new Set<() => void>();
function setReel(next: Partial<Reel>) {
  reel = { ...reel, ...next };
  reel.reach = Math.max(reel.reach, reel.active + 1);
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const serverReel: Reel = { active: 0, playing: true, reach: 1 };
function useReel() {
  return useSyncExternalStore(subscribe, () => reel, () => serverReel);
}

export function HeroSlideshow() {
  const root = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const { active, playing, reach } = useReel();
  const shown = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) setReel({ playing: false });
    const reveal = () => setRevealed(true);
    if (document.documentElement.classList.contains("splash-done")) reveal();
    window.addEventListener("nimish:reveal", reveal);
    return () => window.removeEventListener("nimish:reveal", reveal);
  }, []);

  // Expose the active slide over the previous one, then retire the old frame.
  useEffect(() => {
    const element = root.current;
    if (!element || active === shown.current) return;
    const slides = element.querySelectorAll<HTMLElement>("[data-hero-slide]");
    const from = slides[shown.current];
    const to = slides[active];
    shown.current = active;
    slides.forEach((slide) => slide.classList.remove("is-entering"));
    // Restart the light leak for this exposure.
    element.classList.remove("is-exposing");
    void element.offsetWidth;
    element.classList.add("is-exposing");
    to.classList.add("is-active", "is-entering");
    to.style.zIndex = "2";
    from.style.zIndex = "1";
    const timer = window.setTimeout(() => {
      to.classList.remove("is-entering");
      to.style.zIndex = "";
      from.style.zIndex = "";
      from.classList.remove("is-active");
      element.classList.remove("is-exposing");
    }, EXPOSE + 40);
    return () => window.clearTimeout(timer);
  }, [active]);

  // The reel advances only while it is visible, the tab is open, and it is playing.
  useEffect(() => {
    const element = root.current;
    if (!element || !revealed || !playing) return;
    let visible = true;
    let timer = 0;
    const slides = () =>
      Array.from(element.querySelectorAll<HTMLImageElement>("[data-hero-slide] img"));

    function schedule() {
      window.clearTimeout(timer);
      if (!visible || document.hidden) return;
      timer = window.setTimeout(advance, HOLD);
    }
    function advance() {
      const images = slides();
      // Skip any frame that has not arrived yet rather than exposing a blank.
      for (let step = 1; step < slideshow.length; step++) {
        const next = (reel.active + step) % slideshow.length;
        const image = images[next];
        if (image && image.complete && image.naturalWidth > 0) {
          setReel({ active: next });
          break;
        }
      }
      schedule();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [revealed, playing]);

  return (
    <div className="hero-slides" ref={root} data-hero-slides aria-hidden="true">
      {slideshow.map((slide, index) => (
        <div
          key={slide.src}
          className={`hero-slide${index === 0 ? " is-active" : ""}`}
          data-hero-slide={index}
          style={
            {
              "--focus": slide.focus,
              "--focus-mobile": slide.focusMobile,
            } as React.CSSProperties
          }
        >
          <div className="hero-slide-photo">
            {(index === 0 || (revealed && index <= reach)) && (
              <Image
                src={slide.src}
                alt=""
                fill
                loader={heroLoader}
                sizes={heroSizes(slide.aspect)}
                preload={index === 0}
                fetchPriority={index === 0 ? "high" : "low"}
                className="hero-image"
              />
            )}
          </div>
        </div>
      ))}
      <span className="hero-leak" />
    </div>
  );
}

export function HeroReelControls() {
  const { active, playing } = useReel();
  const slide = slideshow[active];
  const artist = concerts[photographs[slide.index].concert].name.toUpperCase();

  return (
    <div className="hero-reel">
      <button
        type="button"
        className="hero-reel-toggle"
        aria-pressed={!playing}
        aria-label={playing ? "Pause the photograph slideshow" : "Play the photograph slideshow"}
        onClick={() => setReel({ playing: !playing })}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          {playing ? (
            <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
          ) : (
            <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
          )}
        </svg>
      </button>
      <span className="hero-reel-label">NOW SHOWING</span>
      <FlapText
        className="hero-reel-title"
        text={`${slide.number} ${artist}`}
      />
      <span className="hero-reel-ticks" aria-hidden="true">
        {slideshow.map((item, index) => (
          <span key={item.src} className={index === active ? "is-on" : ""} />
        ))}
      </span>
    </div>
  );
}
