import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthGuard } from '@/components/AuthGuard';
import { ErrorSuppressor } from '@/components/ErrorSuppressor';

export const metadata: Metadata = {
  title: 'AEGIS — Zero Trust Behavioral Biometrics',
  description: 'Continuous identity verification using behavioral biometrics after login',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className="bg-[#040406] text-slate-100 min-h-screen antialiased">
        <ErrorSuppressor />
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
