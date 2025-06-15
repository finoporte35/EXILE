
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
import { ClipboardList } from "lucide-react";

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

  // Chart config is not strictly necessary if we hide labels and tooltips for this style
  // but keeping it doesn't hurt and might be useful for tooltips if re-enabled.
  const chartConfig = data.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      // Color for data series, not used if data polygon is transparent
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return config;
  }, {} as any);


  if (data.length === 0 || data.every(d => d.value === 0 && d.fullMark === 0)) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] bg-white border-neutral-300 shadow-md">
        <CardHeader>
          <CardTitle className="text-neutral-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <TrendingUp className="h-16 w-16 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-600">Aún no hay datos para mostrar.</p>
          <p className="text-sm text-neutral-500">Completa algunas acciones para ver tu progreso aquí.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="bg-white border-neutral-300 shadow-md h-full">
      <CardHeader className="items-start pb-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-neutral-700" />
          <CardTitle className="text-xl font-semibold text-neutral-800">{title}</CardTitle>
        </div>
        {description && <CardDescription className="text-neutral-600">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
            {/* Tooltip can be removed or kept; image doesn't show it */}
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
                angle={90} // Starting angle for the radial axis configuration
                domain={[0, Math.max(...data.map(d => d.fullMark), 1)]} // Ensure domain starts at 0
                tickCount={5} // Results in 4 concentric grid shapes (e.g., lines at 0, 25, 50, 75, 100)
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
       {footerText && (
        <CardFooter className="flex-col gap-2 text-sm pt-2 pb-4">
            <div className="text-xs text-neutral-500 text-center">
            {footerText}
            </div>
        </CardFooter>
      )}
    </Card>
  )
}

