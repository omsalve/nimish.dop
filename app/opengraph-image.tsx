import { ImageResponse } from 'next/og';
import { site } from '@/content/site';
import { ogFonts, ogImage } from '@/lib/og';

export const alt = `${site.name}: ${site.roles.join(', ').toLowerCase()}. ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [fonts, plate] = await Promise.all([ogFonts(), ogImage('hero', 'set.jpg')]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a09', fontFamily: 'Switzer', color: '#eeede8' }}>
        {plate ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plate} width={1200} height={400} alt="" style={{ width: 1200, height: 400, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 1200, height: 400, display: 'flex' }} />
        )}
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 56px 52px' }}>
          <div style={{ display: 'flex', fontSize: 92, fontWeight: 500, letterSpacing: -3.6, lineHeight: 0.92 }}>{site.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 6 }}>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 500 }}>{site.roles.join(' · ')}</div>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 400, letterSpacing: -0.8, color: '#c9c8c1', marginTop: 8 }}>
              {site.tagline}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
