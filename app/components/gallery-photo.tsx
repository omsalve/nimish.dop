"use client";

import Image from "./portfolio-image";
import { photographs } from "../lib/collection";
import { previewUrl } from "../lib/cloudinary";
import { Arrow } from "./symbols";

type GalleryPhotoProps = {
  index: number;
  onOpen: (index: number, trigger: HTMLButtonElement) => void;
  className?: string;
  sizes?: string;
  focus?: string;
};

export function GalleryPhoto({
  index,
  onOpen,
  className = "",
  sizes = "100vw",
  focus,
}: GalleryPhotoProps) {
  const item = photographs[index];
  return (
    <button
      type="button"
      className={`photo-button ${className}`}
      data-photo-index={index}
      onClick={(event) => onOpen(index, event.currentTarget)}
      aria-label={`Open photograph ${item.number}: ${item.alt}`}
      // The splash already fetched this preview, so the slot is never blank.
      style={
        {
          backgroundImage: `url("${previewUrl(item.src)}")`,
          "--focus": focus,
        } as React.CSSProperties
      }
    >
      <Image src={item.src} alt={item.alt} fill sizes={sizes} />
      <span className="photo-expand" aria-hidden="true">
        VIEW FRAME {item.number} <Arrow />
      </span>
    </button>
  );
}
