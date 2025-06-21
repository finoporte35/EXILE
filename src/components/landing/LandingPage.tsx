
"use client";

import Link from "next/link";
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/shared/Logo";
import { ArrowRight, Users, CheckCircle, BarChart3, Shield, Star, ListChecks, BrainCircuit } from "lucide-react";

const LandingHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
    <div className="container mx-auto flex h-20 items-center justify-between px-4">
      <Logo size="medium" />
      <nav className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
        <Button className="bg-new-button-gradient text-primary-foreground hover:opacity-90" asChild>
          <Link href="/signup">Únete Ahora</Link>
        </Button>
      </nav>
    </div>
  </header>
);

const FeatureShowcase = () => (
    <div className="relative flex h-[500px] w-full max-w-lg items-center justify-center">
        {/* Main central card */}
        <Card
          className="absolute h-[450px] w-[280px] animate-fade-in [animation-delay:0.2s] overflow-hidden rounded-2xl border-2 border-primary/20 shadow-2xl shadow-primary/10 transition-transform duration-300 hover:scale-105 bg-feature-rome bg-cover bg-center"
        >
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <h3 className="animate-fade-in text-3xl font-bold text-white shadow-black [text-shadow:_0_2px_4px_var(--tw-shadow-color)] [animation-delay:1s]">
                    FORJA TU DESTINO
                </h3>
                 <Button className="animate-fade-in mt-4 w-full bg-white/90 text-black hover:bg-white [animation-delay:1.2s]" asChild>
                    <Link href="/signup">Empezar Ahora</Link>
                </Button>
            </div>
        </Card>

        {/* Floating Card: Ranks */}
        <Card className="absolute -left-8 top-16 w-40 animate-float transition-transform duration-300 hover:scale-110 animate-fade-in [animation-delay:0.4s]" style={{animationDuration: '6s'}}>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="rounded-full bg-primary/10 p-2">
                    <Star className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Asciende de Rango</p>
                <p className="text-xs text-muted-foreground">Demuestra tu progreso.</p>
            </CardContent>
        </Card>

        {/* Floating Card: Habits */}
        <Card className="absolute -right-10 top-24 w-48 animate-float transition-transform duration-300 hover:scale-110 animate-fade-in [animation-delay:0.6s]" style={{animationDuration: '7s'}}>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="rounded-full bg-primary/10 p-2">
                    <ListChecks className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Rutinas Optimizadas</p>
                <p className="text-xs text-muted-foreground">Sistema de hábitos con XP.</p>
            </CardContent>
        </Card>

        {/* Floating Card: AI Analysis */}
        <Card className="absolute -bottom-4 right-0 w-48 animate-float transition-transform duration-300 hover:scale-110 animate-fade-in [animation-delay:0.8s]" style={{animationDuration: '5s'}}>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="rounded-full bg-primary/10 p-2">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Análisis con IA</p>
                <p className="text-xs text-muted-foreground">Feedback personalizado.</p>
            </CardContent>
        </Card>
    </div>
);

const TestimonialAvatar = () => (
    <div className="flex-shrink-0">
        <Avatar className="h-16 w-16 border-2 border-primary/50">
            <AvatarImage src="/images/founder.jpeg" alt="Founder of EXILE" data-ai-hint="person face" />
            <AvatarFallback>E</AvatarFallback>
        </Avatar>
    </div>
);

const ParticlesBackground = () => {
    const [particles, setParticles] = useState<React.ReactNode[]>([]);
    
    useEffect(() => {
        const particleCount = 60;
        const generatedParticles = Array.from({ length: particleCount }).map((_, i) => {
            const size = Math.random() * 3 + 1;
            const style = {
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${Math.random() * 20 + 15}s`,
            };
            return <div key={i} className="particle" style={style} />;
        });
        setParticles(generatedParticles);
    }, []);

    return <div className="particle-background">{particles}</div>;
};


export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <ParticlesBackground />
      <LandingHeader />
      <main className="overflow-hidden relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pb-12 pt-32 sm:pt-40">
            <div className="grid grid-cols-1 items-center gap-y-12 lg:grid-cols-5 lg:gap-x-16">
                {/* Left Column */}
                <div className="space-y-8 lg:col-span-3">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-headline animate-in fade-in slide-in-from-top-8 duration-700">
                        Desbloquea el Sistema para un <span className="text-gradient-red">Cambio Completo</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-muted-foreground animate-in fade-in slide-in-from-top-8 duration-700 [animation-delay:0.2s]">
                        Forja tu nueva identidad en 6 meses. Lo único que quedará será tu nombre. Domina cada área de tu vida de forma estratégica, inmersiva y medible.
                    </p>
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-8 duration-700 [animation-delay:0.4s]">
                        <Button size="lg" className="h-12 text-base" asChild>
                            <Link href="/signup">Comienza tu Evolución</Link>
                        </Button>
                        <Button variant="link" className="text-primary" asChild>
                             <Link href="#features">
                                Ver Características <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Right Column (Mobile: below) */}
                <div className="flex items-center justify-center lg:col-span-2">
                    <FeatureShowcase />
                </div>
            </div>
        </section>

        {/* Community & Testimonials Section */}
         <section className="bg-card/80 backdrop-blur-sm py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
                     {/* Community Card */}
                    <Card className="rounded-2xl border-none bg-neutral-900 text-white shadow-2xl shadow-black/30">
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold">La comunidad para fundadores de su propio legado.</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Button variant="link" className="p-0 text-base text-primary hover:text-primary/80" asChild>
                                <Link href="https://www.heroes.academy/" target="_blank" rel="noopener noreferrer">
                                    Investigar <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    
                    {/* Testimonials Card */}
                    <Card className="rounded-2xl bg-transparent border-none lg:col-span-2">
                         <CardHeader>
                            <CardTitle className="text-3xl font-bold text-foreground">Un Mensaje del Fundador</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">Una nueva visión para el desarrollo personal.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                            <TestimonialAvatar />
                            <div className="flex-grow">
                                <blockquote className="italic text-foreground text-lg border-l-2 border-primary/50 pl-4">
                                    &ldquo;Es que es un maldito cheatcode, hay tantas posibilidades y esta es una de ellas.&rdquo;
                                </blockquote>
                                <p className="mt-4 font-semibold text-primary text-right">&mdash; Fundador de EXILE</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>


        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20 sm:py-24 text-center">
            <h2 className="text-4xl font-bold text-gradient-red font-headline animate-in fade-in">Un Arsenal para tu Desarrollo</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground animate-in fade-in [animation-delay:0.2s]">
                Herramientas diseñadas para la élite. Mide tu progreso, optimiza tus rutinas y conquista tus metas con precisión.
            </p>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in [animation-delay:0.4s]">
                <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><BarChart3 className="h-8 w-8 text-primary"/></div>
                    <h3 className="text-xl font-semibold text-foreground">Rangos y Estadísticas</h3>
                    <p className="text-muted-foreground">Asciende en el sistema de rangos, gana XP y visualiza tu desarrollo con estadísticas detalladas.</p>
                </div>
                 <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><CheckCircle className="h-8 w-8 text-primary"/></div>
                    <h3 className="text-xl font-semibold text-foreground">Hábitos y Metas</h3>
                    <p className="text-muted-foreground">Construye rutinas poderosas con nuestro tracker de hábitos y define objetivos S.M.A.R.T. para un progreso medible.</p>
                </div>
                 <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><Shield className="h-8 w-8 text-primary"/></div>
                    <h3 className="text-xl font-semibold text-foreground">Eras y Ventajas</h3>
                    <p className="text-muted-foreground">Embárcate en "Eras" temáticas para enfocar tu desarrollo y desbloquea ventajas pasivas permanentes.</p>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t border-border/50 relative z-10 bg-background">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
            <Logo size="small" className="mb-2"/>
            <p>&copy; {new Date().getFullYear()} EXILE. Todos los derechos reservados.</p>
            <p className="text-xs">Diseñado para la nueva generación de líderes.</p>
        </div>
      </footer>
    </div>
  );
}
