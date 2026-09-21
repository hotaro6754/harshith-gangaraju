import { ImageResponse } from 'next/og';

/** Home-screen icon: the same night, moon and ridges as icon.svg, at 180px. */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#101828' }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <circle cx="42" cy="21" r="8" fill="#bec1c8" />
          <path d="M0 44 L12 36 L20 40 L32 29 L42 37 L52 31 L64 38 V64 H0 Z" fill="#3a4a6b" />
          <path d="M0 52 L14 45 L26 50 L38 42 L50 48 L64 44 V64 H0 Z" fill="#1b2439" />
          <circle cx="32" cy="29" r="2.4" fill="#f0a868" />
        </svg>
      </div>
    ),
    size,
  );
}
