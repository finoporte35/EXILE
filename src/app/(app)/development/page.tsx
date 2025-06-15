
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DevelopmentRadarChart, { type RadarChartDataPoint } from '@/components/dashboard/DevelopmentRadarChart';
import { BarChart3, Info } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Attribute } from '@/types';

const AttributeCard: React.FC<{ attribute: Attribute }> = ({ attribute }) => {
  const Icon = attribute.icon;
  return (
    <Card className="bg-card border-neutral-800 shadow-md flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold text-foreground">{attribute.name}</CardTitle>
        </div>
        <CardDescription className="text-xs leading-relaxed">{attribute.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1.5">
        {/* currentLevel and xpInArea are static for now as per Attribute type */}
        <p className="text-xs text-primary"><span className="font-medium">Nivel (Valor):</span> {attribute.value}/100</p>
        {/* <p className="text-xs text-primary"><span className="font-medium">XP en Área:</span> {attribute.xpInArea}</p> */}
        <p className="text-xs text-muted-foreground pt-1">{attribute.comingSoonText}</p>
      </CardContent>
    </Card>
  );
};

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
           <BarChart3 className="h-7 w-7 text-primary" />
           <h1 className="text-3xl font-headline font-bold text-gradient-red">Centro de Desarrollo Personal</h1>
        </div>
        <p className="text-muted-foreground ml-9">Analiza y potencia tus atributos clave para el crecimiento integral.</p>
      </div>

      <Card className="bg-card border-neutral-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold text-gradient-red">Perfil de Atributos</CardTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attributes.map((attribute) => (
          <AttributeCard key={attribute.name} attribute={attribute} />
        ))}
      </div>
    </div>
  );
}
