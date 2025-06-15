
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
    const value = categoryHabits.length;
    return {
      category: category,
      value: value,
      fullMark: Math.max(habits.filter(h => h.category === category).length, 1),
    };
  });

  const chartConfig = developmentCategories.reduce((config, category, index) => {
    config[category] = {
      label: category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`, // Not used if data polygon is transparent
    };
    return config;
  }, {} as any);


  if (habits.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-white border-neutral-300 shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-800">Progreso de Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-600">Aún no hay datos de hábitos para mostrar.</p>
          <p className="text-sm text-neutral-500">Completa algunos hábitos para ver tu progreso aquí.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="bg-white border-neutral-300 shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-neutral-800 text-xl font-semibold">Radar de Desarrollo Personal</CardTitle>
        <CardDescription className="text-neutral-600">
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
              content={<ChartTooltipContent indicator="line" hideLabel={true} />}
            />
            <PolarGrid stroke="#000000" strokeWidth={1} />
            <PolarAngleAxis 
              dataKey="category" 
              tick={false} // Hide category labels
              tickLine={false} // Hide lines pointing to categories
            />
            <PolarRadiusAxis
                angle={30} // Starting angle (can be adjusted, 90 or 0 are common for symmetry)
                domain={[0, Math.max(...chartData.map(d => d.fullMark), 1)]}
                tickCount={5} // For 4 concentric grid shapes
                tick={false} // Hide numeric scale labels
                axisLine={{ stroke: "#000000", strokeWidth: 1 }} // Show radial spokes in black
                tickLine={false} // Hide tick marks on spokes
            />
            <Radar
              dataKey="value"
              fill="transparent" // Make data polygon fill transparent
              stroke="transparent" // Make data polygon outline transparent
              strokeWidth={1}
              dot={false} // Hide dots at data points
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium leading-none text-neutral-500">
          Completar hábitos incrementa tu puntuación en cada área.
        </div>
      </CardFooter>
    </Card>
  )
}

