"use client";

import { useEffect, useState } from "react";
import { Arrow } from "./symbols";

/** A tear-off stub that keeps the way to book within reach between hero and close. */
export default function BookingStub() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const closing = document.getElementById("contact");
    const rig = document.getElementById("encore");
    // The first section after the poster; the stub appears once the poster is gone.
    const start = rig ?? document.getElementById("archive");
    let frame = 0;
    function update() {
      frame = 0;
      if (!start || !closing) return;
      const past = start.getBoundingClientRect().top < window.innerHeight * 0.1;
      const atClose = closing.getBoundingClientRect().top < window.innerHeight * 0.9;
      // The rig has its own controls along the bottom; step aside while it plays.
      const rigBounds = rig?.getBoundingClientRect();
      const onRig =
        !!rigBounds && rigBounds.top < window.innerHeight * 0.5 && rigBounds.bottom > window.innerHeight * 0.5;
      setShown(past && !atClose && !onRig);
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <a
      href="#contact"
      className={`booking-stub${shown ? " is-shown" : ""}`}
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
    >
      <span className="booking-stub-perf" aria-hidden="true" />
      <span>LET’S TALK</span>
      <Arrow />
    </a>
  );
}
