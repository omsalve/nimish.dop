import type { ImageLoaderProps, ImageProps } from "next/image";

// Use the original public delivery URL copied from Cloudinary's Media Library.
const cloudinaryUpload = /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/(?!s--).+/i;
const UPLOAD = "/image/upload/";

// Large enough for 1440p and retina laptops; 3840 masters cost bandwidth, not detail.
const MAX_WIDTH = 2560;

export function isCloudinaryImage(src: ImageProps["src"]): src is string {
  return typeof src === "string" && cloudinaryUpload.test(src);
}

export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  const qualitySetting = quality ? `q_${quality}` : "q_auto:best";

  // Limit dimensions without upscaling; let Cloudinary negotiate the image format.
  url.pathname = url.pathname.replace(
    UPLOAD,
    `${UPLOAD}c_limit,w_${Math.min(width, MAX_WIDTH)}/${qualitySetting}/f_auto/`,
  );

  return url.toString();
}

/**
 * The preview transformation shared by the splash preloader, slot placeholders,
 * the lightbox opening shot, and the rig's textures. One request serves all four.
 */
export const PREVIEW_TRANSFORM = "c_limit,w_320,h_320/q_auto/f_auto/";

export function previewUrl(src: string) {
  return src.replace(UPLOAD, `${UPLOAD}${PREVIEW_TRANSFORM}`);
}

/** The part of a delivery URL after `/image/upload/`, for compact inline lists. */
export function uploadPath(src: string) {
  return src.slice(src.indexOf(UPLOAD) + UPLOAD.length);
}

export function uploadBase(src: string) {
  return src.slice(0, src.indexOf(UPLOAD) + UPLOAD.length);
}
