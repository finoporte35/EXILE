
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from '@/contexts/DataContext'; 

export const metadata: Metadata = {
  title: 'Mi Aventura en EXILE', 
  description: 'Potencia tu desarrollo colectivo con EXILE.',
  manifest: '/manifest.json', // Added manifest link
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="application-name" content="EXILE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EXILE" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FF0000" /> 
        
        {/* Add to home screen for Safari on iOS */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        {/* You can add more apple-touch-icon sizes if needed */}

      </head>
      <body className="font-body antialiased">
        <DataProvider> {/* Wrap children with DataProvider */}
          {children}
        </DataProvider>
        <Toaster />
      </body>
    </html>
  );
}
