
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUp, Send, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_USERNAME } from '@/lib/app-config';

export default function AvatarSelectionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(DEFAULT_USERNAME);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    // Check if an avatar was previously selected in this session (e.g., if user navigates back)
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) {
        setAvatarSrc(storedAvatar);
    } else {
        setAvatarSrc(`https://placehold.co/128x128.png`); // Default placeholder
    }
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarSrc(result);
        // Optimistically update localStorage, or wait for "Continue"
        localStorage.setItem('userAvatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = async () => {
    setIsLoading(true);
    // Avatar is already saved to localStorage by handleAvatarChange if a new one was selected
    // If no new avatar, the placeholder or existing one from localStorage remains.
    // If no avatar was ever selected and user clicks continue, default placeholder won't be "saved" as userAvatar unless explicitly done.
    // For simplicity, if avatarSrc is the placeholder, we can choose to not save it or save the placeholder.
    // Let's assume if it's still the default placeholder, we don't force save it to 'userAvatar'.
    // It will just remain unset in localStorage for avatar, and profile page will show fallback.

    // The crucial step: mark user as logged in
    localStorage.setItem('isLoggedIn', 'true');
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

    toast({ title: "¡Perfil Completo!", description: `Bienvenido a EXILE, ${username}. ¡Tu aventura comienza ahora!` });
    router.push('/dashboard');
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
          <AvatarImage src={avatarSrc || undefined} alt={username} data-ai-hint="user avatar abstract" />
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

        <Button onClick={handleContinue} className="w-full max-w-xs bg-new-button-gradient text-primary-foreground hover:opacity-90" disabled={isLoading}>
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
