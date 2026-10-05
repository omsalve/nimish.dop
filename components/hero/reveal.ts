// The hero reveal: a 2.8 second sequence played at 10 frames per second, so it
// reads as a strip of film rather than a smooth web tween. Each third enters
// with its own grammar:
//
//   light  slides in from the left with motion blur and a lift of soft grain,
//          warming up like a tungsten lamp
//   frame  racks focus: hunts, overshoots, then snaps sharp, with a whisper of
//          chromatic separation while it is soft
//   cut    resolves behind a playhead, track by track, the unrendered part
//          shimmering in timeline bands
//
// Every value is a pure function of the frame number, so the same timeline can
// be printed as a strip (see /style-guide).

/** The projector warming up before the reveal (see Hero.module.css, .projector). */
export const INTRO_MS = 1500;

export const FPS = 10;
export const FRAME_MS = 1000 / FPS;
export const TOTAL_FRAMES = 28;

/** Frames at which each caption, and finally the tagline, comes up. */
export const CUES = { light: 9, frame: 15, cut: 23, tagline: 25 } as const;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export type LightState = { opacity: number; x: number; velocity: number; grain: number; exposure: number; warm: number };
export type FrameState = { opacity: number; blur: number; chroma: number; scale: number; snap: boolean };
export type CutState = { bands: number[]; ghost: number; jitter: number; head: number; headOpacity: number; step: number };

const LIGHT_IN = 1;
const LIGHT_LEN = 8;
const lightX = (f: number) => -10 * (1 - easeOutCubic(clamp((f - LIGHT_IN) / LIGHT_LEN)));

export function light(f: number): LightState {
  const p = clamp((f - LIGHT_IN) / LIGHT_LEN);
  return {
    opacity: f < LIGHT_IN ? 0 : f === LIGHT_IN ? 0.35 : f === LIGHT_IN + 1 ? 0.75 : 1,
    x: lightX(f),
    velocity: Math.abs(lightX(f) - lightX(f - 1)),
    grain: f < LIGHT_IN ? 0 : 0.55 * (1 - p),
    exposure: 0.92 + 0.08 * easeOutCubic(p),
    warm: 0.16 * (1 - p),
  };
}

const FRAME_IN = 6;
// a focus puller hunting for the mark, then landing it
const FOCUS = [16, 16, 11, 6, 9, 4, 1.6, 3, 0.8, 0];

export function frame(f: number): FrameState {
  const k = f - FRAME_IN;
  const blur = k < 0 ? FOCUS[0] : FOCUS[Math.min(k, FOCUS.length - 1)];
  return {
    opacity: k < 0 ? 0 : k === 0 ? 0.4 : k === 1 ? 0.8 : 1,
    blur,
    chroma: blur * 0.42,
    scale: 1 + (blur / 16) * 0.045,
    snap: k === FOCUS.length - 1,
  };
}

const CUT_IN = 12;
const SWEEP = 10;
// each track renders a little behind the playhead, by its own amount
const LAGS = [0, 9, 3, 14, 6, 11];
const GHOST = [0.2, 0.34, 0.14, 0.3, 0.22, 0.36, 0.16, 0.28, 0.24, 0.32, 0.18, 0.26];

export const CUT_BANDS = LAGS.length;

export function cut(f: number): CutState {
  const k = f - CUT_IN;
  if (k < 0) return { bands: LAGS.map(() => 0), ghost: 0, jitter: 0, head: 0, headOpacity: 0, step: 0 };
  const travel = clamp(k / SWEEP) * 115;
  const bands = LAGS.map((lag) => clamp((travel - lag) / 100) * 100);
  const resolved = bands.every((b) => b >= 100);
  return {
    bands,
    ghost: resolved ? 0 : GHOST[k % GHOST.length],
    jitter: resolved ? 0 : (((k * 7) % 5) - 2) * 0.35,
    head: Math.min(travel, 100),
    headOpacity: k <= SWEEP ? 1 : Math.max(0, 1 - (k - SWEEP) / 2),
    step: k,
  };
}

/** clip-path that shows each band up to its own playhead position. */
export function bandsPolygon(bands: number[]) {
  const n = bands.length;
  const pts = ['0% 0%'];
  bands.forEach((w, i) => {
    pts.push(`${w.toFixed(2)}% ${((i / n) * 100).toFixed(3)}%`, `${w.toFixed(2)}% ${(((i + 1) / n) * 100).toFixed(3)}%`);
  });
  pts.push('0% 100%');
  return `polygon(${pts.join(',')})`;
}

// Gate weave and exposure flicker: the plate drifts by fractions of a pixel
// and breathes in brightness, frame to frame, only while the reveal runs.
const WEAVE: Array<[number, number, number]> = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12543.1234;
  const c = Math.sin(i * 39.425) * 24634.6345;
  const r = (v: number) => v - Math.floor(v);
  return [(r(a) - 0.5) * 1.1, (r(b) - 0.5) * 0.8, 0.985 + r(c) * 0.035];
});

export const weave = (f: number) => WEAVE[clamp(f, 0, TOTAL_FRAMES - 1)];

type Parts = {
  plate: HTMLElement;
  lightLayer: HTMLElement;
  lightGrain: HTMLElement;
  frameLayer: HTMLElement;
  cutMain: HTMLElement;
  cutGhost: HTMLElement;
  playhead: HTMLElement;
  mblur: SVGFEGaussianBlurElement;
  red: SVGFEOffsetElement;
  blue: SVGFEOffsetElement;
  cues: Record<keyof typeof CUES, HTMLElement>;
  onClass: string;
};

function collect(root: HTMLElement, onClass: string): Parts | null {
  const q = <T extends Element>(k: string) => root.querySelector<T>(`[data-r="${k}"]`);
  const parts = {
    plate: q<HTMLElement>('plate'),
    lightLayer: q<HTMLElement>('light-layer'),
    lightGrain: q<HTMLElement>('light-grain'),
    frameLayer: q<HTMLElement>('frame-layer'),
    cutMain: q<HTMLElement>('cut-layer'),
    cutGhost: q<HTMLElement>('cut-ghost'),
    playhead: q<HTMLElement>('playhead'),
    mblur: q<SVGFEGaussianBlurElement>('mblur'),
    red: q<SVGFEOffsetElement>('red'),
    blue: q<SVGFEOffsetElement>('blue'),
    cues: {
      light: q<HTMLElement>('cue-light'),
      frame: q<HTMLElement>('cue-frame'),
      cut: q<HTMLElement>('cue-cut'),
      tagline: q<HTMLElement>('cue-tagline'),
    },
  };
  const { cues, ...els } = parts;
  if ([...Object.values(els), ...Object.values(cues)].some((el) => !el)) return null;
  return { ...(parts as unknown as Parts), onClass };
}

const ANIMATED = ['opacity', 'transform', 'filter', 'clip-path', 'mask-position', '-webkit-mask-position', 'left'];

/**
 * Plays the reveal on an already-rendered hero. Resolves through `onDone` when
 * it ends; the returned function cancels it (and leaves the hero untouched for
 * a clean restart, which React's development double-mount relies on).
 */
export function playReveal(root: HTMLElement, { onClass, onDone }: { onClass: string; onDone: () => void }) {
  const parts = collect(root, onClass);
  const html = document.documentElement;
  if (!parts) {
    onDone();
    return () => {};
  }

  let raf = 0;
  let cancelled = false;
  let started = false;
  const images = Array.from(root.querySelectorAll('img'));
  const settle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const decoded = Promise.all(images.map((img) => img.decode().catch(() => undefined)));

  const reset = () => {
    for (const el of [parts.plate, parts.lightLayer, parts.lightGrain, parts.frameLayer, parts.cutMain, parts.cutGhost, parts.playhead]) {
      for (const p of ANIMATED) el.style.removeProperty(p);
    }
    parts.mblur.setAttribute('stdDeviation', '0 0');
    parts.red.setAttribute('dx', '0');
    parts.blue.setAttribute('dx', '0');
    for (const el of Object.values(parts.cues)) el.classList.remove(onClass);
  };

  const apply = (f: number) => {
    const [wx, wy, wb] = weave(f);
    parts.plate.style.transform = `translate3d(${wx.toFixed(2)}px, ${wy.toFixed(2)}px, 0)`;
    parts.plate.style.filter = `brightness(${wb.toFixed(3)})`;

    const L = light(f);
    const lw = parts.lightLayer.clientWidth;
    parts.lightLayer.style.opacity = String(L.opacity);
    parts.lightLayer.style.transform = `translate3d(${L.x.toFixed(2)}%, 0, 0)`;
    parts.mblur.setAttribute('stdDeviation', `${((L.velocity / 100) * lw * 0.55).toFixed(1)} 0`);
    parts.lightLayer.style.filter = `url(#nk-mblur) brightness(${L.exposure.toFixed(3)}) sepia(${L.warm.toFixed(3)})`;
    parts.lightGrain.style.opacity = L.grain.toFixed(3);

    const F = frame(f);
    parts.frameLayer.style.opacity = String(F.opacity);
    parts.frameLayer.style.transform = `scale(${F.scale.toFixed(4)})`;
    parts.red.setAttribute('dx', (-F.chroma).toFixed(2));
    parts.blue.setAttribute('dx', F.chroma.toFixed(2));
    parts.frameLayer.style.filter = F.blur > 0 ? `url(#nk-chroma) blur(${F.blur}px)` : F.snap ? 'contrast(1.06) brightness(1.02)' : 'none';

    const C = cut(f);
    const band = parts.cutGhost.clientHeight / (CUT_BANDS * 2);
    parts.cutMain.style.clipPath = bandsPolygon(C.bands);
    parts.cutGhost.style.opacity = C.ghost.toFixed(3);
    parts.cutGhost.style.transform = `translate3d(${C.jitter.toFixed(2)}%, 0, 0)`;
    const mask = `0 ${(C.step * band).toFixed(1)}px`;
    parts.cutGhost.style.setProperty('mask-position', mask);
    parts.cutGhost.style.setProperty('-webkit-mask-position', mask);
    parts.playhead.style.opacity = C.headOpacity.toFixed(3);
    parts.playhead.style.left = `${C.head.toFixed(2)}%`;

    for (const [key, at] of Object.entries(CUES) as Array<[keyof typeof CUES, number]>) {
      parts.cues[key].classList.toggle(onClass, f >= at);
    }
  };

  const finish = () => {
    reset();
    html.dataset.reveal = 'done';
    onDone();
  };

  // The projector warms up while the plate decodes. Give the plate up to
  // 2.5 s; never hold the page hostage to it.
  html.dataset.reveal = 'intro';
  Promise.all([settle(INTRO_MS), Promise.race([decoded, settle(2500)])]).then(() => {
    if (cancelled) return;
    started = true;
    html.dataset.reveal = 'playing';
    apply(0);
    const t0 = performance.now();
    let last = 0;
    const tick = (now: number) => {
      const f = Math.floor((now - t0) / FRAME_MS);
      if (f >= TOTAL_FRAMES) return finish();
      if (f !== last) {
        last = f;
        apply(f);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    if (started) reset();
    html.dataset.reveal = 'pending';
  };
}
