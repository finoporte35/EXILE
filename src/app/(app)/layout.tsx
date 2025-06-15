"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setIsLoading(false); // Only stop loading if the user is logged in and stays on the page
    }
    // If the user is not logged in, router.replace will navigate away.
    // We might still want to set isLoading to false in a more general sense
    // if the component isn't immediately unmounted, but for this specific
    // auth check, this logic should suffice to prevent content flash *if logged in*.
    // If not logged in, the /login page will handle its own rendering.
  }, [router]);
  
  if (isLoading) {
     return <div className="flex h-screen w-screen items-center justify-center bg-background"><p className="text-foreground">Cargando...</p></div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
