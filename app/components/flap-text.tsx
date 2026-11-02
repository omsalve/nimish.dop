"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Departure-board lettering: on change, each character flips through a few
 * glyphs and lands left to right. Screen readers get the settled text only.
 */
export function FlapText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const display = useRef<HTMLSpanElement>(null);
  const previous = useRef(text);
  // React owns only the first render; later changes are animated in place.
  const [initial] = useState(text);

  useEffect(() => {
    const element = display.current;
    if (!element) return;
    const from = previous.current;
    previous.current = text;
    if (
      from === text ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      element.textContent = text;
      return;
    }
    const length = Math.max(from.length, text.length);
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const elapsed = now - start;
      let output = "";
      let settled = true;
      for (let i = 0; i < length; i++) {
        const target = text[i] ?? " ";
        const lands = 120 + i * 24;
        if (elapsed >= lands || target === " ") output += target;
        else {
          settled = false;
          output +=
            elapsed < i * 24
              ? (from[i] ?? " ")
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      element.textContent = output.replace(/\s+$/, "");
      if (!settled) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  return (
    <span className={`flap ${className}`}>
      <span aria-hidden="true" ref={display}>
        {initial}
      </span>
      <span className="visually-hidden">{text}</span>
    </span>
  );
}
