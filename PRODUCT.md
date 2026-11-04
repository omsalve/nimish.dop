# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bookers: artists, managers, promoters and labels deciding whether to hire Nimish to shoot a show. They arrive from a link (DM, email, bio) and judge range, access and consistency from the photographs themselves. Success is that they reach out ("Let's talk"). Fans and the artists photographed are a welcome secondary audience, not the target.

## Product Purpose

NIMISH. is the portfolio of an independent concert photographer. It presents a live archive of 101 photographs across nine artists and turns a booker's browsing into a conversation. The work is the argument: every frame must load fast, look exactly as shot, and open full screen.

## Positioning

Front-row, in-the-pit concert photography shot across very different stages, from Bollywood headline shows (Himesh Reshammiya, Javed Ali, Shilpa Rao, Roopkumar Rathod) to hip-hop and independent acts (Seedhe Maut, Mass Appeal, Chaar Diwari, Gajendar Verma, Ayushmann Khurrana). Range shown, never claimed.

## Operating Context

- Visitors see it on desktop and phones; phone traffic from shared links is likely (inferred, not confirmed).
- Contact is a booking form in the close, delivered by email through Resend's free plan via a Server Action, with the email address shown as a fallback. Instagram, Behance and WhatsApp buttons sit on the hero and in the close.
- Photographs are delivered from Cloudinary (Free plan: 25 shared monthly credits for storage, bandwidth and transformations).

## Capabilities and Constraints

- Next.js 16 (App Router, Cache Components), React 19, CSS, Lenis smooth scrolling. No CMS.
- 101 photographs in `app/lib/cloudinary-photos.json`; every photograph has exactly one home slot on the page and opens in a full-screen viewer. Decorative reuse (hero slideshow, splash, set pieces) is allowed.
- A splash screen preloads the photographs before the page is revealed; it must never take longer than 3 seconds.
- Reduced motion and keyboard access must keep every photograph reachable.
- Open: the real contact email (currently the sample `hello@nimish.photo`), the real social handles and WhatsApp number (placeholders in `app/lib/socials.ts`), and the Resend keys.
- Billing order on the ticket and in the archive: Himesh Reshammiya, Ayushmann Khurrana, Shilpa Rao, Seedhe Maut, Mass Appeal, then the rest in any order (user decision, 2026-11-04).

## Brand Commitments

- Name written `NIMISH.` with the period. Line: "I Shoot Concerts"
- The hero composition and the perforated ticket section are loved and must be preserved.
- The site is black and white: white ink on a black ground, and stage light is white too. It appears only as light (haze, beams, glow), never as a second ink. The photographs keep their colour. (User decision, 2026-11-03, replacing pink on charcoal with red stage light.)
- Film grain belongs to the site's own components and type, never on the photographs.
- Binding reference: an edgy concert aesthetic of torn-paper photo collages, red stage light, smoke and scanned-print grain.
- Anton and IBM Plex Mono are self-hosted with their licenses in `public/fonts/`.

## Evidence on Hand

- 101 supplied photographs, nine artists, accurate alt text (`app/lib/cloudinary-photos.json`).
- No testimonials, press, client logos, prices, dates or venues exist. Do not invent them.

## Product Principles

1. The photographs are the proof; nothing on the page may degrade them.
2. Every frame is one click from full screen.
3. The way to reach Nimish is always within reach.
4. Loud presentation, honest content: atmosphere is authored, facts are not.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` with a complete static path, keep keyboard navigation through every photograph and the viewer, avoid flashes faster than three per second, and keep text contrast legible over imagery.
