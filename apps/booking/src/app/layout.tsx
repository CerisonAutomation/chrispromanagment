import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CPM Booking Engine',
  description: 'Christiano Property Management — Booking Engine for luxury vacation rentals',
  keywords: ['booking', 'vacation rentals', 'malta', 'property management'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  );
}
