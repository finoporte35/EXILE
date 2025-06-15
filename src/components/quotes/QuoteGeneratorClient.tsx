
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface Quote {
  id: string;
  text: string;
  author: string;
  unlocked: boolean;
  source: string;
}

const allQuotes: Quote[] = [
  { id: 'q1', text: "Enamórate de Jesús. Él nunca romperá tu corazón.", author: "Desconocido", unlocked: true, source: "Desconocido" },
  { id: 'q2', text: "El dolor es temporal, pero la gloria es eterna.", author: "Desconocido", unlocked: true, source: "Desconocido"},
  { id: 'q3', text: "Detrás de mi madurez, frialdad y mi obsesión por ser cada vez mejor, hay un niño que entendió que nadie vendría a salvarlo.", author: "Desconocido", unlocked: false, source: "Desconocido" },
  { id: 'q4', text: "Si no creyeras en ti, no estarías buscando cómo hacerlo posible.", author: "Desconocido", unlocked: true, source: "Desconocido"},
  { id: 'q5', text: "Algunas cosas romperán tu corazón, pero arreglarán tu visión.", author: "Desconocido", unlocked: false, source: "Desconocido" },
  { id: 'q6', text: "Nadie se baña dos veces en el mismo río; todo fluye, todo cambia.", author: "Desconocido", unlocked: true, source: "Desconocido"},
  { id: 'q7', text: "Cada vez que subes de nivel, pierdes algo: un mal hábito, una amistad, una versión de ti mismo. Eso no es una pérdida, es la prueba de que estás evolucionando.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q8', text: "No importa las veces que fracases, sigue intentando.", author: "Desconocido", unlocked: true, source: "Desconocido"},
  { id: 'q9', text: "La mejor venganza no es vengarte. Sana. Sigue adelante y no te conviertas en quienes te hicieron daño.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q10', text:"Dios no te llamó para que encajes. Te llamó para que brilles.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q11', text: "La vida es mejor cuando no saben qué estás haciendo.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q12', text: "Voy a tener lo que quiero, lo sé porque lo recuerdo cuando quería lo que tengo ahora.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q13', text: "Nada nos pertenece, por eso hay que disfrutar cuando se puede y dejar ir cuando se debe.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q14', text: "El círculo se hizo más pequeño. La visión se hizo más grande.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q15', text: "El tiempo de Dios, no el mío; el plan de Dios, no el mío; la voluntad de Dios, no la mía; la gloria de Dios, no la mía.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q16', text: "El miedo mata sueños más que el fracaso.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q17', text: "Algunos paran porque es difícil. Otros comienzan porque es imposible.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q18', text: "Fallas, fallas, fallas hasta que triunfas...", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q19', text: "Trabaja en silencio y deja que tu éxito haga el ruido.", author: "Desconocido", unlocked: false, source: "Desconocido"},
  { id: 'q20', text: "La vida cambia por completo cuando entiendes que tu futuro depende de las decisiones y sacrificios que tomes ahora.", author: "Desconocido", unlocked: false, source: "Desconocido"},
];

export default function QuoteGeneratorClient() {
  const [displayedQuote, setDisplayedQuote] = useState<{ text: string; author: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleShowNewQuote = () => {
    setIsLoading(true);
    setDisplayedQuote(null);

    const unlockedQuotes = allQuotes.filter(q => q.unlocked);

    if (unlockedQuotes.length === 0) {
      toast({ variant: "destructive", title: "Sin frases", description: "No hay frases desbloqueadas disponibles en este momento." });
      setIsLoading(false);
      return;
    }

    // Simulate a small delay for UX, like an API call
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * unlockedQuotes.length);
      const randomQuote = unlockedQuotes[randomIndex];
      setDisplayedQuote({ text: randomQuote.text, author: randomQuote.author });
      setIsLoading(false);
    }, 300);
  };
  
  // Show a quote on initial load
  useEffect(() => {
    handleShowNewQuote();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="font-headline text-2xl text-gradient-red">Fuente de Inspiración</CardTitle>
        <CardDescription>Encuentra una frase para potenciar tu día.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={handleShowNewQuote} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {isLoading ? 'Buscando...' : 'Mostrar Otra Frase'}
        </Button>
      </CardContent>
      
      {isLoading && (
         <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[100px] justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="mt-2 text-sm text-muted-foreground">Buscando inspiración...</p>
         </CardFooter>
      )}

      {!isLoading && displayedQuote && (
        <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[100px] justify-center">
          <p className="text-lg italic text-foreground leading-relaxed">&ldquo;{displayedQuote.text}&rdquo;</p>
          <p className="mt-2 text-sm text-muted-foreground">- {displayedQuote.author}</p>
        </CardFooter>
      )}
      
      {!isLoading && !displayedQuote && (
         <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[100px] justify-center">
            <p className="text-muted-foreground">Haz clic en el botón para ver una frase.</p>
         </CardFooter>
      )}
    </Card>
  );
}

