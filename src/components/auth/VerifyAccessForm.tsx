
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyAccessForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock verification
    setTimeout(() => {
      if (invitationCode.toUpperCase() === "EXILE") { // Changed from EXILE2025 to EXILE
        localStorage.setItem('isLoggedIn', 'true');
        toast({ title: "Acceso Verificado", description: "Bienvenido a EXILE." });
        router.push('/dashboard');
      } else {
        toast({ variant: "destructive", title: "Código Inválido", description: "El código de invitación no es correcto." });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md border-primary/30 bg-card shadow-neon-red-card">
      <CardHeader className="text-center items-center pt-8">
        <div className="p-3 bg-primary/10 rounded-full mb-4 inline-block border border-primary/30">
          <KeyRound className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl text-gradient-red">Verificar Acceso</CardTitle>
        <CardDescription className="text-muted-foreground pt-1">
          Ingresa tu código de invitación para unirte a EXILE.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="invitation-code" className="text-foreground font-semibold">Código de Invitación</Label>
            <Input 
              id="invitation-code" 
              type="text" 
              placeholder="Ingresa tu código" 
              required 
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="bg-background/50 border-neutral-700 focus:border-primary"
              aria-label="Código de Invitación"
            />
          </div>
          <Button type="submit" className="w-full bg-new-button-gradient text-primary-foreground hover:opacity-90 transition-opacity duration-300 text-base py-3 h-auto" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verificando...
              </>
            ) : "Verificar Código"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pb-8">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

