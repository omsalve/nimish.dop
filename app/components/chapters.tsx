"use client";

import Image from "./portfolio-image";
import { photographs, type ArtistCollection } from "../lib/collection";
import { previewUrl } from "../lib/cloudinary";
import { GalleryPhoto } from "./gallery-photo";
import { Arrow } from "./symbols";

export type OpenPhoto = (
  index: number,
  trigger: HTMLElement,
  from?: DOMRect,
) => void;

type ChapterProps = {
  collection: ArtistCollection;
  onOpen: OpenPhoto;
};

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/**
 * The transition into each artist: three frames, each exposed whole through a
 * shutter gate with a burst of light. Scroll is the timeline. The sequence is
 * a reprise; every frame's home is in the archive that follows, so it is
 * hidden from assistive technology and skipped by the keyboard.
 */
function Shots({ collection, onOpen }: ChapterProps) {
  return (
    <div className="shots" data-shots aria-hidden="true">
      <div className="shots-stage">
        <span className="shots-light" data-shots-light />
        {collection.lead.map((shot, k) => {
          const photo = photographs[shot.index];
          return (
            <div
              key={photo.src}
              className="shot"
              data-shot={k}
              style={{ "--ar": (photo.width / photo.height).toFixed(4) } as React.CSSProperties}
            >
              <div className="shot-gate" data-shot-gate>
                <button
                  type="button"
                  tabIndex={-1}
                  className="photo-button shot-film"
                  data-shot-film
                  style={{ backgroundImage: `url("${previewUrl(photo.src)}")` }}
                  onClick={(event) => {
                    // Return focus to the frame's home in the archive below.
                    const home = document.querySelector<HTMLElement>(
                      `#${collection.id} .justified [data-photo-index="${shot.index}"]`,
                    );
                    onOpen(
                      shot.index,
                      home ?? event.currentTarget,
                      event.currentTarget.getBoundingClientRect(),
                    );
                  }}
                >
                  <Image src={photo.src} alt="" fill sizes="(max-width: 700px) 94vw, 86vw" />
                </button>
              </div>
              <span className="shot-flash" data-shot-flash />
              <span className="shot-label">
                N. {photo.number}
              </span>
            </div>
          );
        })}
        <div className="shots-rail page-gutter">
          <span>
            {collection.order} / {collection.name.toUpperCase()}
          </span>
          <span>
            SHOT <span data-shot-count>01</span> / {pad(collection.lead.length)}
          </span>
        </div>
        {collection.note && <p className="shots-note handwritten">{collection.note}</p>}
      </div>
    </div>
  );
}

/** The whole night: every frame of the artist, uncropped, in justified rows. */
function ArtistArchive({ collection, onOpen }: ChapterProps) {
  return (
    <div className="artist-archive page-gutter">
      <div className="artist-archive-head">
        <span>THE WHOLE NIGHT</span>
        <span>
          {pad(collection.indexes.length)} FRAMES / {collection.first}—{collection.last}
        </span>
      </div>
      <ul
        className="justified"
        aria-label={`${collection.name}, all ${collection.indexes.length} photographs`}
      >
        {collection.indexes.map((index, i) => {
          const photo = photographs[index];
          return (
            <li
              key={photo.src}
              className="frame"
              data-develop
              style={
                {
                  "--ar": (photo.width / photo.height).toFixed(4),
                  "--d": i % 4,
                } as React.CSSProperties
              }
            >
              <GalleryPhoto
                index={index}
                onOpen={onOpen}
                sizes="(max-width: 700px) 92vw, (max-width: 1100px) 50vw, 40vw"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Chapter(props: ChapterProps) {
  const { collection } = props;
  return (
    <section
      className="chapter"
      id={collection.id}
      aria-labelledby={`${collection.id}-title`}
      data-chapter
    >
      <header className="chapter-card page-gutter">
        <span className="chapter-light" aria-hidden="true" />
        <h2 id={`${collection.id}-title`} className="chapter-name film-type">
          {collection.name}
        </h2>
        <div className="chapter-meta">
          <span className="chapter-order">NO. {collection.order}</span>
          <span>
            {pad(collection.indexes.length)} FRAMES / {collection.first}—{collection.last}
          </span>
          <a href="#archive" className="chapter-back">
            BACK TO THE TICKET <Arrow />
          </a>
        </div>
      </header>
      <Shots {...props} />
      <ArtistArchive {...props} />
    </section>
  );
}
