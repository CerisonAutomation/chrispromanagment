import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CPM Enterprise',
  description: 'Christiano Property Management — Enterprise Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
