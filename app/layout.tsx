import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Le Grand Transporteur — ERP',
    template: '%s | Le Grand Transporteur',
  },
  description: 'Plateforme ERP intégrée pour la gestion du transport, de la logistique et des finances.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-surface-bg`}>
        {children}
      </body>
    </html>
  );
}
