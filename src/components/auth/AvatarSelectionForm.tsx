
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUp, Send, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_USERNAME } from '@/lib/app-config';
import { useData } from '@/contexts/DataContext'; 
import { auth } from '@/lib/firebase'; 
import { updateProfile } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";

const PLACEHOLDER_AVATAR_PREFIX = 'https://placehold.co/';

export default function AvatarSelectionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { authUser, updateUserAvatar: contextUpdateUserAvatar } = useData(); 
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isAvatarSetByUser, setIsAvatarSetByUser] = useState(false);
  const [username, setUsername] = useState<string>(DEFAULT_USERNAME);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('usernameForAvatar');
    if (storedUsername) {
      setUsername(storedUsername);
    } else if (authUser?.displayName) {
      setUsername(authUser.displayName);
    }

    if (authUser?.photoURL && !authUser.photoURL.startsWith(PLACEHOLDER_AVATAR_PREFIX)) {
      setAvatarSrc(authUser.photoURL);
      setIsAvatarSetByUser(true);
    } else {
      const localAvatarKey = authUser ? `userAvatar_${authUser.uid}` : 'userAvatar_temp_key';
      const storedAvatar = localStorage.getItem(localAvatarKey);
       if (storedAvatar && !storedAvatar.startsWith(PLACEHOLDER_AVATAR_PREFIX)) {
        setAvatarSrc(storedAvatar);
        setIsAvatarSetByUser(true);
      } else {
        setAvatarSrc(null);
        setIsAvatarSetByUser(false);
      }
    }
  }, [authUser]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarSrc(result);
        setIsAvatarSetByUser(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = async () => {
    if (!authUser) {
      toast({ variant: "destructive", title: "Error", description: "Usuario no autenticado. Por favor, vuelve a registrarte." });
      router.push('/signup');
      return;
    }

    // If no avatar was chosen, just continue to the dashboard.
    if (!isAvatarSetByUser || !avatarSrc) {
      localStorage.removeItem('usernameForAvatar');
      toast({ title: "¡Perfil Creado!", description: `Bienvenido a EXILE, ${username}. Puedes añadir un avatar más tarde.` });
      router.push('/dashboard');
      return;
    }

    // If an avatar was chosen, attempt to upload it.
    setIsLoading(true);
    
    try {
      let finalAvatarUrl = avatarSrc;

      if (avatarSrc.startsWith('data:image')) {
        const storage = getStorage();
        const mimeType = avatarSrc.substring(avatarSrc.indexOf(':') + 1, avatarSrc.indexOf(';'));
        const base64Data = avatarSrc.substring(avatarSrc.indexOf(',') + 1);
        const fileExtension = mimeType.split('/')[1] || 'png';
        const imageRef = storageRef(storage, `avatars/${authUser.uid}/${Date.now()}.${fileExtension}`);
        
        const snapshot = await uploadString(imageRef, base64Data, 'base64', { contentType: mimeType });
        finalAvatarUrl = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(authUser, { photoURL: finalAvatarUrl });
      await contextUpdateUserAvatar(finalAvatarUrl); 
      
      toast({ title: "¡Perfil Completo!", description: `Bienvenido a EXILE, ${username}. ¡Tu aventura comienza ahora!` });
      router.push('/dashboard');

    } catch (error) {
      console.error("Error updating avatar:", error);
      let errorMessage = "No se pudo actualizar tu avatar. Inténtalo de nuevo.";
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'storage/unauthorized' || firebaseError.code === 'storage/project-not-found') {
          errorMessage = "Error de permisos o Storage no está activado. Verifica el plan de facturación de tu proyecto en Firebase.";
        } else if (firebaseError.code === 'storage/object-not-found' || firebaseError.code === 'storage/retry-limit-exceeded') {
            errorMessage = "Error de red o problema con el servidor de almacenamiento.";
        }
      }
      // Continue to dashboard even if upload fails
      toast({ variant: "destructive", title: "Error al Guardar Avatar", description: `${errorMessage} Omitiendo este paso.`});
      router.push('/dashboard');
    } finally {
      localStorage.removeItem('usernameForAvatar');
      setIsLoading(false); 
    }
  };

  const currentUsernameForDisplay = authUser?.displayName || username;

  return (
    <Card className="w-full max-w-md shadow-2xl border-primary/20">
      <CardHeader className="text-center">
        <Logo className="mx-auto mb-2" />
        <CardTitle className="font-headline text-2xl">Elige tu Avatar</CardTitle>
        <CardDescription>Selecciona una imagen para tu perfil, {currentUsernameForDisplay}. (Opcional)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col items-center">
        <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage src={avatarSrc || undefined} alt={currentUsernameForDisplay} data-ai-hint="user avatar abstract"/>
          <AvatarFallback className="text-5xl bg-muted text-muted-foreground">
            {currentUsernameForDisplay ? currentUsernameForDisplay.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        
        <Button onClick={handleUploadClick} variant="outline" className="w-full max-w-xs" disabled={isLoading}>
          <ImageUp className="mr-2 h-4 w-4" /> Subir Imagen
        </Button>

        <Button 
          onClick={handleContinue} 
          className="w-full max-w-xs bg-new-button-gradient text-primary-foreground hover:opacity-90" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isLoading ? "Finalizando..." : "Continuar a EXILE"}
        </Button>
      </CardContent>
       <CardFooter className="flex justify-center pt-4">
        <p className="text-xs text-muted-foreground text-center">
          Puedes cambiar tu avatar más tarde en la sección de Perfil.
        </p>
      </CardFooter>
    </Card>
  );
}
