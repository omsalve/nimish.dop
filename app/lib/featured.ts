import { photographs } from "./collection";
import { heroSlides } from "./curation";
import selections from "./cloudinary-featured.json";

function selectedPhoto(selection: { artistId: string; filename: string }) {
  const photo = photographs.find(
    (item) => item.artistId === selection.artistId && item.filename === selection.filename,
  );
  if (!photo) throw new Error("Featured photograph is missing from the collection.");
  return photo;
}

export const heroPhotograph = selectedPhoto(selections.hero);
export const keepsakePhotograph = selectedPhoto(selections.keepsake);

export const slideshow = heroSlides.map((slide) => {
  const photo = selectedPhoto({ artistId: slide.artistId, filename: slide.file });
  return {
    index: photographs.indexOf(photo),
    src: photo.src,
    alt: photo.alt,
    number: photo.number,
    focus: slide.focus,
    focusMobile: slide.focusMobile ?? slide.focus,
  };
});
