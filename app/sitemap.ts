import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    // sample entries are kept out until they are real films
    ...projects
      .filter((p) => !p.placeholder)
      .map((p) => ({ url: `${site.url}/work/${p.slug}`, changeFrequency: 'yearly' as const, priority: 0.8 })),
  ];
}
