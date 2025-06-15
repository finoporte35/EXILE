
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
import type { Habit } from "./HabitTracker"

interface HabitProgressChartProps {
  habits: Habit[];
}

const developmentCategories = [
  "Salud Física", "Desarrollo Mental", "Productividad", "Bienestar Emocional", "Relaciones Sociales", "Crecimiento Espiritual"
];

export default function HabitProgressChart({ habits }: HabitProgressChartProps) {
  const chartData = developmentCategories.map(category => {
    const categoryHabits = habits.filter(h => h.category === category && h.completed);
    
    let completedXpInCategory = 0;
    let numberOfCompletedHabitsInCategory = 0;
    habits.forEach(h => {
      if (h.category === category && h.completed) {
        completedXpInCategory += h.xp;
        numberOfCompletedHabitsInCategory++;
      }
    });
    const averageXp = numberOfCompletedHabitsInCategory > 0 ? completedXpInCategory / numberOfCompletedHabitsInCategory : 0;
    const fullMark = 100;

    return {
      category: category,
      value: Math.min(averageXp, fullMark),
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

  if (habits.length === 0 || habits.every(h => !h.completed)) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-card border-neutral-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary">Progreso de Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">Aún no hay datos de hábitos para mostrar.</p>
          <p className="text-sm text-muted-foreground">Completa algunos hábitos para ver tu progreso aquí.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-neutral-800 shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-primary text-xl font-semibold">Radar de Desarrollo Personal</CardTitle>
        <CardDescription className="text-muted-foreground">
          Visualización de tu progreso en diferentes áreas de desarrollo.
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
            <PolarGrid stroke="hsl(var(--foreground))" strokeWidth={1}/>
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
              tickLine={false} 
            />
            <PolarRadiusAxis
                angle={30} 
                domain={[0, Math.max(...chartData.map(d => d.fullMark), 1)]}
                tickCount={6} 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                axisLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
                tickLine={false} 
            />
            <Radar
              dataKey="value"
              fill="hsla(var(--primary), 0.4)" 
              stroke="hsl(var(--primary))" 
              strokeWidth={1}
              dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="text-xs text-muted-foreground text-center">
          Completar hábitos incrementa tu puntuación en cada área.
        </div>
      </CardFooter>
    </Card>
  )
}
