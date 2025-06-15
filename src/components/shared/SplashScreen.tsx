"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/shared/Logo';

const SplashScreen = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Check mock auth status
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 2500); // Splash screen duration

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100 animate-fade-in' : 'opacity-0 animate-fade-out pointer-events-none'
      }`}
      aria-hidden={!isVisible}
      role="dialog"
      aria-labelledby="splash-logo"
    >
      <div className="animate-scale-up-center">
        <Logo size="large" />
        <p className="mt-2 text-center text-muted-foreground text-sm font-body">
          Desarrollo Colectivo
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
