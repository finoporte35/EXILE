
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Eye, EyeOff, Mail, User, AlertTriangle, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { INITIAL_XP } from '@/lib/app-config';
import { DEFAULT_THEME_ID } from '@/lib/themes';
import { db, auth } from '@/lib/firebase'; // Import auth
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Import Firebase Auth functions
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error de configuración", description: "Las contraseñas no coinciden." });
      setIsLoading(false);
      return;
    }
    if (!username.trim()) {
      toast({ variant: "destructive", title: "Error de configuración", description: "El nombre de usuario es requerido." });
      setIsLoading(false);
      return;
    }
    if (!email.trim()) {
        toast({ variant: "destructive", title: "Error de configuración", description: "El correo electrónico es requerido." });
        setIsLoading(false);
        return;
    }

    try {
      // Check username uniqueness
      const usersRef = collection(db, "users");
      const qUsername = query(usersRef, where("username", "==", username));
      const usernameSnapshot = await getDocs(qUsername);
      if (!usernameSnapshot.empty) {
        toast({ variant: "destructive", title: "Conflicto de Datos", description: "Este nombre de usuario ya está en uso." });
        setIsLoading(false);
        return;
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile (displayName)
      await updateProfile(firebaseUser, { displayName: username });

      // Create user document in Firestore using the new UID
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDataToSave = {
        username: username,
        email: firebaseUser.email,
        xp: INITIAL_XP,
        avatarUrl: null,
        currentEraId: null,
        completedEraIds: [],
        allUserEraCustomizations: {},
        unlockedSkillIds: [],
        activeThemeId: DEFAULT_THEME_ID,
        status: 'premium', // TEMP: Everyone starts as premium as requested.
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, userDataToSave);
      
      localStorage.setItem('usernameForAvatar', username); 
      
      toast({ title: "Cuenta Creada", description: "Ahora, selecciona tu avatar para continuar." });
      router.push('/signup/avatar'); 

    } catch (error: any) {
      console.error("Error during signup:", error);
      let errorMessage = "No se pudo completar la configuración. Intenta de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo electrónico ya está registrado. Intenta iniciar sesión.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
      } else if (error.code === 'permission-denied') {
        errorMessage = "Permiso denegado por Firestore. Asegúrate de haber publicado las reglas de seguridad en tu consola de Firebase.";
      }
      toast({ variant: "destructive", title: "Error de Registro", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-primary/20">
      <CardHeader className="text-center">
        <Logo className="mx-auto mb-2" />
        <CardTitle className="font-headline text-2xl">Forja tu destino con un click</CardTitle>
        <CardDescription>Potencia tu desarrollo al maximo con la aplicación 1# de desarrollo colectivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username-signup">Nombre de Usuario</Label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="username-signup" type="text" placeholder="Nombre de tu Personaje" required value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" aria-label="Nombre de Usuario" disabled={isLoading}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup">Correo Electrónico</Label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email-signup" type="email" placeholder="tu@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" aria-label="Correo Electrónico" disabled={isLoading}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Contraseña</Label>
            <div className="relative">
              <Input id="password-signup" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" aria-label="Contraseña" disabled={isLoading}/>
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} disabled={isLoading}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password-signup">Confirmar Contraseña</Label>
            <div className="relative">
              <Input id="confirm-password-signup" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" aria-label="Confirmar Contraseña" disabled={isLoading}/>
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"} disabled={isLoading}>
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-new-button-gradient text-primary-foreground hover:opacity-90 transition-opacity duration-300" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Creando cuenta..." : "Siguiente: Elegir Avatar"}
          </Button>
        </form>
        <Alert variant="default" className="bg-muted/30 border-primary/20">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-semibold text-primary">Aviso Importante</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
                Tus datos se guardarán en Firebase asociados a tu cuenta.
            </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Ingresa
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
