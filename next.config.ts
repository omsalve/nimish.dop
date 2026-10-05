import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // AVIF first: stills are mostly soft gradients and grain, where it shines.
    formats: ['image/avif', 'image/webp'],
    // 85 for full-screen stills and the hero plate, 75 everywhere else.
    qualities: [75, 85],
  },
};

export default nextConfig;
