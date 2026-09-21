import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Schibsted_Grotesk } from 'next/font/google';

import { Preloader } from '@/components/chrome/Preloader';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
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

/**
 * The text face. Schibsted Grotesk was drawn for a newspaper group: a
 * grotesk built to carry long reading under editorial headlines, which is
 * exactly its job here beside the serif. It replaced Geist, which is the
 * default sans of the current portfolio template and read as one.
 */
const textSans = Schibsted_Grotesk({
  variable: '--font-text-sans',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Labels and values only. Plex Mono has real engineering lineage and more
 * open shapes at 11px than Geist Mono, which matters because every label on
 * the site is set that small.
 */
const labelMono = IBM_Plex_Mono({
  variable: '--font-label-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
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
      // The inline script below may add data-opened before hydration.
      suppressHydrationWarning
      data-env={HERO_ENVIRONMENT}
      className={`${instrumentSerif.variable} ${textSans.variable} ${labelMono.variable}`}
    >
      <head>
        {/* Runs before first paint. Must stay in sync with SESSION_KEY in
            Preloader.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('aizen:opened')==='1')document.documentElement.setAttribute('data-opened','')}catch(e){}`,
          }}
        />
      </head>
      <body>
        {/* Without JavaScript the overlay can never be dismissed, so it is
            removed outright rather than trapping the page behind it. */}
        <noscript>
          <style>{`.preloader{display:none}`}</style>
        </noscript>
        <Preloader />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
