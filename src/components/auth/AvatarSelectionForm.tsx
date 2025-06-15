
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

const PLACEHOLDER_AVATAR_PREFIX = 'https://placehold.co/';

export default function AvatarSelectionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isAvatarSetByUser, setIsAvatarSetByUser] = useState(false);
  const [username, setUsername] = useState<string>(DEFAULT_USERNAME);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar && !storedAvatar.startsWith(PLACEHOLDER_AVATAR_PREFIX)) {
      setAvatarSrc(storedAvatar);
      setIsAvatarSetByUser(true);
    } else {
      setAvatarSrc(null); // Ensure fallback is shown if only placeholder or no avatar
      setIsAvatarSetByUser(false);
    }
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarSrc(result);
        localStorage.setItem('userAvatar', result);
        setIsAvatarSetByUser(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = async () => {
    if (!isAvatarSetByUser) {
      toast({
        variant: "destructive",
        title: "Avatar Requerido",
        description: "Por favor, sube una imagen para tu avatar antes de continuar.",
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      toast({ title: "¡Perfil Completo!", description: `Bienvenido a EXILE, ${username}. ¡Tu aventura comienza ahora!` });
      router.push('/dashboard');
      setIsLoading(false); 
    }, 500); 
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-primary/20">
      <CardHeader className="text-center">
        <Logo className="mx-auto mb-2" />
        <CardTitle className="font-headline text-2xl">Elige tu Avatar</CardTitle>
        <CardDescription>Selecciona una imagen para tu perfil, {username}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col items-center">
        <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage src={avatarSrc || undefined} alt={username} data-ai-hint="user avatar abstract"/>
          <AvatarFallback className="text-5xl bg-muted text-muted-foreground">
            {username ? username.charAt(0).toUpperCase() : "U"}
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
          disabled={isLoading || !isAvatarSetByUser}
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
