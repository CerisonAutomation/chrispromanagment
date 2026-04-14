import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CPM Booking Engine',
  description: 'Christiano Property Management — Booking Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
