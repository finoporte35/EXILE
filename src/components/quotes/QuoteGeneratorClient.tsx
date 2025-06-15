"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lightbulb, BookOpen, BarChart3, ShieldHalf } from "lucide-react";
import { generateMotivationalQuote, type GenerateMotivationalQuoteInput } from '@/ai/flows/generate-motivational-quote';
import { useToast } from '@/hooks/use-toast';

const categories: { value: GenerateMotivationalQuoteInput['category']; label: string; icon: React.ElementType }[] = [
  { value: 'success', label: 'Éxito', icon: ShieldHalf },
  { value: 'study', label: 'Estudio', icon: BookOpen },
  { value: 'self-improvement', label: 'Automejora', icon: BarChart3 },
  { value: 'discipline', label: 'Disciplina', icon: ShieldHalf }, // Re-using icon for example
];

export default function QuoteGeneratorClient() {
  const [selectedCategory, setSelectedCategory] = useState<GenerateMotivationalQuoteInput['category'] | undefined>(categories[0].value);
  const [quote, setQuote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuote = async () => {
    if (!selectedCategory) {
      toast({ variant: "destructive", title: "Error", description: "Por favor selecciona una categoría." });
      return;
    }
    setIsLoading(true);
    setQuote(null);
    try {
      const result = await generateMotivationalQuote({ category: selectedCategory });
      setQuote(result.quote);
    } catch (error) {
      console.error("Error generating quote:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar la cita. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="font-headline text-2xl text-gradient-red">Generador de Citas IA</CardTitle>
        <CardDescription>Encuentra inspiración para potenciar tu día.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">Selecciona una Categoría:</label>
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => setSelectedCategory(value as GenerateMotivationalQuoteInput['category'])}
          >
            <SelectTrigger id="category-select" className="w-full" aria-label="Seleccionar categoría de cita">
              <SelectValue placeholder="Elige una categoría..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4" />
                    {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleGenerateQuote} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" disabled={isLoading || !selectedCategory}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          {isLoading ? 'Generando...' : 'Generar Cita'}
        </Button>
      </CardContent>
      {quote && !isLoading && (
        <CardFooter className="flex flex-col items-center text-center border-t pt-6">
          <p className="text-lg italic text-foreground leading-relaxed">&ldquo;{quote}&rdquo;</p>
          <p className="mt-2 text-sm text-muted-foreground">- IA de EXILE</p>
        </CardFooter>
      )}
      {isLoading && (
         <CardFooter className="flex flex-col items-center text-center border-t pt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="mt-2 text-sm text-muted-foreground">Buscando inspiración...</p>
         </CardFooter>
      )}
    </Card>
  );
}
