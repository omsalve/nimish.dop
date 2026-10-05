import type { StaticImageData } from 'next/image';
import heroSet from './media/hero/set.jpg';

/**
 * Site-wide facts. Edit here; every page reads from this file.
 *
 * Anything marked PLACEHOLDER is stand-in material that must be replaced or
 * confirmed by Nimish before the site goes public.
 */

export type Beat = {
  key: 'light' | 'frame' | 'cut';
  /** One word, shown under each third of the hero and in the process section. */
  label: string;
  /** One sentence for the process section. PLACEHOLDER copy, for Nimish to confirm. */
  line: string;
  /** Vertical focus (0–100) of this third when phones stack the beats as bands. */
  focusY: number;
};

export const site = {
  name: 'Nimish Kandalkar',
  roles: ['Filmmaker', 'Director', 'Editor'],
  tagline: 'Crafting frames that mean something.',

  /** Used for canonical URLs and share cards. Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  hero: {
    /**
     * PLACEHOLDER: a drawn studio set standing in for the real photograph.
     * Replace with one wide frame (3:1, at least 3840 × 1280) of Nimish on a
     * white cyc: lighting on the left, behind the camera in the centre, at the
     * edit desk on the right. The reveal splits it into thirds on its own.
     */
    image: heroSet as StaticImageData,
    alt: 'A white studio cyclorama with a tungsten fresnel on a stand at left, a cinema camera on a tripod at centre and an edit desk with a timeline on screen at right.',
    /** Vertical focus (0–100) used when the frame is cropped shorter than 3:1. */
    focusY: 58,
  },

  beats: [
    { key: 'light', label: 'Light', focusY: 42, line: 'Where the light comes from decides what a scene is about.' },
    { key: 'frame', label: 'Frame', focusY: 44, line: 'Every frame earns its place. Whatever does not serve the story leaves the shot.' },
    { key: 'cut', label: 'Cut', focusY: 50, line: 'The edit is where a film finds its rhythm, and where the feeling holds.' },
  ] satisfies Beat[],

  /** PLACEHOLDER copy for the process section, drawn from the brief. Nimish to confirm. */
  about:
    'Nimish stays with a film from the first lamp to the final cut. He lights the set, operates the camera and edits the picture, so the work keeps one point of view the whole way through.',

  /** The kinds of commissions Nimish takes on. Confirm or edit. */
  takesOn: ['Brand films', 'Music videos', 'Short fiction', 'Documentary'],

  /**
   * PLACEHOLDER: no address yet. While this is null the site points every
   * "get in touch" action at Instagram instead of a mailto link.
   */
  email: null as string | null,

  instagram: {
    handle: 'imnimishh_',
    url: 'https://www.instagram.com/imnimishh_/',
  },
} as const;

/** Where "get in touch" goes: email when there is one, Instagram otherwise. */
export function contactHref(subject?: string) {
  if (site.email) {
    const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return `mailto:${site.email}${q}`;
  }
  return site.instagram.url;
}

export const contactIsEmail = () => Boolean(site.email);
