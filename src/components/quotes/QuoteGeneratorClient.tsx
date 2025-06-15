
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';

interface Quote {
  id: string;
  text: string;
  author: string;
}

const staticQuotes: Quote[] = [
  { id: 'q1', text: "Enamórate de Jesús. Él nunca romperá tu corazón.", author: "Desconocido" },
  { id: 'q2', text: "El dolor es temporal, pero la gloria es eterna.", author: "Desconocido"},
  { id: 'q3', text: "Detrás de mi madurez, frialdad y mi obsesión por ser cada vez mejor, hay un niño que entendió que nadie vendría a salvarlo.", author: "Desconocido" },
  { id: 'q4', text: "Si no creyeras en ti, no estarías buscando cómo hacerlo posible.", author: "Desconocido"},
  { id: 'q5', text: "Algunas cosas romperán tu corazón, pero arreglarán tu visión.", author: "Desconocido" },
  { id: 'q6', text: "Nadie se baña dos veces en el mismo río; todo fluye, todo cambia.", author: "Desconocido"},
  { id: 'q7', text: "Cada vez que subes de nivel, pierdes algo: un mal hábito, una amistad, una versión de ti mismo. Eso no es una pérdida, es la prueba de que estás evolucionando.", author: "Desconocido"},
  { id: 'q8', text: "No importa las veces que fracases, sigue intentando.", author: "Desconocido"},
  { id: 'q9', text: "La mejor venganza no es vengarte. Sana. Sigue adelante y no te conviertas en quienes te hicieron daño.", author: "Desconocido"},
  { id: 'q10', text:"Dios no te llamó para que encajes. Te llamó para que brilles.", author: "Desconocido"},
  { id: 'q11', text: "La vida es mejor cuando no saben qué estás haciendo.", author: "Desconocido"},
  { id: 'q12', text: "Voy a tener lo que quiero, lo sé porque lo recuerdo cuando quería lo que tengo ahora.", author: "Desconocido"},
  { id: 'q13', text: "Nada nos pertenece, por eso hay que disfrutar cuando se puede y dejar ir cuando se debe.", author: "Desconocido"},
  { id: 'q14', text: "El círculo se hizo más pequeño. La visión se hizo más grande.", author: "Desconocido"},
  { id: 'q15', text: "El tiempo de Dios, no el mío; el plan de Dios, no el mío; la voluntad de Dios, no la mía; la gloria de Dios, no la mía.", author: "Desconocido"},
  { id: 'q16', text: "El miedo mata sueños más que el fracaso.", author: "Desconocido"},
  { id: 'q17', text: "Algunos paran porque es difícil. Otros comienzan porque es imposible.", author: "Desconocido"},
  { id: 'q18', text: "Fallas, fallas, fallas hasta que triunfas...", author: "Desconocido"},
  { id: 'q19', text: "Trabaja en silencio y deja que tu éxito haga el ruido.", author: "Desconocido"},
  { id: 'q20', text: "La vida cambia por completo cuando entiendes que tu futuro depende de las decisiones y sacrificios que tomes ahora.", author: "Desconocido"},
  { id: 'q21', text: "Sé que me miran y se preguntan cómo fue. Tal vez sea porque subí de nivel. Porque ahora el barco ya lo nivelé", author: "Desconocido"},
  { id: 'q22', text: "Todos quieren ser parte del éxito pero nadie del proceso", author: "Desconocido"},
  { id: 'q23', text: "El éxito es la única venganza.", author: "Desconocido" },
  { id: 'q24', text: "Podrías dejar la vida ahora mismo. Deja que eso determine lo que hagas, dices y piensas.", author: "Marco Aurelio, Meditaciones." },
  { id: 'q25', text: "Si tu no crees en ti nadie mas lo hara", author: "Kobe Bryant" },
  { id: 'q26', text: "un ganador es solo un perdedor que lo volvió a intentar una vez más", author: "Desconocido" },
  { id: 'q27', text: "Trabaja tan duro, que nuncas tengas que presentarte", author: "Michael Jordan" },
  { id: 'q28', text: "VENI, VIDI, VICI. Vine, Ví, Venci.", author: "Desconocido" },
  { id: 'q29', text: "El día que el hombre supera sus deseos y adicciones, ese día el hombre se vuelve libre de verdad para lograr cosas increíbles y conocer su verdadero potencial", author: "Desconocido" },
  { id: 'q30', text: "Un gran bosque solo se riega con lluvia. Significa que para ser grande y fuerte como un bosque tienes que pasar dolor", author: "Desconocido" },
];

const LOCAL_STORAGE_KEY_UNLOCKED_COUNT = 'exileUnlockedQuoteCount';
const LOCAL_STORAGE_KEY_LAST_VISIT_DAY = 'exileQuoteLastVisitDay';


export default function QuoteGeneratorClient() {
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewUnlockMessage, setShowNewUnlockMessage] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setShowNewUnlockMessage(false); 
    
    let storedUnlocked = 0;
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY_UNLOCKED_COUNT);
      storedUnlocked = storedValue ? parseInt(storedValue, 10) : 0;
      if (isNaN(storedUnlocked) || storedUnlocked < 0 || storedUnlocked > staticQuotes.length) {
        storedUnlocked = 0; 
      }
    } catch (error) {
      console.error("Error reading unlocked quotes from localStorage:", error);
      storedUnlocked = 0; 
    }

    const today = new Date().toLocaleDateString(); 
    const lastVisitDay = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_VISIT_DAY);

    let newUnlockedCount = storedUnlocked;
    let justUnlockedToday = false;

    if (lastVisitDay !== today) { 
      if (staticQuotes.length > 0 && storedUnlocked < staticQuotes.length) {
        newUnlockedCount = Math.min(storedUnlocked + 1, staticQuotes.length);
        justUnlockedToday = true; 
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_VISIT_DAY, today);
    }
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_UNLOCKED_COUNT, String(newUnlockedCount));
    } catch (error) {
        console.error("Error saving unlocked quotes to localStorage:", error);
    }
    
    setUnlockedCount(newUnlockedCount);
    setShowNewUnlockMessage(justUnlockedToday); 

    if (newUnlockedCount > 0) {
      setCurrentIndex(newUnlockedCount - 1); 
    } else {
      setCurrentIndex(0); 
    }
    setAnimationKey(prev => prev + 1); 
    setIsLoading(false);
  }, []); 


  const handlePreviousQuote = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setAnimationKey(prev => prev + 1);
  };

  const handleNextQuote = () => {
    setCurrentIndex((prev) => Math.min(unlockedCount - 1, prev + 1));
    setAnimationKey(prev => prev + 1); 
  };

  const displayedQuote = (unlockedCount > 0 && staticQuotes.length > 0 && currentIndex < unlockedCount) 
    ? staticQuotes[currentIndex] 
    : null;

  let cardDescriptionText = "Cargando tu inspiración diaria...";
  if (!isLoading) {
    if (unlockedCount === 0 && staticQuotes.length > 0) {
        cardDescriptionText = "Visita esta sección cada día para encender tu próxima chispa.";
    } else if (unlockedCount > 0) {
        cardDescriptionText = `Tienes ${unlockedCount} de ${staticQuotes.length} citas desbloqueadas. Sigue adelante.`;
    } else { 
        cardDescriptionText = "No hay chispas disponibles en este momento.";
    }
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-full p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-2xl bg-card border-neutral-800 shadow-neon-red-card flex flex-col flex-grow min-h-[500px] sm:min-h-[550px] justify-between">
        <CardHeader className="text-center border-b border-neutral-700/50 pb-6 pt-8">
          <div className="flex flex-col items-center">
            <Lightbulb className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-headline text-gradient-red">Chispa de Motivación</CardTitle>
          </div>
          <CardDescription className="text-base text-muted-foreground mt-4 px-2">
            {cardDescriptionText}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-10 px-6 text-center flex-grow flex flex-col justify-center items-center overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary"/>
              <p className="mt-4 text-lg text-muted-foreground">Encendiendo la inspiración...</p>
            </div>
          ) : displayedQuote ? (
            <div key={animationKey} className="animate-fade-in animate-scale-up-center space-y-8 w-full">
              <blockquote className="text-2xl sm:text-3xl md:text-4xl font-medium text-foreground leading-normal sm:leading-relaxed">
                &ldquo;{displayedQuote.text}&rdquo;
              </blockquote>
              <p className="text-lg sm:text-xl text-muted-foreground/80">- {displayedQuote.author}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-xl">
              {staticQuotes.length > 0 ? "Vuelve mañana para encontrar tu próxima chispa." : "El manantial de chispas está seco por ahora."}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-neutral-700/50 gap-4">
          <Button
            onClick={handlePreviousQuote}
            variant="outline"
            className="w-full sm:w-auto border-neutral-700 hover:border-primary/70 text-lg py-3 px-6 h-auto"
            disabled={currentIndex === 0 || unlockedCount === 0 || isLoading}
            aria-label="Chispa anterior"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Anterior
          </Button>
          
          <p className="text-base text-muted-foreground order-first sm:order-none whitespace-nowrap">
            {unlockedCount > 0 ? `Chispa ${currentIndex + 1} de ${unlockedCount}` : "0 / 0"}
          </p>
          
          <Button
            onClick={handleNextQuote}
            variant="outline"
            className="w-full sm:w-auto border-neutral-700 hover:border-primary/70 text-lg py-3 px-6 h-auto"
            disabled={currentIndex >= unlockedCount - 1 || unlockedCount === 0 || isLoading}
            aria-label="Siguiente chispa"
          >
            Siguiente <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center h-6">
        {!isLoading && showNewUnlockMessage && unlockedCount <= staticQuotes.length && (
          <p className="text-base text-primary animate-fade-in">
            ¡Nueva chispa desbloqueada hoy!
          </p>
        )}
        {!isLoading && unlockedCount === staticQuotes.length && staticQuotes.length > 0 && (
            <p className="text-base text-green-400 animate-fade-in">
            ¡Has encendido todas las chispas disponibles!
            </p>
        )}
      </div>
    </div>
  );
}
