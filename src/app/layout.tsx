
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from '@/contexts/DataContext'; // Import DataProvider

export const metadata: Metadata = {
  title: 'Mi Aventura en EXILE', 
  description: 'Potencia tu desarrollo colectivo con EXILE.',
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
