// src/app/layout.tsx
import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CryptoVault — Professional Crypto Investment Platform',
    template: '%s | CryptoVault',
  },
  description:
    'CryptoVault is a professional cryptocurrency investment platform. Note: Cryptocurrency investments involve risk. Returns are not guaranteed.',
  keywords: ['crypto', 'investment', 'bitcoin', 'ethereum', 'trading'],
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable} font-body antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1d24',
              color: '#f9fafb',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#000' },
            },
          }}
        />
      </body>
    </html>
  );
}
