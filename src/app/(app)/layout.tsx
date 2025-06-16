
"use client";
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext'; // DataProvider import removed
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
  
  if (authLoading || (authUser && isDataLoading)) { 
     return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl text-foreground">
          {authLoading ? "Verificando sesión..." : "Cargando datos de EXILE..."}
        </p>
      </div>
     );
  }

  if (!authUser && !authLoading) { 
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
      </div>
    );
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // DataProvider is no longer instantiated here, it's in the RootLayout
  return (
    <AppContent>{children}</AppContent>
  );
}
