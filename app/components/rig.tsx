"use client";

import { useEffect, useRef, useState } from "react";
import { concerts, photographs } from "../lib/collection";
import { previewUrl } from "../lib/cloudinary";
import { loadedFrame, requestFrame } from "../lib/frames";
import { useReducedMotion } from "../lib/use-reduced-motion";
import type { Rig as RigEngine } from "../lib/rig-gl";
import type { OpenPhoto } from "./chapters";
import { FlapText } from "./flap-text";
import { Arrow } from "./symbols";

const TOTAL = photographs.length;
const caption = (index: number) => {
  const photo = photographs[index];
  return `${photo.number} ${concerts[photo.concert].name.toUpperCase()}`;
};

export function Rig({ onOpen }: { onOpen: OpenPhoto }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const engine = useRef<RigEngine | null>(null);
  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<"waiting" | "live" | "fallback">("waiting");

  useEffect(() => {
    const element = section.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let visible = false;
    let scrollFrame = 0;

    function progress() {
      scrollFrame = 0;
      if (!engine.current || !element) return;
      const bounds = element.getBoundingClientRect();
      const range = Math.max(1, bounds.height - window.innerHeight);
      engine.current.setProgress(-bounds.top / range);
    }
    const onScroll = () => {
      if (!scrollFrame && visible) scrollFrame = requestAnimationFrame(progress);
    };

    let building = false;
    let settleTimer = 0;
    async function build() {
      if (building || disposed || !surface) return;
      building = true;
      window.clearTimeout(settleTimer);
      window.removeEventListener("nimish:reveal", afterReveal);
      window.removeEventListener("scroll", build);
      photographs.forEach((_, index) => requestFrame(index));
      try {
        const { createRig } = await import("../lib/rig-gl");
        if (disposed) return;
        const rig = createRig({
          canvas: surface,
          frames: photographs.map(({ width, height }) => ({ width, height })),
          image: loadedFrame,
          reducedMotion: reduced,
          onFront: (index) => setFront(index),
          onHover: (index) => setHovered(index),
        });
        if (!rig) {
          setMode("fallback");
          return;
        }
        engine.current = rig;
        setMode("live");
        progress();
        if (visible) rig.start();
      } catch {
        setMode("fallback");
      }
    }
    // The Rig sits directly under the poster, so it is "near" on first paint.
    // Let the splash tear and the poster land before compiling shaders and
    // uploading 101 textures; the first scroll builds it at once.
    function afterReveal() {
      settleTimer = window.setTimeout(build, 1200);
      window.addEventListener("scroll", build, { once: true, passive: true });
    }
    const html = document.documentElement;
    const splashCovering = () =>
      html.classList.contains("splash-on") && !html.classList.contains("splash-done");

    // Build the GL scene only as the section approaches; start/stop with visibility.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || engine.current) return;
        near.disconnect();
        if (splashCovering()) window.addEventListener("nimish:reveal", afterReveal, { once: true });
        else afterReveal();
      },
      { rootMargin: "120% 0px" },
    );
    const onscreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        progress();
        engine.current?.start();
      } else engine.current?.stop();
    });
    near.observe(element);
    onscreen.observe(element);

    const onResize = () => engine.current?.resize();
    const onVisibility = () => {
      if (document.hidden) engine.current?.stop();
      else if (visible) engine.current?.start();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      engine.current?.stop();
      setMode("fallback");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    surface.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      window.clearTimeout(settleTimer);
      window.removeEventListener("nimish:reveal", afterReveal);
      window.removeEventListener("scroll", build);
      near.disconnect();
      onscreen.disconnect();
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      surface.removeEventListener("webglcontextlost", onLost);
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setPlaying(playing);
  }, [playing, mode]);

  // Pointer: hover lifts a frame, drag spins the truss, a clean click opens it.
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  function local(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  }

  function step(direction: number) {
    const next = (front + direction + TOTAL) % TOTAL;
    setFront(next);
    engine.current?.focus(next);
  }

  function openFront() {
    if (!openButton.current) return;
    onOpen(front, openButton.current, engine.current?.frameRect(front) ?? undefined);
  }

  const shown = hovered ?? front;

  return (
    <section
      id="encore"
      ref={section}
      className={`rig-section rig-${mode}`}
      aria-labelledby="rig-title"
      data-rig
    >
      <div className="rig-stage">
        <canvas
          ref={canvas}
          className="rig-canvas"
          aria-hidden="true"
          style={{ cursor: hovered !== null ? "pointer" : "grab" }}
          onPointerMove={(event) => {
            const point = local(event);
            if (press.current) {
              const moved =
                Math.abs(event.clientX - press.current.x) +
                Math.abs(event.clientY - press.current.y);
              if (moved > 6) press.current.moved = true;
            }
            engine.current?.setPointer(point.x, point.y);
          }}
          onPointerLeave={() => engine.current?.leave()}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            press.current = { x: event.clientX, y: event.clientY, moved: false };
            engine.current?.press(local(event).x);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const point = local(event);
            engine.current?.release();
            const gesture = press.current;
            press.current = null;
            if (!gesture || gesture.moved || !engine.current || !openButton.current) return;
            const index = engine.current.pickAt(point.x, point.y);
            if (index !== null)
              onOpen(index, openButton.current, engine.current.frameRect(index) ?? undefined);
          }}
          onPointerCancel={() => {
            press.current = null;
            engine.current?.release();
          }}
        />
        <div className="rig-crowd" aria-hidden="true" />
        {mode === "fallback" && (
          <ol className="rig-fallback" aria-label="All photographs">
            {photographs.map((photo, index) => (
              <li key={photo.src}>
                <button
                  type="button"
                  aria-label={`Open photograph ${photo.number}: ${photo.alt}`}
                  style={{ backgroundImage: `url("${previewUrl(photo.src)}")` }}
                  onClick={(event) => onOpen(index, event.currentTarget)}
                />
              </li>
            ))}
          </ol>
        )}
        <header className="rig-head page-gutter">
          <h2 id="rig-title" className="film-type">
            Every frame.{" "}
            <br />
            One rig.
          </h2>
          <p>
            All {TOTAL} photographs from the archive, hung on one turning truss.
            Drag to spin it. Click a frame to see it whole.
          </p>
        </header>
        <div className="rig-bar page-gutter">
          <div className="rig-caption">
            <span>{hovered !== null ? "UNDER THE CURSOR" : "ON THE FRONT"}</span>
            <FlapText text={caption(shown)} className="rig-caption-title" />
          </div>
          <div className="rig-controls">
            <button type="button" onClick={() => step(-1)} aria-label="Bring the previous frame to the front">
              <Arrow direction="left" />
            </button>
            <button
              type="button"
              ref={openButton}
              className="rig-open"
              onClick={openFront}
            >
              OPEN FRAME {photographs[front].number} <Arrow />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Bring the next frame to the front">
              <Arrow direction="right" />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                className="rig-toggle"
                aria-pressed={!playing}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? "HOLD THE RIG" : "TURN THE RIG"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
