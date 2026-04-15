import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CPM Website',
  description: 'Christiano Property Management — Public Website',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
