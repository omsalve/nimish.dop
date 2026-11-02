import { artists } from "../lib/artists";
import { Arrow, Asterisk } from "./symbols";
import { CONTACT_EMAIL } from "./closing";

export default function Archive() {
  return (
    <section
      id="archive"
      className="archive-section page-gutter"
      aria-labelledby="archive-title"
    >
      <div className="section-eyebrow">
        <span>THE PLACES. THE PEOPLE. THE NOISE.</span>
        <span>INDEX / 001—{String(artists.length).padStart(3, "0")}</span>
      </div>
      <div className="archive-heading">
        <p>
          <span className="film-type">PROOF OF</span> <span>LIFE.</span>
        </p>
        <div>
          <span>THE NIGHTS THAT STAY.</span>
          <p>
            The lights go out.
            <br />
            These don’t.
          </p>
          <Arrow direction="down" />
        </div>
      </div>
      <div className="ticket artist-ticket reveal">
        <div className="ticket-stub">
          <div className="ticket-stub-top">
            <Asterisk />
            <span>
              KEEP THIS
              <br />
              PART FOREVER.
            </span>
          </div>
          <h2 id="archive-title" className="film-type">
            I WAS
            <br />
            THERE<span>↗</span>
          </h2>
          <p>
            A few nights.
            <br />A thousand reasons to remember.
          </p>
          <div className="ticket-barcode" aria-hidden="true" />
          <div className="stub-serial">
            <span>Nº 000623</span>
            <span>ADMIT ONE</span>
          </div>
          <span className="ticket-notch notch-top" />
          <span className="ticket-notch notch-bottom" />
        </div>
        <div className="ticket-main">
          <div className="archive-topline">
            <span>THE ARTISTS. THE MEMORIES.</span>
            <span>{String(artists.length).padStart(2, "0")} ARTISTS</span>
          </div>
          <div className="archive-column-labels">
            <span>NO.</span>
            <span>ARTIST</span>
          </div>
          <ol className="concert-list artist-list" aria-label="Artists">
            {artists.map((artist, index) => (
              <li key={artist.id}>
                <a
                  className="concert-row artist-collection-link"
                  href={`#${artist.id}`}
                  aria-label={`View ${artist.name} photographs`}
                >
                  <span className="artist-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="concert-title">{artist.name}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="ticket-bottom">
            <span>
              {String(artists.length).padStart(2, "0")} ARTISTS / ONE GOOD REASON
              TO LOSE YOUR VOICE
            </span>
            <span>★ ALL AGES. ALL FEELING.</span>
          </div>
        </div>
      </div>
      <div className="contact-strip">
        <div className="contact-note">
          <span className="status-dot" />
          <p>
            INDEPENDENT EYE. FRONT-ROW HEART.
            <br />
            <span>Based in India. Following the music everywhere.</span>
          </p>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}`} className="contact-link">
          GOT A LOUD ONE? LET’S TALK <Arrow />
        </a>
      </div>
      <div className="journey-intro">
        <span>THE VOLUME GOES UP FROM HERE.</span>
        <svg viewBox="0 0 160 90" fill="none" aria-hidden="true">
          <path
            d="M12 15c39-18 119-8 113 24-3 18-57 7-57-10 0-23 51 6 56 46m-17-13 18 15 13-21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>JUST YOU & THE PHOTOGRAPHS. ↓</span>
      </div>
    </section>
  );
}
