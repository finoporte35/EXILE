
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Lista estática de citas
const staticQuotes: { text: string; author: string }[] = [
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "La vida es lo que pasa mientras estás ocupado haciendo otros planes.", author: "John Lennon" },
  { text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "La mejor manera de predecir el futuro es creándolo.", author: "Peter Drucker" },
  { text: "Cree que puedes y estarás a medio camino.", author: "Theodore Roosevelt" },
  { text: "El fracaso es la oportunidad de comenzar de nuevo con más inteligencia.", author: "Henry Ford" },
  { text: "Lo que no te mata, te hace más fuerte.", author: "Friedrich Nietzsche" },
  { text: "La imaginación es más importante que el conocimiento.", author: "Albert Einstein" },
  { text: "Nuestra mayor gloria no es no caer nunca, sino levantarnos cada vez que caemos.", author: "Confucio" }
];

export default function QuoteGeneratorClient() {
  const [displayedQuote, setDisplayedQuote] = useState<{ text: string; author: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStaticQuote = () => {
    setIsLoading(true);
    // Carga la cita directamente sin simular retraso
    const randomIndex = Math.floor(Math.random() * staticQuotes.length);
    setDisplayedQuote(staticQuotes[randomIndex]);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchStaticQuote();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleGenerateNewQuote = () => {
    fetchStaticQuote();
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="font-headline text-2xl text-gradient-red">Fuente de Inspiración</CardTitle>
        <CardDescription>Una dosis de sabiduría para potenciar tu día.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateNewQuote} className="w-full bg-new-button-gradient text-primary-foreground hover:opacity-90 transition-opacity" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isLoading ? 'Cargando...' : 'Nueva Cita'}
        </Button>
      </CardContent>
      
      {isLoading && !displayedQuote && ( // Muestra loader solo si está cargando y no hay cita (carga inicial)
         <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="mt-2 text-sm text-muted-foreground">Buscando inspiración...</p>
         </CardFooter>
      )}

      {!isLoading && displayedQuote && (
        <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
          <p className="text-lg italic text-foreground leading-relaxed">&ldquo;{displayedQuote.text}&rdquo;</p>
          <p className="mt-2 text-sm text-muted-foreground">- {displayedQuote.author}</p>
        </CardFooter>
      )}
      
      {!isLoading && !displayedQuote && ( // Estado si algo fallara y no hubiera cita (aunque es improbable con lista estática)
         <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
            <p className="text-muted-foreground">Haz clic en "Nueva Cita" para obtener inspiración.</p>
         </CardFooter>
      )}
    </Card>
  );
}
