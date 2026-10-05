import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import { SmoothScroll } from '@/components/SmoothScroll';
import { SiteNav } from '@/components/SiteNav';
import './globals.css';

const switzer = localFont({
  src: [
    { path: './fonts/Switzer-Variable.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/Switzer-VariableItalic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-switzer',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
});

const description = `${site.name} is a filmmaker, director and editor who lights, shoots and cuts his own films. ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, filmmaker`,
    template: `%s · ${site.name}`,
  },
  description,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name}, filmmaker`,
    description,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a09',
  colorScheme: 'dark',
};

// The direction this build was made against; kept in the markup so it can be audited.
const CONTRACT = `<!--
THESIS: A black-box screening room. The work arrives the way film does: a projector warms up, a letterboxed reel cuts between four films, then the full program of fifteen is projected one title at a time. Refuses the dark-portfolio card grid under a hero.
OWN-WORLD: Black seamless (#0a0a09), print-white Switzer set tight, soft greys, one 3200K tungsten light only on what is live. Letterbox bars that take each film's true aspect ratio. Silver grain at 10 fps. Cuts, wipes, irises, dissolves, a shutter between pages.
STORY: Visitors see Nimish's process (light, frame, cut), watch the reel, scan all fifteen films by kind, open one, and get in touch.
FIRST VIEWPORT: Gate flicker and letterbox open onto a full-bleed 3:1 black-cyc plate in three beats revealed left to right at 10 fps; the name large below it at left; roles, tagline and the way into the reel at right.
FORM: User-pinned inversion of the incumbent white-cyc world (seed 599f6c0a): black studio, reel plus projected program, projector warm-up.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={switzer.variable} suppressHydrationWarning>
      <body>
        <template dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <SiteNav />
        {children}
        <div className="grain" aria-hidden="true" />
        <div className="film-gate" aria-hidden="true" />
      </body>
    </html>
  );
}
