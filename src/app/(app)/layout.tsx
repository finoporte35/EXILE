
"use client";
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, AlertTriangle } from 'lucide-react';
import { DataProvider, useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';


function AppContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authUser, authLoading, isLoading: isDataLoading, dataLoadingError } = useData(); 

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace('/login');
    }
  }, [authLoading, authUser, router]);
  
  if (authLoading || (authUser && isDataLoading)) { // Show loader if auth is loading OR if user is authed but data is still loading
     return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl text-foreground">
          {authLoading ? "Verificando sesión..." : "Cargando datos de EXILE..."}
        </p>
      </div>
     );
  }

  if (!authUser && !authLoading) { // If auth has loaded and there's no user, login page will handle it (or this acts as a fallback)
    // This case should ideally be handled by the useEffect redirecting to /login
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        <p className="text-xl text-foreground">Redirigiendo al inicio de sesión...</p>
      </div>
    );
  }


  if (dataLoadingError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-6 p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-semibold text-foreground">Error al Cargar Datos</h2>
        <p className="text-muted-foreground max-w-md">
          No pudimos conectar con los servidores de EXILE para cargar tu información.
          Esto puede deberse a un problema de red.
        </p>
        <pre className="mt-2 text-xs text-destructive/80 bg-muted p-3 rounded-md max-w-md overflow-auto">
          Error: {dataLoadingError.message}
        </pre>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Intentar de Nuevo
        </Button>
         {/* Consider removing this direct logout as auth state should handle it
         <Button onClick={() => { localStorage.removeItem('isLoggedIn'); router.replace('/login'); }} variant="outline" className="mt-2">
          Cerrar Sesión y Reintentar
        </Button> */}
      </div>
    );
  }

  // If we reach here, authUser exists and data loading is complete (or no error)
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <AppContent>{children}</AppContent>
    </DataProvider>
  );
}

    