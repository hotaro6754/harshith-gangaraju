import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';

import { HERO_ENVIRONMENT } from '@/lib/hero-environment';

import './globals.css';

/**
 * The display face. One weight, one italic — which is the point: an editorial
 * serif carries the hero on shape and scale rather than on weight, so there is
 * nothing to reach for when a line needs more presence except making it bigger.
 */
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Harshith Gangaraju',
  description:
    'Software systems at the intersection of cybersecurity, AI and infrastructure.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The font variables belong on <html>, not <body>: Tailwind's `@theme
    // inline` emits --font-display into :root, so a variable scoped to <body>
    // resolves to empty there and the whole font-family declaration is
    // dropped as invalid.
    <html
      lang="en"
      data-env={HERO_ENVIRONMENT}
      className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
