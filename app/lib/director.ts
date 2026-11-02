/**
 * The scroll director. Layout is measured once per resize; each frame only
 * reads scrollY and writes compositor properties. Lenis supplies the clock.
 *
 *  - Hero: the poster drifts and sinks into the dark as the ticket arrives.
 *  - Shots: each artist's three frames are exposed through a shutter gate.
 *    The gate opens by scaling while the film inside counter-scales, so the
 *    photograph is never distorted or cropped, only revealed. A burst of light
 *    fires as the gate opens, and the previous frame falls back into the dark.
 */

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

type Shot = {
  element: HTMLElement;
  gate: HTMLElement;
  film: HTMLElement;
  flash: HTMLElement | null;
};
type Sequence = {
  element: HTMLElement;
  stage: HTMLElement;
  top: number;
  range: number;
  shots: Shot[];
  count: HTMLElement | null;
  shown: string;
};

const OPEN = 0.19;

export function createDirector() {
  const hero = document.querySelector<HTMLElement>("[data-hero-stage]");
  const dimmer = document.querySelector<HTMLElement>("[data-hero-dimmer]");
  const slides = document.querySelector<HTMLElement>("[data-hero-slides]");
  let sequences: Sequence[] = [];
  let viewport = 1;
  let mobile = false;
  let dirty = true;

  function measure() {
    viewport = window.innerHeight;
    mobile = window.innerWidth <= 700;
    const scrollY = window.scrollY;
    sequences = Array.from(document.querySelectorAll<HTMLElement>("[data-shots]")).map(
      (element) => {
        const bounds = element.getBoundingClientRect();
        return {
          element,
          stage: element.querySelector<HTMLElement>(".shots-stage")!,
          top: bounds.top + scrollY,
          range: Math.max(1, bounds.height - viewport),
          count: element.querySelector<HTMLElement>("[data-shot-count]"),
          shown: "",
          shots: Array.from(element.querySelectorAll<HTMLElement>("[data-shot]")).map(
            (shot) => ({
              element: shot,
              gate: shot.querySelector<HTMLElement>("[data-shot-gate]")!,
              film: shot.querySelector<HTMLElement>("[data-shot-film]")!,
              flash: shot.querySelector<HTMLElement>("[data-shot-flash]"),
            }),
          ),
        };
      },
    );
    dirty = false;
  }

  function updateSequence(sequence: Sequence, scrollY: number) {
    // The run starts while the stage is still rising into view.
    const lead = viewport * 0.85;
    const p = clamp((scrollY - sequence.top + lead) / (sequence.range + lead));
    const count = sequence.shots.length;
    const span = (1 - OPEN - 0.08) / Math.max(1, count - 1);
    const starts = sequence.shots.map((_, k) => k * span);
    const opens = starts.map((start) => easeOut((p - start) / OPEN));
    let exposed = 0;

    sequence.shots.forEach((shot, k) => {
      const a = opens[k];
      const next = k + 1 < count ? opens[k + 1] : 0;
      if (a > 0.5) exposed = k + 1;
      // Three gates: a horizontal slit, a vertical slit, then the full aperture.
      const open = Math.max(a, 0.0005);
      const sx = k % 3 === 1 ? open : k % 3 === 2 ? 0.35 + open * 0.65 : 1;
      const sy = k % 3 === 1 ? 1 : open;
      const end = k + 1 < count ? starts[k + 1] + OPEN : 1;
      const life = clamp((p - starts[k]) / (end - starts[k]));
      const zoom = 1.14 - 0.14 * easeOut(life);
      shot.gate.style.visibility = a <= 0 ? "hidden" : "visible";
      shot.gate.style.transform = `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      shot.film.style.transform = `scale(${(zoom / sx).toFixed(4)}, ${(zoom / sy).toFixed(4)})`;
      if (shot.flash) {
        const burst = a > 0 && a < 1 ? Math.pow(1 - a, 1.4) : 0;
        shot.flash.style.opacity = burst.toFixed(3);
      }
      // The frame before falls back into the dark as the next is exposed.
      const recede = 1 - next * (mobile ? 0.12 : 0.16);
      const lift = -next * (mobile ? 4 : 6);
      shot.element.style.transform = `translate3d(0, ${lift.toFixed(2)}%, 0) scale(${recede.toFixed(4)})`;
      shot.element.style.opacity = (1 - next * 0.86).toFixed(3);
      shot.element.style.setProperty("--label", clamp((a - 0.85) / 0.15 - next * 2).toFixed(3));
    });

    sequence.stage.style.setProperty("--glow", clamp(p * 6).toFixed(3));
    sequence.stage.style.setProperty("--note", clamp((p - 0.8) / 0.12).toFixed(3));
    const label = String(Math.max(1, exposed)).padStart(2, "0");
    if (sequence.count && label !== sequence.shown) {
      sequence.shown = label;
      sequence.count.textContent = label;
    }
  }

  function update() {
    if (dirty) measure();
    const scrollY = window.scrollY;

    if (hero && scrollY < viewport * 1.6) {
      const progress = clamp(scrollY / (viewport * 0.95));
      if (slides) slides.style.transform = `translate3d(0, ${(progress * 14).toFixed(3)}%, 0)`;
      if (dimmer) dimmer.style.opacity = (progress * 0.85).toFixed(3);
    }

    sequences.forEach((sequence) => {
      if (scrollY + viewport < sequence.top - viewport * 0.1) return;
      if (scrollY > sequence.top + sequence.range + viewport) return;
      updateSequence(sequence, scrollY);
    });
  }

  function reset() {
    dimmer?.style.removeProperty("opacity");
    slides?.style.removeProperty("transform");
    sequences.forEach((sequence) => {
      sequence.stage.style.removeProperty("--glow");
      sequence.stage.style.removeProperty("--note");
      sequence.shots.forEach((shot) => {
        shot.element.style.removeProperty("transform");
        shot.element.style.removeProperty("opacity");
        shot.element.style.removeProperty("--label");
        shot.gate.style.removeProperty("transform");
        shot.gate.style.removeProperty("visibility");
        shot.film.style.removeProperty("transform");
        shot.flash?.style.removeProperty("opacity");
      });
    });
    dirty = true;
  }

  return {
    update,
    reset,
    invalidate() {
      dirty = true;
    },
  };
}
