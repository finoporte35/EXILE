
"use client";

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Palette, Shield, UserCircle, Save, Download, Upload, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_USERNAME, INITIAL_XP } from '@/lib/app-config';


export default function SettingsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    try {
      const dataToExport = {
        username: localStorage.getItem('username') || DEFAULT_USERNAME,
        userXP: parseInt(localStorage.getItem('userXP') || String(INITIAL_XP), 10),
        habits: JSON.parse(localStorage.getItem('habits') || '[]'),
        userAvatar: localStorage.getItem('userAvatar') || null,
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `exile-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      toast({ title: "Datos Exportados", description: "Tu copia de seguridad se ha descargado." });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({ variant: "destructive", title: "Error de Exportación", description: "No se pudo generar la copia de seguridad." });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error("Error al leer el archivo.");
          }
          const importedData = JSON.parse(text);

          if (typeof importedData.username !== 'string' ||
              typeof importedData.userXP !== 'number' ||
              !Array.isArray(importedData.habits) ||
              (importedData.userAvatar !== null && typeof importedData.userAvatar !== 'string')) {
            throw new Error("El archivo de copia de seguridad tiene un formato incorrecto o está corrupto.");
          }

          localStorage.setItem('username', importedData.username);
          localStorage.setItem('userXP', String(importedData.userXP));
          localStorage.setItem('habits', JSON.stringify(importedData.habits));
          if (importedData.userAvatar) {
            localStorage.setItem('userAvatar', importedData.userAvatar);
          } else {
            localStorage.removeItem('userAvatar');
          }

          toast({ title: "Datos Importados Correctamente", description: "Tu progreso ha sido restaurado. La aplicación se recargará para aplicar los cambios." });
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);

        } catch (error) {
          console.error("Error importing data:", error);
          toast({ variant: "destructive", title: "Error de Importación", description: error instanceof Error ? error.message : "No se pudo importar el archivo. Asegúrate de que sea una copia válida." });
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Error de Lectura", description: "No se pudo leer el archivo seleccionado." });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
      reader.readAsText(file);
    }
  };


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en EXILE.</p>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><UserCircle className="h-5 w-5 text-primary"/> Cuenta</CardTitle>
          <CardDescription>Gestiona la información de tu perfil y preferencias de cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input id="username" defaultValue="Usuario EXILE" disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue="usuario@exile.app" disabled />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Biografía Corta (Próximamente)</Label>
            <Input id="bio" placeholder="Cuéntanos un poco sobre ti..." disabled/>
          </div>
           <Button className="bg-new-button-gradient text-primary-foreground hover:opacity-90" disabled>
            <Save className="mr-2 h-4 w-4" /> Guardar Cambios de Cuenta
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Database className="h-5 w-5 text-primary"/> Gestión de Datos</CardTitle>
          <CardDescription>Realiza copias de seguridad o restaura tu progreso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            EXILE guarda tu progreso localmente en este navegador. Para evitar perder tus datos, puedes exportarlos y guardarlos en un lugar seguro.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportData} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" /> Exportar Mis Datos
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
              <Upload className="mr-2 h-4 w-4" /> Importar Mis Datos
            </Button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              style={{ display: 'none' }}
              accept=".json"
              aria-hidden="true"
            />
          </div>
           <Alert variant="destructive" className="mt-4">
             <Shield className="h-4 w-4" />
             <AlertTitle className="font-semibold">Importante sobre la Importación</AlertTitle>
             <AlertDescription className="text-xs">
                Al importar datos, se sobrescribirá tu progreso actual en este navegador. Asegúrate de que el archivo seleccionado es la copia de seguridad correcta. La aplicación se recargará después de la importación.
             </AlertDescription>
           </Alert>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-primary"/> Notificaciones (Próximamente)</CardTitle>
          <CardDescription>Elige cómo y cuándo quieres recibir notificaciones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="push-notifications" defaultChecked disabled />
            <Label htmlFor="push-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Activar notificaciones push
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="email-summary" disabled/>
            <Label htmlFor="email-summary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Recibir resúmenes semanales por correo
            </Label>
          </div>
           <Button className="bg-new-button-gradient text-primary-foreground hover:opacity-90" disabled>
             <Save className="mr-2 h-4 w-4" /> Guardar Preferencias de Notificación
          </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Palette className="h-5 w-5 text-primary"/> Apariencia (Próximamente)</CardTitle>
          <CardDescription>Personaliza la interfaz de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Más opciones de personalización visual estarán disponibles pronto.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Shield className="h-5 w-5 text-primary"/> Seguridad y Privacidad</CardTitle>
          <CardDescription>Gestiona la seguridad de tu cuenta y tus datos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" disabled>Cambiar Contraseña</Button>
          <Button variant="destructive" disabled>Eliminar Cuenta</Button>
           <p className="text-xs text-muted-foreground pt-2">
            La gestión de contraseña y eliminación de cuenta se habilitará en futuras versiones con almacenamiento en la nube. Actualmente, tus datos son locales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
