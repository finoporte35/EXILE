
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
import type { Habit } from '@/types';
import { HABIT_CATEGORIES, DEFAULT_HABIT_XP } from "@/lib/app-config";

interface HabitProgressChartProps {
  habits: Habit[];
}

const developmentCategories = HABIT_CATEGORIES;
const MIN_AXIS_DOMAIN_VALUE = 50; // Minimum value for the radial axis domain if max XP is very low

export default function HabitProgressChart({ habits }: HabitProgressChartProps) {
  const chartData = developmentCategories.map(category => {
    let xpEarnedInCategory = 0;
    let totalPossibleXpInCategory = 0;

    habits.forEach(h => {
      if (h.category === category) {
        totalPossibleXpInCategory += h.xp;
        if (h.completed) {
          xpEarnedInCategory += h.xp;
        }
      }
    });
    
    return {
      category: category,
      xpEarned: xpEarnedInCategory, // This is the value we will plot
      xpPossible: totalPossibleXpInCategory, // This will help define the axis scale
    };
  });

  const chartConfig = developmentCategories.reduce((config, category, index) => {
    config[category] = {
      label: category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`, 
    };
    return config;
  }, {} as any);

  // Determine the maximum value for the radial axis domain
  const maxPossibleXpInAnyCategory = Math.max(...chartData.map(d => d.xpPossible), 0);
  const radialAxisDomainMax = Math.max(maxPossibleXpInAnyCategory, MIN_AXIS_DOMAIN_VALUE);

  if (habits.length === 0) {
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
  
  const noChartData = chartData.every(d => d.xpEarned === 0);
  if (noChartData && habits.length > 0) { // Habits exist, but none completed to show data
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-card border-neutral-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-primary">Radar de Desarrollo por Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">No hay XP ganado de hábitos completados.</p>
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
          XP absoluto ganado en cada categoría de hábitos.
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
              content={<ChartTooltipContent 
                indicator="line" 
                hideLabel={false} 
                nameKey="category"
                formatter={(value, name) => {
                  const item = chartData.find(d => d.category === name);
                  return (
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      <span>XP Ganado: {value}</span>
                      {item && <span>XP Posible: {item.xpPossible}</span>}
                    </div>
                  );
                }}
              />}
            />
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1}/>
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
              tickLine={false} 
            />
            <PolarRadiusAxis
                angle={30} 
                domain={[0, radialAxisDomainMax]}
                tickCount={Math.max(2, Math.min(5, Math.ceil(radialAxisDomainMax / DEFAULT_HABIT_XP)))} // Dynamic tick count
                tickFormatter={(value) => (value > 0 ? String(value) : '')} // Show ticks for non-zero values
                axisLine={true}
                tickLine={true}
                stroke="rgba(255, 255, 255, 0.2)"
            />
            <Radar
              dataKey="xpEarned" // Plotting the earned XP
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
          El radar muestra el XP total ganado por completar hábitos en cada categoría. El eje se ajusta al XP máximo posible.
        </div>
      </CardFooter>
    </Card>
  )
}

