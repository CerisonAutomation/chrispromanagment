import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CPM Enterprise',
  description: 'Christiano Property Management — Enterprise Platform for multi-property management',
  keywords: ['enterprise', 'property management', 'analytics', 'dashboard', 'revenue'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
}
