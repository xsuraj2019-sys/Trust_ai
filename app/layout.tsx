import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://trustai.app'),
  title: 'TrustAI — Misinformation Tracker',
  description:
    'Paste any WhatsApp message or news link and TrustAI will flag suspicious patterns, explain the warning signs, and suggest credible sources to verify before you share.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'TrustAI — Misinformation Tracker',
    description:
      'Paste any WhatsApp message or news link and TrustAI will flag suspicious patterns, explain the warning signs, and suggest credible sources to verify before you share.',
    type: 'website',
    siteName: 'TrustAI',
    url: 'https://trustai.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustAI — Misinformation Tracker',
    description:
      'Paste any WhatsApp message or news link and TrustAI will flag suspicious patterns, explain the warning signs, and suggest credible sources to verify before you share.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
