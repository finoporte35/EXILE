
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MOCK_USER_ID } from '@/lib/app-config';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already "logged in" via localStorage on component mount
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!MOCK_USER_ID) {
        toast({ variant: "destructive", title: "Error de Configuración", description: "ID de usuario no definido." });
        setIsLoading(false);
        return;
    }

    try {
      const userDocRef = doc(db, "users", MOCK_USER_ID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.email === email) {
          // Email matches. Password check is omitted for this mock setup.
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', userData.username); 
          
          // Avatar is already in localStorage from signup or profile page, no need to set it here unless fetching from Firestore
          // const storedAvatar = localStorage.getItem('userAvatar');
          // if (userData.avatarUrl && !storedAvatar) { // Example if avatar was in Firestore
          //   localStorage.setItem('userAvatar', userData.avatarUrl);
          // }

          toast({ title: "Inicio de Sesión Exitoso", description: `Bienvenido de nuevo, ${userData.username}.` });
          router.push('/dashboard');
        } else {
          toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: "Credenciales incorrectas." });
        }
      } else {
        toast({ variant: "destructive", title: "Perfil No Encontrado", description: "No se encontró un perfil. Por favor, configura uno." });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({ variant: "destructive", title: "Error de Conexión", description: "No se pudo conectar con el servidor. Intenta de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-primary/20">
      <CardHeader className="text-center">
        <Logo className="mx-auto mb-2" />
        <CardTitle className="font-headline text-2xl">Bienvenido de Nuevo</CardTitle>
        <CardDescription>Ingresa a tu cuenta para continuar tu desarrollo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email-login">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="email-login" 
                type="email" 
                placeholder="tu@ejemplo.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                aria-label="Correo Electrónico"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Contraseña</Label>
            <div className="relative">
              <Input 
                id="password-login" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                aria-label="Contraseña"
                disabled={isLoading}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-new-button-gradient text-primary-foreground hover:opacity-90 transition-opacity duration-300" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          ¿No tienes perfil o quieres reconfigurarlo?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Configurar Perfil
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
