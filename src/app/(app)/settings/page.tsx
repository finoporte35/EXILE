
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Palette, Shield, UserCircle, Save, Download, Upload, Database, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_USERNAME, INITIAL_XP } from '@/lib/app-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useData } from '@/contexts/DataContext';
import { db } from '@/lib/firebase'; // db might not be needed directly if DataContext handles all
import { collection, query, where, getDocs, doc } from 'firebase/firestore';


export default function SettingsPage() {
  const { toast } = useToast();
  //authUser might be null initially or during loading, handle appropriately
  const { authUser, userName, userEmail, updateUserProfile, isLoading: isDataLoading, habits, goals, sleepLogs, userXP, userAvatar } = useData(); 
  
  const [currentUsername, setCurrentUsername] = useState(userName);
  const [currentEmail, setCurrentEmail] = useState(userEmail); // This should be authUser.email if different
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authUser) {
      setCurrentUsername(authUser.displayName || userName || DEFAULT_USERNAME);
      setCurrentEmail(authUser.email || userEmail || "");
    } else {
      // Fallback if authUser is not yet available, though ideally UI is blocked until authUser loads
      setCurrentUsername(userName);
      setCurrentEmail(userEmail);
    }
  }, [authUser, userName, userEmail]);


  const handleAccountChanges = async () => {
    if (!authUser) {
        toast({ variant: "destructive", title: "Error", description: "Debes estar autenticado para cambiar tu perfil." });
        return;
    }
    setIsSavingAccount(true);
    if (!currentUsername.trim()) { // Email validation could also be added here
      toast({ variant: "destructive", title: "Campos Requeridos", description: "El nombre de usuario no puede estar vacío." });
      setIsSavingAccount(false);
      return;
    }

    // Pass currentEmail from state which reflects the input field.
    // The updateUserProfile in DataContext should handle the logic of checking against its own state
    // and potentially updating Firebase Auth email if that functionality is added there.
    const result = await updateUserProfile(currentUsername, currentEmail); 
    if (result.success) {
      toast({ title: "Perfil Actualizado", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error al Actualizar", description: result.message });
    }
    setIsSavingAccount(false);
  };

  const handleExportData = () => {
    if (!authUser) {
        toast({ variant: "destructive", title: "Error de Exportación", description: "Debes estar autenticado para exportar datos." });
        return;
    }
    try {
      const dataToExport = {
        username: userName, // From DataContext (should reflect DB)
        userEmail: userEmail, // From DataContext
        userXP: userXP,
        habits: habits,
        goals: goals,
        sleepLogs: sleepLogs,
        userAvatar: userAvatar,
        // Note: Era data (currentEraId, completedEraIds, userCreatedEras, allUserEraCustomizations)
        // is complex and currently not included in this basic export.
        // A more robust export would serialize this from DataContext too.
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `exile-data-backup-${authUser.uid}-${new Date().toISOString().split('T')[0]}.json`;
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
    if (!authUser) {
        toast({ variant: "destructive", title: "Error de Importación", description: "Debes estar autenticado para importar datos." });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error("Error al leer el archivo.");
          }
          const importedData = JSON.parse(text);

          if (typeof importedData.username !== 'string' ||
              typeof importedData.userEmail !== 'string' ||
              typeof importedData.userXP !== 'number' ||
              !Array.isArray(importedData.habits) ||
              !Array.isArray(importedData.goals) ||
              !Array.isArray(importedData.sleepLogs) ||
              (importedData.userAvatar !== null && typeof importedData.userAvatar !== 'string')) {
            throw new Error("El archivo de copia de seguridad tiene un formato incorrecto o está corrupto.");
          }
          
          // This is a complex operation. Ideally, this would be a server-side function or a carefully managed batch write.
          // Directly writing all this data from client can be risky and might miss some atomicity/consistency.
          // For now, we'll update Firestore for basic profile info and rely on DataContext reload for subcollections.
          
          const userDocRef = doc(db, "users", authUser.uid);
          await updateDoc(userDocRef, {
            username: importedData.username,
            email: importedData.userEmail,
            xp: importedData.userXP,
            avatarUrl: importedData.userAvatar,
            updatedAt: serverTimestamp()
            // Note: Importing habits, goals, sleepLogs, eras correctly would require
            // deleting existing ones for the user and then batch-writing the new ones.
            // This simplified import only updates the main user document.
          });

          // Update local storage (mainly for avatar, as other things will reload from context)
          localStorage.setItem(`userAvatar_${authUser.uid}`, importedData.userAvatar || "");


          toast({ title: "Datos Importados (Parcialmente)", description: "Tu perfil ha sido actualizado. Los hábitos, metas y otros datos detallados requieren una importación más avanzada y no se han restaurado completamente. La aplicación se recargará." });
          
          setTimeout(() => {
            window.location.reload(); // Reload to apply changes from Firestore via DataContext
          }, 3000);

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
              <Input 
                id="username" 
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                disabled={isDataLoading || isSavingAccount || !authUser} 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                disabled={isDataLoading || isSavingAccount || !authUser} // Email change in Firebase Auth is more complex. This only affects Firestore.
                readOnly // For now, make email read-only as updating Firebase Auth email is complex
              />
               <p className="text-xs text-muted-foreground">La edición del correo se habilitará pronto.</p>
            </div>
          </div>
           <Button 
            className="bg-new-button-gradient text-primary-foreground hover:opacity-90" 
            onClick={handleAccountChanges}
            disabled={isDataLoading || isSavingAccount || !authUser || (currentUsername === (authUser?.displayName || userName) && currentEmail === (authUser?.email || userEmail) )}
           >
            {isSavingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSavingAccount ? "Guardando..." : "Guardar Cambios de Cuenta"}
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
            EXILE guarda tu progreso en Firebase. Para una mayor seguridad, puedes exportar tus datos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportData} variant="outline" className="flex-1" disabled={!authUser || isDataLoading}>
              <Download className="mr-2 h-4 w-4" /> Exportar Mis Datos
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1" disabled={!authUser || isDataLoading}>
              <Upload className="mr-2 h-4 w-4" /> Importar Mis Datos
            </Button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              style={{ display: 'none' }}
              accept=".json"
              aria-hidden="true"
              disabled={!authUser || isDataLoading}
            />
          </div>
           <Alert variant="destructive" className="mt-4">
             <Shield className="h-4 w-4" />
             <AlertTitle className="font-semibold">Importante sobre la Importación</AlertTitle>
             <AlertDescription className="text-xs">
                Al importar datos, se sobrescribirán tus datos actuales en Firebase. Esta es una operación delicada. Asegúrate de que el archivo es correcto. La restauración completa de sub-colecciones (hábitos, metas) no está soportada en esta versión de importación.
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
            La gestión de contraseña y eliminación de cuenta se habilitará en futuras versiones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    