# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (confirmed): producers, agency creative teams and brand leads who commission a filmmaker for brand films, music videos and short-form work. They usually arrive from a link (Instagram, a referral, a pitch email), judge taste from the first viewport, open one or two films to check craft and Nimish's role on them, then decide whether to get in touch.

Secondary (inferred from the brief, not confirmed): collaborators and fellow filmmakers checking authorship and process.

## Product Purpose

A showcase portfolio for Nimish Kandalkar, filmmaker, director and editor. It shows the finished work and the process behind it, so that a visitor trusts Nimish with a commission. Success means a producer watches a film and then makes contact.

## Positioning

Process-first. One person who lights the set, shoots the frame and cuts the film. The site shows craft across all three stages of making, not only finished frames.

## Operating Context

Visitors often come from Instagram on a phone, or from an email link on a laptop between other tasks. They scan quickly and decide on taste. Full films live on external players (Vimeo or YouTube); the site carries stills, short silent loops and the breakdown of each project.

## Capabilities and Constraints

- Existing scaffold: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.
- Showcase only. No pricing, rates, packages or booking flows (confirmed).
- Home: hero first, then a four-film reel, then the full program of every film (about 15, confirmed 2026-10-03), filterable by kind, as the primary content.
- Project pages: logline, concept and role bullets, key shots, a small behind-the-scenes gallery, credits, and a call to watch the full film or get in touch.
- Smooth, inertia-style scrolling with Lenis (brief requirement).
- Hover previews are short, muted loops.

## Brand Commitments

- Name: Nimish Kandalkar. Roles line: filmmaker · director · editor.
- Voice: concise, craft-forward, no hype. Reference line from the brief: "crafting frames that mean something".
- Instagram: @imnimishh_ (confirmed by the user).
- Binding visual constraints, as revised by the user on 2026-10-03: the colours are inverted to a black studio throughout (black cyclorama, print-white type, soft greys) with a single warm tungsten highlight; the hero photograph is now briefed on a black backdrop; subtle film grain; large sans for the name with tighter tracking on the tagline; a three-beat hero (lighting, camera, edit) revealed left to right in a deliberate low-frame-rate filmic sequence, preceded once per visit by a short projector warm-up.
- The site should feel highly cinematic, not minimal (user, 2026-10-03): transitions and motion carry film grammar throughout. The original white-cyc, minimal brief is superseded.

## Evidence on Hand

- No real project titles, loglines, credits, stills, preview loops, behind-the-scenes images or hero photography exist in the repo yet.
- The site ships with fifteen clearly flagged placeholder projects and generated placeholder art (confirmed). They must never be presented as real work, and every placeholder must be easy to find and replace.
- The contact email is unknown and stays a visible placeholder until supplied.
- There are no testimonials, client lists, awards, festival selections or press. Do not invent any.

## Product Principles

1. The work leads. The interface is the projection room around it, never a frame competing with it.
2. Every motion is a film-language gesture with a job (a cut, a wipe, an iris, a dissolve, a focus pull), and there is plenty of it.
3. Show process as well as results: light, frame, cut.
4. Earn trust through restraint. No hype, no fabricated proof, no pricing.
5. Stay quick on a phone. Stills and loops are heavy, so media loads only when it is needed.
