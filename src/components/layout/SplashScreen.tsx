
"use client";

import Logo from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

/**
 * A full-screen splash/loading component with the app logo and a subtitle.
 * It features a fade-in and scale-up animation.
 */
const SplashScreen = () => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black",
        "animate-fade-in" // Ensures the whole screen fades in smoothly
      )}
    >
      <div className="text-center animate-scale-up-center">
        <Logo size="large" />
        <p className="mt-2 text-lg font-medium tracking-widest text-muted-foreground animate-fade-in [animation-delay:500ms]">
          desarrollo colectivo
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
