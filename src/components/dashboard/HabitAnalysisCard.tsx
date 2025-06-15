"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Brain } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeHabits, type AnalyzeHabitsInput, type AnalyzeHabitsOutput } from '@/ai/flows/ai-habit-analyzer';
import { useToast } from '@/hooks/use-toast';

export default function HabitAnalysisCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeHabitsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyzeHabits = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // For scaffolding, we use mock data. In a real app, this would come from user's actual habit data.
    const mockHabitData = JSON.stringify([
      { name: "Meditación Matutina", completed: true, category: "Bienestar Emocional", streak: 5 },
      { name: "Ejercicio Físico", completed: false, category: "Salud Física", streak: 2 },
      { name: "Leer 30 mins", completed: true, category: "Desarrollo Mental", streak: 10 },
      { name: "Planificar el día", completed: true, category: "Productividad", streak: 20 },
      { name: "Evitar comida chatarra", completed: false, category: "Salud Física", streak: 0 },
    ]);

    const input: AnalyzeHabitsInput = {
      habitData: `Datos de hábitos del usuario: ${mockHabitData}`,
      userPreferences: "Quiero mejorar mi concentración y ser más disciplinado."
    };

    try {
      const result = await analyzeHabits(input);
      setAnalysisResult(result);
    } catch (e) {
      console.error("Error analyzing habits:", e);
      setError("No se pudo completar el análisis. Inténtalo de nuevo más tarde.");
      toast({
        variant: "destructive",
        title: "Error de Análisis",
        description: "Hubo un problema al contactar al asistente IA.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-xl text-gradient-red">Asistente de Hábitos IA</CardTitle>
        </div>
        <CardDescription>Obtén un resumen y sugerencias personalizadas para mejorar tu rutina.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysisResult && !isLoading && (
          <Button onClick={handleAnalyzeHabits} className="w-full bg-main-gradient text-primary-foreground hover:opacity-90" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Analizando..." : "Analizar Mis Hábitos"}
          </Button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Tu asistente IA está trabajando...</p>
          </div>
        )}

        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && !isLoading && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">Resumen del Asistente:</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{analysisResult.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Sugerencias Personalizadas:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-2">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="bg-muted/30 p-2 rounded-md">{suggestion}</li>
                ))}
              </ul>
            </div>
            <Button onClick={handleAnalyzeHabits} variant="outline" className="w-full" disabled={isLoading}>
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <Sparkles className="mr-2 h-4 w-4" />}
             {isLoading ? "Re-analizando..." : "Volver a Analizar"}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Análisis proporcionado por la IA de EXILE. Utiliza datos simulados para esta demostración.
        </p>
      </CardFooter>
    </Card>
  );
}
