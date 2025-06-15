
"use client"

import { TrendingUp, ClipboardList } from "lucide-react"
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

export interface RadarChartDataPoint {
  category: string;
  value: number;
  fullMark: number;
}

export interface DevelopmentRadarChartProps {
  data: RadarChartDataPoint[];
  title?: string;
  description?: string;
  footerText?: string;
}

export default function DevelopmentRadarChart({
  data,
  title = "Radar de Desarrollo",
  description = "Visualización de tu progreso en áreas clave.",
  footerText = "Completar acciones incrementa tu puntuación."
}: DevelopmentRadarChartProps) {

  const chartConfig = data.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return config;
  }, {} as any);

  if (data.length === 0 || data.every(d => d.value === 0 && d.fullMark === 0)) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-background border-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">Aún no hay datos para mostrar.</p>
          <p className="text-sm text-muted-foreground">Completa algunas acciones para ver tu progreso aquí.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background border-transparent shadow-none h-full">
      <CardHeader className="items-start pb-0">
        {title && (
            <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
            </div>
        )}
        {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
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
                angle={90} 
                domain={[0, Math.max(...data.map(d => d.fullMark), 1)]} 
                tickCount={5} 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                axisLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
                tickLine={false} 
            />
            <Radar
              dataKey="value"
              fill="hsla(var(--primary), 0.4)"
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
       {footerText && (
        <CardFooter className="flex-col gap-2 text-sm pt-2 pb-4">
            <div className="text-xs text-muted-foreground text-center">
            {footerText}
            </div>
        </CardFooter>
      )}
    </Card>
  )
}
