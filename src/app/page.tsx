
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import LandingPage from '@/components/landing/LandingPage';
import SplashScreen from '@/components/layout/SplashScreen';

export default function HomePage() {
  const { authUser, authLoading } = useData();
  const router = useRouter();

  useEffect(() => {
    // Si la autenticación ha terminado y tenemos un usuario, redirigir al dashboard.
    if (!authLoading && authUser) {
      router.replace('/dashboard');
    }
  }, [authLoading, authUser, router]);

  // Mientras se verifica el estado de autenticación, o si hay un usuario listo para ser redirigido,
  // muestra la pantalla de carga para evitar que la página de inicio parpadee brevemente.
  if (authLoading || authUser) {
    return <SplashScreen />;
  }

  // Si la autenticación ha terminado y no hay usuario, muestra la página de inicio.
  return <LandingPage />;
}
