import { artists } from "./artists";
import uploadedPhotographs from "./cloudinary-photos.json";
import { chapterLeads, wallNotes } from "./curation";

export const concerts = artists.map((artist, index) => ({
  ...artist,
  title: artist.name,
  order: String(index + 1).padStart(2, "0"),
}));

// The upload manifest keeps each artist's curated frames first, then the rest.
export const photographs = concerts.flatMap((artist, concert) =>
  uploadedPhotographs
    .filter((photo) => photo.artistId === artist.id)
    .map((photo, index) => ({
      ...photo,
      concert,
      frame: String(index + 1).padStart(2, "0"),
    })),
).map((photo, index) => ({ ...photo, number: String(index + 1).padStart(3, "0") }));

export type Photograph = (typeof photographs)[number];

function indexOf(artistId: string, filename: string) {
  const index = photographs.findIndex(
    (photo) => photo.artistId === artistId && photo.filename === filename,
  );
  if (index < 0) throw new Error(`Curated photograph ${artistId}/${filename} is missing.`);
  return index;
}

// Every photograph's home is its artist's archive; `lead` picks three for the
// exposure sequence that opens the chapter.
export const collections = concerts.map((artist) => {
  const indexes = photographs.flatMap((photo, photoIndex) =>
    photo.artistId === artist.id ? [photoIndex] : [],
  );
  const lead = (chapterLeads[artist.id] ?? []).map((pick) => ({
    index: indexOf(artist.id, pick.file),
  }));
  return {
    ...artist,
    indexes,
    lead,
    note: wallNotes[artist.id] ?? "",
    first: photographs[indexes[0]].number,
    last: photographs[indexes[indexes.length - 1]].number,
  };
});

export type ArtistCollection = (typeof collections)[number];
