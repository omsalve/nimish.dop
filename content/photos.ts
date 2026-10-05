import type { StaticImageData } from 'next/image';

import photo01 from './media/photos/photo-01.jpg';
import photo02 from './media/photos/photo-02.jpg';
import photo03 from './media/photos/photo-03.jpg';
import photo04 from './media/photos/photo-04.jpg';
import photo05 from './media/photos/photo-05.jpg';
import photo06 from './media/photos/photo-06.jpg';
import photo07 from './media/photos/photo-07.jpg';
import photo08 from './media/photos/photo-08.jpg';
import photo09 from './media/photos/photo-09.jpg';
import photo10 from './media/photos/photo-10.jpg';
import photo11 from './media/photos/photo-11.jpg';
import photo12 from './media/photos/photo-12.jpg';

export type Photo = {
  src: StaticImageData;
  alt: string;
  title: string;
  /** Where it was made, as printed under the photograph. */
  place: string;
  year: number;
  /**
   * True for the sample photographs the site ships with. They show a "Sample"
   * mark. Remove the flag (or the entry) once a real photograph is in.
   */
  placeholder?: boolean;
};

/**
 * The photographs strip on the home page, after the reel. Nimish's own stills,
 * not frames from the films. Shown in this order, each at its own shape
 * (portrait, square or landscape all work), so mix them.
 */
export const photographs = {
  title: 'Photographs',
  /** PLACEHOLDER copy. Nimish to confirm or rewrite. */
  intro: 'Made between films: on recces, between set-ups, on the long way home.',
};

export const photos: Photo[] = [
  {
    src: photo01,
    placeholder: true,
    title: 'The last bulb',
    place: 'Girgaon, Mumbai',
    year: 2025,
    alt: 'A bare tungsten bulb hanging in a dark room, its filament glowing amber.',
  },
  {
    src: photo02,
    placeholder: true,
    title: 'Prayer flags',
    place: 'Chang La, Ladakh',
    year: 2024,
    alt: 'Strings of coloured prayer flags crossing a bright blue sky above snow.',
  },
  {
    src: photo03,
    placeholder: true,
    title: 'Doorway',
    place: 'Bhendi Bazaar, Mumbai',
    year: 2025,
    alt: 'Black and white: a figure standing in a narrow lit doorway at the end of a dark passage.',
  },
  {
    src: photo04,
    placeholder: true,
    title: 'Cutting chai',
    place: 'NH48, near Vapi',
    year: 2026,
    alt: 'A glass of tea steaming on a counter at night, pink and green lights out of focus behind.',
  },
  {
    src: photo05,
    placeholder: true,
    title: 'First rain',
    place: 'Dadar, Mumbai',
    year: 2024,
    alt: 'Black and white, from above: black umbrellas crossing a zebra crossing in the rain.',
  },
  {
    src: photo06,
    placeholder: true,
    title: 'Noon, the pans',
    place: 'Little Rann of Kutch',
    year: 2026,
    alt: 'A head and shoulders in silhouette, in profile against a white sky.',
  },
  {
    src: photo07,
    placeholder: true,
    title: 'Soundcheck',
    place: 'Bandra, Mumbai',
    year: 2025,
    alt: 'A vintage microphone on a stand in a dark club, red and amber lights blurred behind.',
  },
  {
    src: photo08,
    placeholder: true,
    title: 'Last train',
    place: 'Kurla, Mumbai',
    year: 2023,
    alt: 'Black and white: a lone figure on an empty platform at night as a train streaks past.',
  },
  {
    src: photo09,
    placeholder: true,
    title: 'Morning, the estate',
    place: 'Chikmagalur',
    year: 2025,
    alt: 'Steam rising from a mug on a sill in front of a pale, sunlit window.',
  },
  {
    src: photo10,
    placeholder: true,
    title: 'Wheel, from above',
    place: 'Khurja',
    year: 2024,
    alt: 'A potter’s wheel seen from directly above, wet clay ringed in grooves.',
  },
  {
    src: photo11,
    placeholder: true,
    title: 'One lamp',
    place: 'Studio, Pune',
    year: 2023,
    alt: 'Black and white: a face in profile, lit from one side against a dark background.',
  },
  {
    src: photo12,
    placeholder: true,
    title: 'Test card',
    place: 'Pune',
    year: 2026,
    alt: 'A small television glowing in a dark blue room, its cable trailing across the floor.',
  },
];
