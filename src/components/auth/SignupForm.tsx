"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Eye, EyeOff, Ticket, Mail, User } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error de registro", description: "Las contraseñas no coinciden." });
      setIsLoading(false);
      return;
    }

    // Mock signup
    setTimeout(() => {
      // Mock referral code check (e.g., "EXILE2080")
      if (referralCode === "EXILE2080" || referralCode === "") { // Allow empty for now
        localStorage.setItem('isLoggedIn', 'true'); // Auto-login after signup
        toast({ title: "Registro exitoso", description: "Bienvenido a EXILE. Tu aventura comienza ahora." });
        router.push('/dashboard');
      } else {
        toast({ variant: "destructive", title: "Error de registro", description: "Código de referido inválido." });
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-primary/20">
      <CardHeader className="text-center">
        <Logo className="mx-auto mb-2" />
        <CardTitle className="font-headline text-2xl">Únete a EXILE</CardTitle>
        <CardDescription>Crea tu perfil y comienza tu desarrollo colectivo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-signup">Correo Electrónico</Label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email-signup" type="email" placeholder="tu@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" aria-label="Correo Electrónico" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Contraseña</Label>
            <div className="relative">
              <Input id="password-signup" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" aria-label="Contraseña" />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password-signup">Confirmar Contraseña</Label>
            <div className="relative">
              <Input id="confirm-password-signup" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" aria-label="Confirmar Contraseña"/>
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral-code">Código de Referido (Opcional)</Label>
            <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="referral-code" type="text" placeholder="CÓDIGOEXCLUSIVO" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="pl-10" aria-label="Código de Referido" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300" disabled={isLoading}>
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>
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
