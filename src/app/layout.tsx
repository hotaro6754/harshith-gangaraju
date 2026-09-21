import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Schibsted_Grotesk } from 'next/font/google';

import { Preloader } from '@/components/chrome/Preloader';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { HERO_ENVIRONMENT } from '@/lib/hero-environment';
import {
  ALTERNATE_NAMES,
  COMPANY,
  KNOWS_ABOUT,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site';

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · Harshith Gangaraju',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Harshith Gangaraju',
  authors: [{ name: 'Harshith Gangaraju', url: SITE_URL }],
  creator: 'Harshith Gangaraju',
  // Ignored by Google, still read by some engines and link previews.
  keywords: [
    'Harshith Gangaraju',
    ...ALTERNATE_NAMES,
    `${COMPANY.name} CTO`,
    COMPANY.name,
    ...KNOWS_ABOUT,
    'Visakhapatnam',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    url: '/',
    siteName: 'Harshith Gangaraju',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    firstName: 'Harshith',
    lastName: 'Gangaraju',
    username: 'hotaro6754',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#101828',
  colorScheme: 'dark',
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
        {/* First focusable thing on every page: keyboard users skip the
            pinned hero and the nav instead of tabbing through them. */}
        <a className="skip-link" href="#top">
          Skip to content
        </a>
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
