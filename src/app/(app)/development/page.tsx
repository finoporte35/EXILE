
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DevelopmentRadarChart, { type RadarChartDataPoint } from '@/components/dashboard/DevelopmentRadarChart';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Info, TrendingUp as ChartLine, CalendarCheck2 as CalendarCheck, Trophy } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Attribute } from '@/types';

const AttributeCard: React.FC<{ attribute: Attribute }> = ({ attribute }) => {
  const Icon = attribute.icon;
  return (
    <Card className="bg-card border-neutral-800 shadow-md flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground">{attribute.name}</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">{attribute.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm text-primary font-medium">Nivel (Valor):</p>
                <p className="text-lg text-foreground font-bold">{attribute.value}/100</p>
            </div>
            <Progress value={attribute.value} className="h-2.5" indicatorClassName="bg-primary" />
        </div>
        <p className="text-xs text-muted-foreground pt-2">{attribute.comingSoonText}</p>
      </CardContent>
    </Card>
  );
};

const PlaceholderCard: React.FC<{ title: string; description: string; icon: React.ElementType }> = ({ title, description, icon: Icon }) => (
  <Card className="bg-card border-neutral-800 shadow-md">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function DevelopmentPage() {
  const { attributes, userXP } = useData();

  const developmentRadarData: RadarChartDataPoint[] = attributes.map(attr => ({
    category: attr.name,
    value: attr.value,
    fullMark: 100,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-background text-foreground min-h-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <BarChart3 className="h-8 w-8 text-primary" />
           <h1 className="text-3xl font-headline font-bold text-gradient-red">Análisis de Progreso y Estadísticas</h1>
        </div>
        <p className="text-muted-foreground ml-10">Explora tus atributos en detalle, visualiza tu desarrollo y consulta tu historial.</p>
      </div>

      <Card className="bg-card border-neutral-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold text-gradient-red">Perfil de Atributos Global</CardTitle>
          </div>
          <CardDescription>Visualización de tus áreas de desarrollo actuales. (XP General Actual: {userXP.toLocaleString()})</CardDescription>
        </CardHeader>
        <CardContent>
          <DevelopmentRadarChart
            data={developmentRadarData}
            title=""
            description=""
            footerText=""
          />
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold text-primary pt-4">Detalle de Atributos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attributes.map((attribute) => (
          <AttributeCard key={attribute.name} attribute={attribute} />
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-primary pt-8">Historial Detallado</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PlaceholderCard
          title="Historial de XP"
          description="Gráficos de evolución de XP y fuentes principales. Próximamente."
          icon={ChartLine}
        />
        <PlaceholderCard
          title="Registro de Hábitos"
          description="Calendario de rachas, tasas de finalización por categoría. Próximamente."
          icon={CalendarCheck}
        />
        <PlaceholderCard
          title="Historial de Metas"
          description="Metas completadas, tiempo promedio de finalización. Próximamente."
          icon={Trophy}
        />
      </div>
    </div>
  );
}
