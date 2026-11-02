"use client";

import { useEffect, useRef } from "react";
import { frameStore, onFrame } from "../lib/frames";
import { photographs } from "../lib/collection";

const TOTAL = photographs.length;
// Measured from navigation start. The tear itself takes 640 ms, so the whole
// splash is gone before the three-second mark even on a cold, slow load.
const MAX_HOLD = 1950;
const MIN_HOLD = 1500;
const MIN_HOLD_QUICK = 650;
const TEAR = 640;

type Cell = { x: number; y: number; w: number; h: number; litAt: number };

function Sheet({ side }: { side: "top" | "bottom" }) {
  return (
    <div className={`splash-sheet splash-sheet-${side}`} data-splash-sheet={side}>
      <div className="splash-content">
      <canvas className="splash-mosaic" data-splash-canvas />
      <div className="splash-vignette" />
      <div className="splash-topline">
        <span className="splash-brand">
          NIMISH<span>.</span>
        </span>
        <span>LIVE ARCHIVE / {TOTAL} FRAMES</span>
      </div>
      <div className="splash-counter">
        <span className="splash-glow" />
        <span className="splash-figure">
          <span className="splash-count film-type" data-splash-count>
            <span>0</span>
            <span>0</span>
            <span>0</span>
          </span>
          <span className="splash-of">/{TOTAL}</span>
        </span>
      </div>
      <div className="splash-bottomline">
        <span data-splash-status>SOUNDCHECK. LOADING THE NIGHT.</span>
        <span>I SHOOT CONCERTS.</span>
      </div>
      <div className="splash-meter">
        <span data-splash-meter />
      </div>
      </div>
      <span
        className={`splash-rim ${side === "top" ? "tear-rim-bottom-2" : "tear-rim-top-2"}`}
        aria-hidden="true"
      />
    </div>
  );
}

export default function Splash() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    const html = document.documentElement;
    if (
      !element ||
      !html.classList.contains("splash-on") ||
      html.classList.contains("splash-forced")
    ) {
      // Either no splash was flagged, or the boot script's hard cap already lifted it.
      if (element) element.hidden = true;
      html.classList.add("splash-done");
      window.dispatchEvent(new Event("nimish:reveal"));
      return;
    }

    const calm = html.classList.contains("splash-calm");
    const quick = html.classList.contains("splash-quick");
    const store = frameStore();
    const canvases = Array.from(
      element.querySelectorAll<HTMLCanvasElement>("[data-splash-canvas]"),
    );
    const counters = Array.from(
      element.querySelectorAll<HTMLElement>("[data-splash-count]"),
    );
    const meters = Array.from(
      element.querySelectorAll<HTMLElement>("[data-splash-meter]"),
    );
    const statuses = Array.from(
      element.querySelectorAll<HTMLElement>("[data-splash-status]"),
    );
    const contexts = canvases.map((canvas) => canvas.getContext("2d"));
    let cells: Cell[] = [];
    let order: number[] = [];
    let frame = 0;
    let shown = 0;
    let lit = 0;
    let leaving = false;
    // Frames light up in the order they arrive, in step with the counter.
    const queue: number[] = [];
    let finished = false;
    const timers: number[] = [];

    // A fixed shuffle: frames land across the sheet like rig lights coming up.
    order = Array.from({ length: TOTAL }, (_, index) => index);
    let seed = 7;
    for (let i = order.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }

    function layout() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      // Portrait cells (3:4) tiled to fill the screen with at least 101 slots.
      const cols = Math.max(
        6,
        Math.round(Math.sqrt((TOTAL * width) / (height * 0.75))),
      );
      const rows = Math.ceil(TOTAL / cols);
      const w = width / cols;
      const h = height / rows;
      const previous = cells;
      cells = Array.from({ length: TOTAL }, (_, i) => {
        const slot = order[i];
        return {
          x: (slot % cols) * w,
          y: Math.floor(slot / cols) * h,
          w,
          h,
          litAt: previous[i]?.litAt ?? -1,
        };
      });
      canvases.forEach((canvas, i) => {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        contexts[i]?.setTransform(ratio, 0, 0, ratio, 0, 0);
      });
      paintAll();
    }

    function paintCell(index: number, now: number) {
      const cell = cells[index];
      const image =
        cell.litAt >= 0 && store.state[index] === 1 ? store.images[index] : null;
      const age = (now - cell.litAt) / 420;
      contexts.forEach((context) => {
        if (!context) return;
        context.clearRect(cell.x, cell.y, cell.w, cell.h);
        if (!image) {
          context.strokeStyle = "rgba(232,175,191,0.07)";
          context.strokeRect(cell.x + 0.5, cell.y + 0.5, cell.w - 1, cell.h - 1);
          return;
        }
        const scale = Math.max(
          cell.w / image.naturalWidth,
          cell.h / image.naturalHeight,
        );
        const sw = cell.w / scale;
        const sh = cell.h / scale;
        context.drawImage(
          image,
          (image.naturalWidth - sw) / 2,
          (image.naturalHeight - sh) / 2,
          sw,
          sh,
          cell.x + 1,
          cell.y + 1,
          cell.w - 2,
          cell.h - 2,
        );
        // Each frame flashes on at full exposure, then settles under the counter.
        const settle = calm ? 1 : Math.min(1, Math.max(0, age));
        context.fillStyle = `rgba(25,26,24,${(0.64 * settle).toFixed(3)})`;
        context.fillRect(cell.x, cell.y, cell.w, cell.h);
      });
    }

    function paintAll() {
      const now = performance.now();
      for (let i = 0; i < TOTAL; i++) paintCell(i, now);
    }

    function setText(nodes: HTMLElement[], text: string) {
      nodes.forEach((node) => {
        if (node.textContent !== text) node.textContent = text;
      });
    }

    function heroReady() {
      const image = document.querySelector<HTMLImageElement>(
        "[data-hero-slide='0'] img",
      );
      return !image || (image.complete && image.naturalWidth > 0);
    }

    function tick() {
      if (finished) return;
      const now = performance.now();
      // The counter chases the real number of frames in, never ahead of it.
      const target = store.loaded;
      shown += Math.max(0, target - shown) * (calm ? 1 : 0.22);
      if (target - shown < 0.5) shown = target;
      const digits = String(Math.round(shown)).padStart(3, "0");
      counters.forEach((counter) =>
        Array.from(counter.children).forEach((cell, i) => {
          if (cell.textContent !== digits[i]) cell.textContent = digits[i];
        }),
      );
      while (lit < queue.length && lit < Math.round(shown)) {
        const index = queue[lit++];
        cells[index].litAt = now;
        paintCell(index, now);
      }
      const progress = Math.round(shown) / TOTAL;
      meters.forEach((meter) => {
        meter.style.transform = `scaleX(${progress.toFixed(4)})`;
      });
      cells.forEach((cell, index) => {
        if (cell.litAt >= 0 && now - cell.litAt < 460) paintCell(index, now);
      });

      const hold = quick ? MIN_HOLD_QUICK : MIN_HOLD;
      const ready =
        (store.loaded >= TOTAL || store.saveData) && heroReady() && Math.round(shown) >= store.loaded;
      if (!leaving && ((ready && now >= hold) || now >= MAX_HOLD)) leave();
      frame = requestAnimationFrame(tick);
    }

    function leave() {
      leaving = true;
      if (html.classList.contains("splash-forced")) return finish();
      setText(
        statuses,
        store.loaded >= TOTAL
          ? "DOORS OPEN."
          : "DOORS OPEN. THE REST LOADS AS YOU GO.",
      );
      element!.classList.add("is-leaving");
      window.dispatchEvent(new Event("nimish:reveal"));
      html.classList.add("splash-done");
      timers.push(
        window.setTimeout(finish, calm ? 320 : TEAR + 60),
      );
    }

    function finish() {
      finished = true;
      cancelAnimationFrame(frame);
      html.classList.remove("splash-on");
      element!.hidden = true;
    }

    const unsubscribe = onFrame((index, ok) => {
      if (ok) queue.push(index);
    });

    order.forEach((index) => {
      if (store.state[index] === 1) queue.push(index);
    });
    layout();
    window.addEventListener("resize", layout);
    frame = requestAnimationFrame(tick);

    return () => {
      finished = true;
      cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      unsubscribe();
      window.removeEventListener("resize", layout);
      html.classList.remove("splash-on");
      html.classList.add("splash-done");
    };
  }, []);

  return (
    <div className="splash" ref={root} aria-hidden="true">
      <Sheet side="top" />
      <Sheet side="bottom" />
    </div>
  );
}
