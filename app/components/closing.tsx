import { artists } from "../lib/artists";
import { photographs } from "../lib/collection";
import { ContactForm } from "./contact-form";
import { SocialLinks } from "./social-links";
import { Arrow, Asterisk } from "./symbols";

export default function Closing() {
  return (
    <footer className="closing" id="contact" aria-labelledby="closing-title">
      <div className="closing-poster page-gutter">
        <div className="closing-stamp film-paper" aria-hidden="true">
          <span>ALL ACCESS</span>
          <Asterisk />
          <span>NO DISTANCE</span>
        </div>
        <h2 id="closing-title" className="closing-title">
          <span className="film-type">Got a loud one?</span>
          <br />
          <span className="closing-outline">Let’s talk.</span>
        </h2>
        <div className="closing-body">
          <p>
            Send the date, the city and the artist. I’ll bring the camera to
            the front.
          </p>
          <ContactForm />
        </div>
        <div className="closing-side">
          <dl className="closing-facts">
            <div>
              <dt>IN THE ARCHIVE</dt>
              <dd>{photographs.length} FRAMES</dd>
            </div>
            <div>
              <dt>ON THE TICKET</dt>
              <dd>{artists.length} ARTISTS</dd>
            </div>
            <div>
              <dt>BASED IN</dt>
              <dd>INDIA. FOLLOWING THE MUSIC.</dd>
            </div>
          </dl>
          <div className="closing-elsewhere">
            <span>OR FIND ME HERE</span>
            <SocialLinks />
          </div>
        </div>
      </div>
      <div className="closing-bottom page-gutter">
        <span>
          NIMISH<span>.</span> © 2026 — LOUD NIGHTS. STILL FRAMES.
        </span>
        <a href="#top">
          BACK TO THE FRONT <Arrow />
        </a>
      </div>
    </footer>
  );
}
