import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./cinema.css";
import "./grain.css";
import "./splash.css";
import "./chapters.css";
import "./rig.css";
import "./closing.css";
import { bootScript } from "./lib/boot";
import { heroPhotograph } from "./lib/featured";

const display = localFont({
  src: "../public/fonts/anton-latin.woff2",
  variable: "--font-display",
  display: "swap",
});
const mono = localFont({
  src: [
    {
      path: "../public/fonts/ibm-plex-mono-regular-latin.woff2",
      weight: "400",
    },
    { path: "../public/fonts/ibm-plex-mono-medium-latin.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: "NIMISH. — I shoot concerts.",
  description:
    "Independent concert photography. The split second, the sweat, the silence after the last song. A collection of loud memories by Nimish.",
  openGraph: {
    title: "NIMISH. — I shoot concerts.",
    description: "Live music, through my lens. A collection of loud memories.",
    type: "website",
    images: [
      {
        url: heroPhotograph.src.replace(
          "/image/upload/",
          "/image/upload/c_fill,w_1200,h_630,g_auto/q_auto:best/f_jpg/",
        ),
        width: 1200,
        height: 630,
        alt: heroPhotograph.alt,
      },
    ],
  },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// The direction this build answers to. Kept in the shipped markup on purpose.
const contract = `<!--
THESIS: A live archive where every photograph is an exposure: shown whole, opened through a shutter, on one pure black ground. It refuses cropped collage grids and the fade-up section stack.
OWN-WORLD: One pure black ground, no texture; white ink with grain printed into it; white ticket paper and stamps; stage light exists only as light, haze, and the shutter flash.
STORY: A booker sees the range across nine artists, opens any of the 101 frames full screen, and writes to Nimish.
FIRST VIEWPORT: A splash mosaic counts all 101 frames in, then tears open onto the poster: giant grainy NIMISH. over an exposure-crossfade slideshow, copy left, keepsake print right, LET'S TALK top right.
FORM: Brief-pinned concert poster with the user's corrections of 2026-11-03, seed 88e3f9fe. Raises: the hottest light only on the element in focus; hard cuts between frames; split-flap counters. Signature: The Rig, directly after the poster; the ticket follows it.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <template dangerouslySetInnerHTML={{ __html: contract }} />
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: bootScript() }}
        />
        {children}
      </body>
    </html>
  );
}
