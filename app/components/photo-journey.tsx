"use client";

import Image from "./portfolio-image";
import { useEffect, useRef, useState } from "react";
import { collections, concerts, photographs } from "../lib/collection";
import { previewUrl } from "../lib/cloudinary";
import { Chapter, type OpenPhoto } from "./chapters";
import { FlapText } from "./flap-text";
import { Rig } from "./rig";
import { Arrow } from "./symbols";

function focusOf(trigger: HTMLElement) {
  const image = trigger.querySelector("img");
  const position = image ? getComputedStyle(image).objectPosition : "50% 50%";
  const [x = "50%", y = "50%"] = position.split(" ");
  const read = (value: string) => (value.endsWith("%") ? parseFloat(value) / 100 : 0.5);
  return [read(x), read(y)];
}

/**
 * The opening shot: the clicked crop flies to the full frame. It starts as the
 * exact cover-crop the visitor saw and uncrops while it travels.
 */
function flyIn(
  dialog: HTMLDialogElement,
  stage: HTMLElement,
  index: number,
  from: DOMRect,
  focus: number[],
) {
  const photo = photographs[index];
  const box = stage.getBoundingClientRect();
  const aspect = photo.width / photo.height;
  let width = box.width;
  let height = width / aspect;
  if (height > box.height) {
    height = box.height;
    width = height * aspect;
  }
  const left = box.left + (box.width - width) / 2;
  const top = box.top + (box.height - height) / 2;
  const scale = Math.max(from.width / width, from.height / height);
  const spareX = (width * scale - from.width) / scale;
  const spareY = (height * scale - from.height) / scale;
  const insetLeft = spareX * focus[0];
  const insetTop = spareY * focus[1];
  const flight = document.createElement("img");
  flight.src = previewUrl(photo.src);
  flight.alt = "";
  flight.className = "lightbox-flight";
  Object.assign(flight.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  dialog.appendChild(flight);
  const animation = flight.animate(
    [
      {
        transform: `translate(${from.left - left - insetLeft * scale}px, ${
          from.top - top - insetTop * scale
        }px) scale(${scale})`,
        clipPath: `inset(${insetTop}px ${spareX - insetLeft}px ${spareY - insetTop}px ${insetLeft}px)`,
      },
      { transform: "none", clipPath: "inset(0px 0px 0px 0px)" },
    ],
    { duration: 620, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
  animation.finished.finally(() => flight.remove());
}

/**
 * The Rig, then the ticket (passed in so it stays a server component), then the
 * nine chapters. All three share one viewer, so they live under one owner.
 */
export default function PhotoJourney({ ticket }: { ticket: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const openingPhoto = useRef<HTMLElement | null>(null);
  const openingRect = useRef<DOMRect | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const photo = photographs[active];
  const concert = concerts[photo.concert];

  useEffect(() => {
    const viewer = dialog.current;
    if (!isOpen || !viewer) return;

    const previousOverflow = document.body.style.overflow;
    // Open only after React has committed the viewer and its autofocus control.
    if (!viewer.open) viewer.showModal();
    document.body.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const trigger = openingPhoto.current;
    const from = openingRect.current ?? trigger?.getBoundingClientRect();
    if (!reduced && stage.current && from && from.width > 0) {
      flyIn(viewer, stage.current, active, from, trigger ? focusOf(trigger) : [0.5, 0.5]);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      if (viewer.open) viewer.close();
      viewer.querySelectorAll(".lightbox-flight").forEach((node) => node.remove());
      // Keep the opening frame focused, including in browsers that do not restore it.
      if (openingPhoto.current?.isConnected) {
        openingPhoto.current.focus({ preventScroll: true });
      }
      touchStart.current = null;
    };
    // The flight belongs to the opening frame only; later frames are hard cuts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const open: OpenPhoto = (index, trigger, from) => {
    openingPhoto.current = trigger;
    openingRect.current = from ?? null;
    setActive(index);
    setIsOpen(true);
  };

  function close() {
    setIsOpen(false);
  }

  function move(direction: number) {
    setActive(
      (index) => (index + direction + photographs.length) % photographs.length,
    );
  }

  const artistFrames = collections[photo.concert].indexes.length;

  return (
    <div className="photo-journey" id="photographs">
      <Rig onOpen={open} />

      {ticket}

      {collections.map((collection) => (
        <Chapter collection={collection} onOpen={open} key={collection.id} />
      ))}

      <dialog
        className="lightbox"
        ref={dialog}
        aria-label="Photograph viewer"
        onClose={() => setIsOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {isOpen && (
          <>
            <div className="lightbox-topline">
              <span className="lightbox-brand">
                NIMISH<span>.</span> / LIVE ARCHIVE
              </span>
              <button
                type="button"
                autoFocus
                className="lightbox-close"
                onClick={close}
                aria-label="Close photograph viewer"
              >
                <span>CLOSE</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
            <div
              className="lightbox-stage"
              ref={stage}
              style={{ backgroundImage: `url("${previewUrl(photo.src)}")` }}
              onTouchStart={(event) => {
                const touch = event.changedTouches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={(event) => {
                if (!touchStart.current) return;
                const touch = event.changedTouches[0];
                const horizontal = touch.clientX - touchStart.current.x;
                const vertical = touch.clientY - touchStart.current.y;
                if (
                  Math.abs(horizontal) > 60 &&
                  Math.abs(horizontal) > Math.abs(vertical)
                ) {
                  move(horizontal < 0 ? 1 : -1);
                }
                touchStart.current = null;
              }}
              onTouchCancel={() => {
                touchStart.current = null;
              }}
            >
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="lightbox-image"
              />
            </div>
            <div className="lightbox-bottom">
              <div className="lightbox-title">
                <span className="lightbox-artist">{concert.title}</span>
                <small>
                  FRAME {photo.frame} OF {String(artistFrames).padStart(2, "0")} FROM THIS NIGHT
                </small>
              </div>
              <div className="lightbox-controls">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous photograph"
                >
                  <Arrow direction="left" />
                </button>
                <span aria-live="polite" className="lightbox-count">
                  <FlapText text={photo.number} /> / {String(photographs.length).padStart(3, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next photograph"
                >
                  <Arrow direction="right" />
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
