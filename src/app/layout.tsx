import type { Metadata } from 'next';
import { Archivo, Geist, Geist_Mono } from 'next/font/google';

import { DEFAULT_ENVIRONMENT } from '@/lib/environments';

import './globals.css';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
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
    <html lang="en" data-env={DEFAULT_ENVIRONMENT}>
      <body className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
