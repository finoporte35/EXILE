
"use client"

import { TrendingUp } from "lucide-react"
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Habit } from '@/types'; // Use Habit from global types
import { HABIT_CATEGORIES } from "@/lib/app-config"; // Use categories from config

interface HabitProgressChartProps {
  habits: Habit[];
}

// Use the same categories as defined in app-config
const developmentCategories = HABIT_CATEGORIES;

export default function HabitProgressChart({ habits }: HabitProgressChartProps) {
  const chartData = developmentCategories.map(category => {
    let completedXpInCategory = 0;
    let totalPossibleXpInCategory = 0; // Max XP one could get if all habits in this cat were completed

    habits.forEach(h => {
      if (h.category === category) {
        totalPossibleXpInCategory += h.xp; // Sum XP of all habits in this category
        if (h.completed) {
          completedXpInCategory += h.xp;
        }
      }
    });
    
    // Value for radar chart is percentage of XP obtained from completed habits in this category
    // relative to total XP from all habits in this category.
    const value = totalPossibleXpInCategory > 0 ? (completedXpInCategory / totalPossibleXpInCategory) * 100 : 0;
    const fullMark = 100; // Radar chart shows percentage completion for the category

    return {
      category: category,
      value: Math.min(value, fullMark), 
      fullMark: fullMark,
    };
  });

  const chartConfig = developmentCategories.reduce((config, category, index) => {
    config[category] = {
      label: category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`, 
    };
    return config;
  }, {} as any);

  if (habits.length === 0) { // Show empty state if no habits at all
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-card border-neutral-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-primary">Radar de Desarrollo por Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">Aún no hay hábitos para mostrar.</p>
          <p className="text-sm text-muted-foreground">Añade hábitos para ver tu progreso aquí.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Show this state if there are habits but none yield data for the chart (e.g. all categories empty or all values 0)
  const noChartData = chartData.every(d => d.value === 0);
  if (noChartData) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-card border-neutral-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-primary">Radar de Desarrollo por Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">No hay datos de progreso de hábitos completados.</p>
          <p className="text-sm text-muted-foreground">Completa algunos hábitos para ver el radar.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="bg-card border-neutral-800 shadow-md">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-primary text-xl font-semibold">Radar de Desarrollo por Hábitos</CardTitle>
        <CardDescription className="text-muted-foreground">
          Progreso en áreas basado en hábitos completados.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" hideLabel={false} />}
            />
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1}/>
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
              tickLine={false} 
            />
            <PolarRadiusAxis
                angle={30} 
                domain={[0, 100]} // Domain is 0-100 for percentage
                tickCount={5} 
                tick={false}
                axisLine={false}
                tickLine={false} 
            />
            <Radar
              dataKey="value"
              fill="transparent" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="text-xs text-muted-foreground text-center">
          El radar muestra el % de XP obtenido en cada categoría de hábitos.
        </div>
      </CardFooter>
    </Card>
  )
}
