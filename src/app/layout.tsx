/**
 * @fileoverview Root layout — applies providers, global fonts, metadata baseline.
 */
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Christiano Properties',
    default: 'Christiano Properties — Luxury Rentals in Malta',
  },
  description:
    'Discover handpicked luxury villas and apartments for rent in Malta. Book direct for the best rates.',
  keywords: ['Malta', 'luxury rentals', 'villa', 'apartment', 'short stay', 'Airbnb alternative'],
  openGraph: {
    type: 'website',
    locale: 'en_MT',
    siteName: 'Christiano Properties',
  },
  twitter: { card: 'summary_large_image' },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chrispropmanagment.vercel.app'
  ),
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
