"use client";

import { useEffect, useState } from "react";
import { Arrow } from "./symbols";

/** The booking stub's twin: keeps the way back to the ticket in reach through the chapters. */
export default function BackStub() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const ticket = document.querySelector(".artist-ticket");
    const closing = document.getElementById("contact");
    let frame = 0;
    function update() {
      frame = 0;
      if (!ticket || !closing) return;
      const pastTicket = ticket.getBoundingClientRect().bottom < 0;
      const atClose = closing.getBoundingClientRect().top < window.innerHeight * 0.9;
      setShown(pastTicket && !atClose);
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
      href="#archive"
      className={`booking-stub back-stub${shown ? " is-shown" : ""}`}
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
    >
      <Arrow direction="left" />
      <span>BACK TO THE TICKET</span>
      <span className="booking-stub-perf" aria-hidden="true" />
    </a>
  );
}
