import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Christiano Property Management | Luxury Vacation Rentals Malta',
  description: 'Premium vacation rental management in Malta. Luxury accommodations, professional service, unforgettable experiences.',
  keywords: ['vacation rentals', 'malta', 'luxury', 'property management', 'holiday homes'],
  openGraph: {
    title: 'Christiano Property Management',
    description: 'Premium vacation rental management in Malta',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
          {children}
        </div>
      </body>
    </html>
  );
}
