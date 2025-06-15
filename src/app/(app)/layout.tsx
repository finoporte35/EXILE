
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, AlertTriangle } from 'lucide-react';
import { DataProvider, useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

function AppContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { isLoading: isDataCtxLoading, dataLoadingError } = useData(); 

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setIsAuthLoading(false); 
    }
  }, [router]);
  
  if (isAuthLoading || isDataCtxLoading) {
     return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl text-foreground">
          {isAuthLoading ? "Verificando sesión..." : "Cargando datos de EXILE..."}
        </p>
      </div>
     );
  }

  if (dataLoadingError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-6 p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-semibold text-foreground">Error al Cargar Datos</h2>
        <p className="text-muted-foreground max-w-md">
          No pudimos conectar con los servidores de EXILE. Esto puede deberse a un problema de red o
          a una configuración incorrecta de Firebase.
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Por favor, revisa tu conexión a internet y asegúrate de que los detalles de configuración en 
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">src/lib/firebase.ts</code> 
          son correctos (API Key, Project ID, etc.).
        </p>
        <pre className="mt-2 text-xs text-destructive/80 bg-muted p-3 rounded-md max-w-md overflow-auto">
          Error: {dataLoadingError.message}
        </pre>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Intentar de Nuevo
        </Button>
         <Button onClick={() => { localStorage.removeItem('isLoggedIn'); router.replace('/login'); }} variant="outline" className="mt-2">
          Cerrar Sesión y Reintentar
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
  return (
    <DataProvider>
      <AppContent>{children}</AppContent>
    </DataProvider>
  );
}
