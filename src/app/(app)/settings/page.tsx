
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Palette, Shield, UserCircle, Save } from 'lucide-react';

export default function SettingsPage() {
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
              <Input id="username" defaultValue="Usuario EXILE" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue="usuario@exile.app" disabled />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Biografía Corta</Label>
            <Input id="bio" placeholder="Cuéntanos un poco sobre ti..." />
          </div>
           <Button className="bg-new-button-gradient text-primary-foreground hover:opacity-90">
            <Save className="mr-2 h-4 w-4" /> Guardar Cambios de Cuenta
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-primary"/> Notificaciones</CardTitle>
          <CardDescription>Elige cómo y cuándo quieres recibir notificaciones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="push-notifications" defaultChecked />
            <Label htmlFor="push-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Activar notificaciones push
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="email-summary" />
            <Label htmlFor="email-summary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Recibir resúmenes semanales por correo
            </Label>
          </div>
           <Button className="bg-new-button-gradient text-primary-foreground hover:opacity-90">
             <Save className="mr-2 h-4 w-4" /> Guardar Preferencias de Notificación
          </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Palette className="h-5 w-5 text-primary"/> Apariencia</CardTitle>
          <CardDescription>Personaliza la interfaz de la aplicación (Próximamente).</CardDescription>
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
          <Button variant="outline">Cambiar Contraseña</Button>
          <Button variant="destructive">Eliminar Cuenta</Button>
        </CardContent>
      </Card>
    </div>
  );
}
