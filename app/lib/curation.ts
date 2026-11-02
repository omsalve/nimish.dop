/**
 * Editorial choices layered over the Cloudinary manifest.
 * `focus` is the object-position that keeps the subject inside a crop.
 */
export type Pick = {
  artistId: string;
  file: string;
  focus: string;
  focusMobile?: string;
};

// Three frames per artist are exposed, whole, in the sequence that opens the chapter.
export const chapterLeads: Record<string, Omit<Pick, "artistId">[]> = {
  ayushman: [
    { file: "DSCF0739.jpg", focus: "50% 40%" },
    { file: "DSCF0755.jpg", focus: "50% 24%" },
    { file: "DSCF0750.jpg", focus: "50% 34%" },
  ],
  "chaar-diwari": [
    { file: "SHL08401.jpg", focus: "50% 42%" },
    { file: "SHL08502.jpg", focus: "50% 40%" },
    { file: "SHL08514.jpg", focus: "50% 38%" },
  ],
  "gajendar-verma": [
    { file: "DSCF5496.jpg", focus: "50% 34%" },
    { file: "DSCF5732.jpg", focus: "50% 54%" },
    { file: "DSCF5722.jpg", focus: "50% 56%" },
  ],
  "himesh-reshammiya": [
    { file: "DSCF0707.jpg", focus: "50% 46%" },
    { file: "DSCF0690.jpg", focus: "50% 38%" },
    { file: "DSCF0692.jpg", focus: "50% 44%" },
  ],
  "javed-ali": [
    { file: "DSCF9311.jpg", focus: "50% 32%" },
    { file: "DSCF9314.jpg", focus: "50% 42%" },
    { file: "DSCF9250.jpg", focus: "50% 52%" },
  ],
  "mass-appeal": [
    { file: "DSC09665-Edit.jpg", focus: "50% 30%" },
    { file: "DSC08696-Edit-Edit.jpg", focus: "50% 42%" },
    { file: "DSC09749-Edit.jpg", focus: "50% 38%" },
  ],
  "roopkumar-rathod": [
    { file: "DSCF0166.jpg", focus: "50% 42%" },
    { file: "DSCF0154.jpg", focus: "50% 42%" },
    { file: "DSCF0174.jpg", focus: "50% 56%" },
  ],
  "seedhe-maut": [
    { file: "SHL08989.jpg", focus: "50% 44%" },
    { file: "SHL09027.jpg", focus: "50% 28%" },
    { file: "SHL08830.jpg", focus: "50% 40%" },
  ],
  "shilpa-rao": [
    { file: "DSCF0615.jpg", focus: "50% 40%" },
    { file: "DSCF0626.jpg", focus: "50% 30%" },
    { file: "DSCF0612.jpg", focus: "50% 46%" },
  ],
};

// Behind the hero type: hot, wide frames from across the archive.
export const heroSlides: Pick[] = [
  { artistId: "himesh-reshammiya", file: "DSCF0707.jpg", focus: "58% 41%", focusMobile: "37% 48%" },
  { artistId: "seedhe-maut", file: "SHL08989.jpg", focus: "60% 42%", focusMobile: "52% 45%" },
  { artistId: "chaar-diwari", file: "SHL08514.jpg", focus: "55% 40%", focusMobile: "48% 42%" },
  { artistId: "javed-ali", file: "DSCF9314.jpg", focus: "62% 40%", focusMobile: "70% 42%" },
  { artistId: "gajendar-verma", file: "DSCF5722.jpg", focus: "55% 50%", focusMobile: "60% 50%" },
  { artistId: "mass-appeal", file: "DSC09665-Edit.jpg", focus: "50% 32%", focusMobile: "42% 35%" },
  { artistId: "shilpa-rao", file: "DSCF0615.jpg", focus: "50% 42%", focusMobile: "55% 45%" },
];

// Handwritten asides pinned to each chapter's wall, in the site's own voice.
export const wallNotes: Record<string, string> = {
  ayushman: "between two chords.",
  "chaar-diwari": "right here, right now.",
  "gajendar-verma": "the part you can't put into words.",
  "himesh-reshammiya": "see you at the front.",
  "javed-ali": "one more song.",
  "mass-appeal": "louder.",
  "roopkumar-rathod": "some things stay with you.",
  "seedhe-maut": "lost my voice. worth it.",
  "shilpa-rao": "keep the feeling.",
};
