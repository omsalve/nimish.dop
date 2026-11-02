"use client";

import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader, isCloudinaryImage } from "../lib/cloudinary";

export default function PortfolioImage(props: Omit<ImageProps, "loader">) {
  return (
    <Image
      {...props}
      alt={props.alt}
      loader={isCloudinaryImage(props.src) ? cloudinaryLoader : undefined}
    />
  );
}
