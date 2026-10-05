import { ImageResponse } from 'next/og';
import { getProject, projects } from '@/content/projects';
import { site } from '@/content/site';
import { ogFonts, ogImage } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = getProject(slug);
  // Share cards read the conventional path content/media/<slug>/still.jpg.
  const [fonts, still] = await Promise.all([ogFonts(), ogImage(slug, 'still.jpg')]);
  const title = film?.title ?? site.name;
  const meta = film ? `${film.format} · ${film.year} · ${film.runtime}` : site.roles.join(' · ');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#000000', fontFamily: 'Switzer', color: '#eeede8' }}>
        {still && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} width={1200} height={630} alt="" style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }} />
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 330,
            display: 'flex',
            backgroundImage: 'linear-gradient(to bottom, rgba(11,11,10,0), rgba(11,11,10,0.86))',
          }}
        />
        <div style={{ position: 'absolute', left: 56, right: 56, bottom: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, color: '#c9c8c1' }}>{meta}</div>
            <div style={{ display: 'flex', fontSize: 96, fontWeight: 500, letterSpacing: -3.8, lineHeight: 0.95, marginTop: 10 }}>{title}</div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 500, paddingBottom: 8 }}>{site.name}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
