
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
// import { useToast } from '@/hooks/use-toast'; // Toast not used in this version

// Static list of quotes
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
  { text: "Nuestra mayor gloria no es no caer nunca, sino levantarnos cada vez que caemos.", author: "Confucio" },
  { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
  { text: "La clave no es la voluntad de ganar... todo el mundo la tiene. Es la voluntad de prepararse para ganar lo que es importante.", author: "Bobby Knight" },
  { text: "Si quieres levantar el ánimo a alguien, levanta el tuyo primero.", author: "Booker T. Washington" },
  { text: "El carácter es poder.", author: "Booker T. Washington" },
  { text: "Los obstáculos son esas cosas espantosas que ves cuando apartas los ojos de tu meta.", author: "Henry Ford" }
];

const LOCAL_STORAGE_KEY = 'exileUnlockedQuoteCount';

export default function QuoteGeneratorClient() {
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  // const { toast } = useToast(); // Toast not used

  useEffect(() => {
    setIsLoading(true);
    let storedUnlocked = 0;
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
      storedUnlocked = storedValue ? parseInt(storedValue, 10) : 0;
      if (isNaN(storedUnlocked) || storedUnlocked < 0) {
        storedUnlocked = 0;
      }
    } catch (error) {
      console.error("Error reading unlocked quotes from localStorage:", error);
      storedUnlocked = 0;
    }

    let newUnlockedCount = storedUnlocked;
    if (staticQuotes.length > 0) {
      if (storedUnlocked < staticQuotes.length) {
        // Unlock one new quote if available
        newUnlockedCount = storedUnlocked + 1;
      }
      // Ensure newUnlockedCount doesn't exceed total quotes
      newUnlockedCount = Math.min(newUnlockedCount, staticQuotes.length);
    } else {
      newUnlockedCount = 0; // No quotes to unlock
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(newUnlockedCount));
    } catch (error) {
        console.error("Error saving unlocked quotes to localStorage:", error);
    }
    
    setUnlockedCount(newUnlockedCount);

    if (newUnlockedCount > 0) {
      // Display the latest unlocked quote initially
      setCurrentIndex(newUnlockedCount - 1);
    } else {
      // Handle case with no quotes or nothing unlocked (e.g. if staticQuotes is empty)
      setCurrentIndex(0); 
    }
    setIsLoading(false);
  }, []);


  const handlePreviousQuote = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuote = () => {
    setCurrentIndex((prev) => Math.min(unlockedCount - 1, prev + 1));
  };

  const displayedQuote = (unlockedCount > 0 && staticQuotes.length > 0 && currentIndex < unlockedCount) 
    ? staticQuotes[currentIndex] 
    : null;

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="font-headline text-2xl text-gradient-red">Fuente de Inspiración</CardTitle>
          <CardDescription>Una dosis de sabiduría para potenciar tu día.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center min-h-[80px] justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          <p className="mt-2 text-sm text-muted-foreground">Cargando citas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="font-headline text-2xl text-gradient-red">Fuente de Inspiración</CardTitle>
        <CardDescription>Una dosis de sabiduría para potenciar tu día.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            onClick={handlePreviousQuote} 
            variant="outline"
            className="text-primary-foreground hover:opacity-90" 
            disabled={currentIndex === 0 || unlockedCount === 0}
            aria-label="Cita anterior"
          >
            <ChevronLeft className="mr-1 h-5 w-5" /> Anterior
          </Button>
          <p className="text-sm text-muted-foreground">
            {unlockedCount > 0 ? `Cita ${currentIndex + 1} de ${unlockedCount}` : "0 de 0"}
          </p>
          <Button 
            onClick={handleNextQuote} 
            variant="outline"
            className="text-primary-foreground hover:opacity-90" 
            disabled={currentIndex >= unlockedCount - 1 || unlockedCount === 0}
            aria-label="Siguiente cita"
          >
            Siguiente <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
         {unlockedCount < staticQuotes.length && unlockedCount > 0 && (
           <p className="text-xs text-center text-muted-foreground">
             ¡Se desbloqueó una nueva cita para ti hoy! Total: {unlockedCount} de {staticQuotes.length}.
           </p>
         )}
         {unlockedCount === staticQuotes.length && staticQuotes.length > 0 && (
            <p className="text-xs text-center text-green-400">
             ¡Has desbloqueado todas las citas disponibles!
           </p>
         )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
        {displayedQuote ? (
          <>
            <p className="text-lg italic text-foreground leading-relaxed">&ldquo;{displayedQuote.text}&rdquo;</p>
            <p className="mt-2 text-sm text-muted-foreground">- {displayedQuote.author}</p>
          </>
        ) : (
          <p className="text-muted-foreground">
            {staticQuotes.length > 0 ? "No hay más citas desbloqueadas por ahora o hubo un error." : "No hay citas disponibles en este momento."}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

