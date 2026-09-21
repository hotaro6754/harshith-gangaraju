import { ImageResponse } from 'next/og';

/**
 * The share card: the site's night, a ridge line, and the name.
 *
 * Link previews are often the first thing anyone sees of the site (a
 * recruiter's Slack, a WhatsApp forward), so the card carries the same
 * identity as the page instead of a generic screenshot.
 *
 * The serif and the mono are fetched from Google Fonts at build time,
 * subset to the characters on the card. If that fails the card still
 * renders in the default face rather than failing the build.
 */

export const OG_SIZE = { width: 1200, height: 630 };

async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`,
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

// A fixed ridge so the card never changes between builds.
const RIDGE =
  'M0,470 L80,440 L150,455 L230,405 L300,430 L380,380 L450,410 L530,360 L610,395 L690,350 L760,388 L850,340 L930,378 L1010,345 L1090,372 L1200,350 L1200,630 L0,630 Z';
const RIDGE_FAR =
  'M0,420 L120,395 L210,410 L320,370 L420,392 L540,350 L650,375 L760,330 L880,360 L990,325 L1100,350 L1200,330 L1200,630 L0,630 Z';

export async function ogCard({ title, kicker, line }: { title: string; kicker: string; line: string }) {
  const [serif, mono] = await Promise.all([
    loadFont('Instrument+Serif', `${title}${line}`),
    loadFont('IBM+Plex+Mono', kicker.toUpperCase()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(180deg, #101828 0%, #3a4a6b 58%, #26324c 100%)',
          color: '#e6e8ec',
          position: 'relative',
        }}
      >
        {/* top/left, not inset: the renderer resolves inset against the
            padded content box and shifted the ridges 72px in. */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <circle cx="930" cy="170" r="54" fill="#bec1c8" opacity="0.9" />
          <path d={RIDGE_FAR} fill="#26324c" />
          <path d={RIDGE} fill="#111826" />
        </svg>

        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: '#f0a868',
            fontFamily: mono ? 'IBM Plex Mono' : undefined,
          }}
        >
          {kicker}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 14 ? 120 : 150,
              lineHeight: 0.9,
              letterSpacing: -4,
              fontFamily: serif ? 'Instrument Serif' : undefined,
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 30, maxWidth: 900, color: '#bec1c8', fontFamily: serif ? 'Instrument Serif' : undefined }}>
            {line}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        ...(serif ? [{ name: 'Instrument Serif', data: serif, style: 'normal' as const, weight: 400 as const }] : []),
        ...(mono ? [{ name: 'IBM Plex Mono', data: mono, style: 'normal' as const, weight: 400 as const }] : []),
      ],
    },
  );
}
