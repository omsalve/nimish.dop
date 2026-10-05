import type { StaticImageData } from 'next/image';

import p01 from './media/photos/concert-01-concertfirstpost.jpg';
import p01Plate from './media/photos/concert-01-plate.jpg';
import p01Type from './media/photos/concert-01-type.png';
import p02 from './media/photos/concert-02-seedhemaut.jpg';
import p03 from './media/photos/concert-03-divine.jpg';
import p04 from './media/photos/concert-04-javedali.jpg';
import p05 from './media/photos/concert-05-krsna.jpg';
import p06 from './media/photos/concert-06-arpitbala.jpg';
import p07 from './media/photos/concert-07-sonunigam.jpg';
import p08 from './media/photos/concert-08-king.jpg';
import p09 from './media/photos/concert-09-gajendraverma-1.jpg';
import p10 from './media/photos/concert-10-chaardiwari.jpg';
import p11 from './media/photos/concert-11-nas.jpg';
import p12 from './media/photos/concert-12-sonunigam-1.jpg';
import p13 from './media/photos/concert-13-javedali-1.jpg';
import p14 from './media/photos/concert-14-seedhemaut-1.jpg';
import p15 from './media/photos/concert-15-gajendraveram.jpg';
import p16 from './media/photos/concert-16-arpitbala-1.jpg';
import p17 from './media/photos/concert-17-seedhemaut-3.jpg';
import p18 from './media/photos/concert-18-som.jpg';

export type Photo = {
  src: StaticImageData;
  alt: string;
  title: string;
  /** Where it was made, as printed under the photograph. Left off if unknown. */
  place?: string;
  year?: number;
  /**
   * True for the sample photographs the site ships with. They show a "Sample"
   * mark. Remove the flag (or the entry) once a real photograph is in.
   */
  placeholder?: boolean;
  /**
   * The same picture in its two layers, for the first photograph only: it opens
   * the section by being made in front of the visitor. `plate` is the picture
   * without its lettering; `type` is the lettering alone on a transparent ground
   * at the same size, laid over the plate in exclusion, as in the source file.
   * `src` is the finished print they resolve into.
   */
  reveal?: { plate: StaticImageData; type: StaticImageData };
};

/**
 * The photographs strip on the home page, after the reel. Nimish's own stills,
 * not frames from the films. Shown in this order, each at its own shape
 * (portrait, square or landscape all work), so mix them.
 */
export const photographs = {
  title: 'Photographs',
  /** PLACEHOLDER copy. Nimish to confirm or rewrite. */
  intro: 'Concerts, from the pit and the side of the stage.',
};

export const photos: Photo[] = [
  {
    src: p01,
    reveal: { plate: p01Plate, type: p01Type },
    title: 'I shoot concerts',
    alt: 'Black and white portrait of Nimish standing with his hands behind his back, lit from behind, with the words "I shoot Concerts" set across his hoodie.',
  },
  {
    src: p02,
    title: 'Seedhe Maut',
    alt: 'A rapper on stage between two columns of flame, a red logo glowing behind him.',
  },
  {
    src: p03,
    title: 'Divine',
    alt: 'A rapper in dark clothes and sunglasses holding a microphone to his mouth, lit in deep blue.',
  },
  {
    src: p04,
    title: 'Javed Ali',
    alt: 'A wide stage under bright rigging, tall columns of white smoke rising on both sides of the singer.',
  },
  {
    src: p05,
    title: 'KRSNA',
    alt: 'A rapper on a raised platform in front of glowing blue screens, one arm raised with the microphone.',
  },
  {
    src: p06,
    title: 'Arpit Bala',
    alt: 'A performer in a light shirt on a dark stage, microphone raised, red and teal light behind him.',
  },
  {
    src: p07,
    title: 'Sonu Nigam',
    alt: 'A singer in a white shirt in a pool of light on a dark stage, one arm held out.',
  },
  {
    src: p08,
    title: 'King',
    alt: 'Black and white: a performer in a patterned shirt singing into a microphone under a single beam of light.',
  },
  {
    src: p09,
    title: 'Gajendra Verma',
    alt: 'A singer on a smoky stage in a dark jacket, a guitar on its stand beside him and stage lights above.',
  },
  {
    src: p10,
    title: 'Chaar Diwari',
    alt: 'A singer on stage with flames rising on both sides, a glowing sign behind him and the crowd below.',
  },
  {
    src: p11,
    title: 'Nas',
    alt: 'Black and white: a man in a white robe against a black background, one hand pointing to the sky and a microphone in the other.',
  },
  {
    src: p12,
    title: 'Sonu Nigam',
    alt: 'A singer in white arms spread wide, microphone in hand, against a black night sky.',
  },
  {
    src: p13,
    title: 'Javed Ali',
    alt: 'A curly-haired singer with his head tilted back and a hand raised, red stage lights glowing through the smoke.',
  },
  {
    src: p14,
    title: 'Seedhe Maut',
    alt: 'Two performers on a stage lit by rows of yellow strip lights against deep blue.',
  },
  {
    src: p15,
    title: 'Gajendra Verma',
    alt: 'A lone figure at the back of a dark stage between two huge jets of white smoke.',
  },
  {
    src: p16,
    title: 'Arpit Bala',
    alt: 'A performer in dark glasses reaching toward the crowd, stage lights glowing behind him.',
  },
  {
    src: p17,
    title: 'Seedhe Maut',
    alt: 'A singer in a dark jacket with his arm thrown up, backlit by orange stage lights and haze.',
  },
  {
    src: p18,
    title: 'Som',
    alt: 'Black and white: a hand raised high gripping a microphone, steel stage rigging behind it.',
  },
];
