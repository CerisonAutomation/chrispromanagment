/**
 * @fileoverview Root layout — metadata, fonts, global CSS, providers.
 */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Christo Property Management', template: '%s | Christo PM' },
  description: 'Premium property management and luxury holiday rentals in Malta.',
  keywords: ['Malta', 'property management', 'holiday rentals', 'luxury', 'Airbnb'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chrispropmanagment.vercel.app'),
  openGraph: {
    type: 'website',
    siteName: 'Christo Property Management',
    locale: 'en_MT',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#c8a96a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
