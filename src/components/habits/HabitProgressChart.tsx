
"use client"

import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from "recharts"

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

// Define a fixed set of categories for the radar chart
const developmentCategories = [
  "Salud Física", "Desarrollo Mental", "Productividad", "Bienestar Emocional", "Relaciones Sociales", "Crecimiento Espiritual"
];

export default function HabitProgressChart({ habits }: HabitProgressChartProps) {
  const chartData = developmentCategories.map(category => {
    const categoryHabits = habits.filter(h => h.category === category && h.completed);
    // For simplicity, sum XP of completed habits in this category
    // Or use a count, or average completion rate. Let's use count of completed.
    const value = categoryHabits.length; 
    return {
      category: category,
      value: value, // Max value could be total habits in that category
      fullMark: habits.filter(h => h.category === category).length || 1, // Avoid division by zero
    };
  });
  
  const chartConfig = developmentCategories.reduce((config, category, index) => {
    config[category] = {
      label: category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return config;
  }, {} as any);


  if (habits.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-gradient-red">Progreso de Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aún no hay datos de hábitos para mostrar.</p>
          <p className="text-sm text-muted-foreground">Completa algunos hábitos para ver tu progreso aquí.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-gradient-red">Radar de Desarrollo Personal</CardTitle>
        <CardDescription>
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
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarGrid stroke="hsla(var(--muted-foreground), 0.2)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={{ stroke: "hsla(var(--muted-foreground), 0.2)" }} />
            <PolarRadiusAxis angle={30} domain={[0, Math.max(...chartData.map(d => d.fullMark), 1)]} tickCount={4} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={{ stroke: "hsla(var(--muted-foreground), 0.2)" }} tickLine={{ stroke: "hsla(var(--muted-foreground), 0.2)" }} />
            <Radar
              dataKey="value"
              fill="hsla(var(--primary), 0.4)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
                stroke: "hsl(var(--primary))"
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium leading-none text-muted-foreground">
          Completar hábitos incrementa tu puntuación en cada área.
        </div>
      </CardFooter>
    </Card>
  )
}
