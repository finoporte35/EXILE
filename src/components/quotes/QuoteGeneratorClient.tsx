
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateMotivationalQuote, type GenerateMotivationalQuoteInput } from '@/ai/flows/generate-motivational-quote';

// Define las categorías directamente, coincidiendo con el esquema del flujo.
const quoteCategories: GenerateMotivationalQuoteInput['category'][] = [
  "success",
  "study",
  "self-improvement",
  "discipline",
];

const categoryDisplayNames: Record<GenerateMotivationalQuoteInput['category'], string> = {
  success: "Éxito",
  study: "Estudio",
  "self-improvement": "Automejora",
  discipline: "Disciplina",
};

export default function QuoteGeneratorClient() {
  const [displayedQuote, setDisplayedQuote] = useState<{ text: string; author: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GenerateMotivationalQuoteInput['category']>(quoteCategories[0]); // Default a 'success'
  const { toast } = useToast();

  const fetchAIQuote = async (category: GenerateMotivationalQuoteInput['category']) => {
    setIsLoading(true);
    setDisplayedQuote(null); 
    try {
      const result = await generateMotivationalQuote({ category });
      if (result.quote) {
        setDisplayedQuote({ text: result.quote, author: "IA de EXILE" });
      } else {
        throw new Error("La IA no devolvió una cita.");
      }
    } catch (error) {
      console.error("Error generating AI quote:", error);
      toast({
        variant: "destructive",
        title: "Error al generar cita",
        description: error instanceof Error ? error.message : "No se pudo obtener una cita de la IA.",
      });
      // Fallback a una cita genérica si la IA falla, para no dejar el espacio vacío.
      setDisplayedQuote({ text: "La mayor gloria no es nunca caer, sino levantarse siempre.", author: "Nelson Mandela (Fallback)" });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar una cita al inicio con la categoría por defecto
  useEffect(() => {
    fetchAIQuote(selectedCategory);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo en el montaje inicial con la categoría por defecto


  const handleGenerateNewQuote = () => {
    fetchAIQuote(selectedCategory);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="font-headline text-2xl text-gradient-red">Fuente de Inspiración IA</CardTitle>
        <CardDescription>Elige una categoría y obtén una frase para potenciar tu día.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as GenerateMotivationalQuoteInput['category'])}>
            <SelectTrigger className="w-full sm:flex-1" aria-label="Seleccionar categoría de cita">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {quoteCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryDisplayNames[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateNewQuote} className="w-full sm:w-auto bg-new-button-gradient text-primary-foreground hover:opacity-90 transition-opacity" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generando...' : 'Generar Cita'}
          </Button>
        </div>
      </CardContent>
      
      {isLoading && (
         <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="mt-2 text-sm text-muted-foreground">Tu asistente IA está buscando inspiración...</p>
         </CardFooter>
      )}

      {!isLoading && displayedQuote && (
        <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
          <p className="text-lg italic text-foreground leading-relaxed">&ldquo;{displayedQuote.text}&rdquo;</p>
          <p className="mt-2 text-sm text-muted-foreground">- {displayedQuote.author}</p>
        </CardFooter>
      )}
      
      {!isLoading && !displayedQuote && (
         <CardFooter className="flex flex-col items-center text-center border-t pt-6 min-h-[120px] justify-center">
            <p className="text-muted-foreground">Selecciona una categoría y haz clic en "Generar Cita".</p>
         </CardFooter>
      )}
    </Card>
  );
}

