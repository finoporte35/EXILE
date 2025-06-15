
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [showNewUnlockMessage, setShowNewUnlockMessage] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setShowNewUnlockMessage(false);
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
        newUnlockedCount = storedUnlocked + 1;
        setShowNewUnlockMessage(true); // A new quote was unlocked in this session
      }
      newUnlockedCount = Math.min(newUnlockedCount, staticQuotes.length);
    } else {
      newUnlockedCount = 0; 
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(newUnlockedCount));
    } catch (error) {
        console.error("Error saving unlocked quotes to localStorage:", error);
    }
    
    setUnlockedCount(newUnlockedCount);

    if (newUnlockedCount > 0) {
      setCurrentIndex(newUnlockedCount - 1); // Display the latest unlocked quote
    } else {
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

  let cardDescriptionText = "Cargando tu inspiración...";
  if (!isLoading) {
    if (unlockedCount === 0 && staticQuotes.length > 0) {
        cardDescriptionText = "Visita esta sección para desbloquear tu primera cita.";
    } else if (unlockedCount > 0) {
        cardDescriptionText = `Tienes ${unlockedCount} de ${staticQuotes.length} citas desbloqueadas.`;
    } else {
        cardDescriptionText = "No hay citas disponibles en este momento.";
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl bg-card border-neutral-800 shadow-neon-red-card animate-fade-in">
        <CardHeader className="text-center border-b border-neutral-700/50 pb-6 pt-8">
          <Lightbulb className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-headline text-gradient-red">Chispa de Motivación</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {cardDescriptionText}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-10 px-6 text-center min-h-[250px] flex flex-col justify-center items-center">
          {isLoading ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary"/>
              <p className="mt-3 text-sm text-muted-foreground">Buscando inspiración...</p>
            </div>
          ) : displayedQuote ? (
            <div className="animate-fade-in space-y-6">
              <blockquote className="text-2xl md:text-3xl font-medium text-foreground italic leading-snug md:leading-relaxed">
                &ldquo;{displayedQuote.text}&rdquo;
              </blockquote>
              <p className="text-base text-muted-foreground">- {displayedQuote.author}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-lg">
              {staticQuotes.length > 0 ? "No hay citas desbloqueadas para mostrar." : "No hay citas disponibles."}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-neutral-700/50 gap-4">
          <Button
            onClick={handlePreviousQuote}
            variant="outline"
            className="w-full sm:w-auto border-neutral-700 hover:border-primary/70"
            disabled={currentIndex === 0 || unlockedCount === 0 || isLoading}
            aria-label="Cita anterior"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Anterior
          </Button>
          
          <p className="text-sm text-muted-foreground order-first sm:order-none">
            {unlockedCount > 0 ? `Cita ${currentIndex + 1} / ${unlockedCount}` : "0 / 0"}
          </p>
          
          <Button
            onClick={handleNextQuote}
            variant="outline"
            className="w-full sm:w-auto border-neutral-700 hover:border-primary/70"
            disabled={currentIndex >= unlockedCount - 1 || unlockedCount === 0 || isLoading}
            aria-label="Siguiente cita"
          >
            Siguiente <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6 text-center h-6">
        {!isLoading && showNewUnlockMessage && unlockedCount < staticQuotes.length && (
          <p className="text-sm text-primary animate-fade-in">
            ¡Se desbloqueó una nueva cita para ti hoy!
          </p>
        )}
        {!isLoading && unlockedCount === staticQuotes.length && staticQuotes.length > 0 && (
            <p className="text-sm text-green-400 animate-fade-in">
            ¡Has desbloqueado todas las citas disponibles!
            </p>
        )}
      </div>
    </div>
  );
}
