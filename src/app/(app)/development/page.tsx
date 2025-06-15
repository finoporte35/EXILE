
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DevelopmentRadarChart, { type RadarChartDataPoint } from '@/components/dashboard/DevelopmentRadarChart';
import { TrendingUp, Zap, ShieldCheck, Target, Activity, GitFork, Lightbulb, BookOpen, BarChart3, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Attribute {
  name: string;
  icon: LucideIcon;
  description: string;
  currentLevel: string; 
  xpInArea: string; 
  value: number; // Added for direct use in radar chart
  comingSoonText: string;
}

const attributes: Attribute[] = [
  {
    name: "Motivación",
    icon: TrendingUp,
    description: "Impulso interno y externo para actuar y alcanzar metas.",
    currentLevel: "75/100",
    xpInArea: "750/1000",
    value: 75,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Energía",
    icon: Zap,
    description: "Nivel de vitalidad física y mental para afrontar el día.",
    currentLevel: "65/100",
    xpInArea: "650/1000",
    value: 65,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Disciplina",
    icon: ShieldCheck,
    description: "Capacidad de autocontrol y constancia en hábitos y tareas.",
    currentLevel: "85/100",
    xpInArea: "850/1000",
    value: 85,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Enfoque",
    icon: Target,
    description: "Habilidad para concentrarse en una tarea sin distracciones.",
    currentLevel: "50/100",
    xpInArea: "500/1000",
    value: 50,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Resiliencia",
    icon: Activity,
    description: "Capacidad para superar adversidades y adaptarse al cambio.",
    currentLevel: "70/100",
    xpInArea: "700/1000",
    value: 70,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Adaptabilidad",
    icon: GitFork,
    description: "Flexibilidad para ajustarse a nuevas situaciones o entornos.",
    currentLevel: "80/100",
    xpInArea: "800/1000",
    value: 80,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Estrategia",
    icon: Lightbulb,
    description: "Habilidad para planificar y tomar decisiones efectivas a largo plazo.",
    currentLevel: "40/100",
    xpInArea: "400/1000",
    value: 40,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  },
  {
    name: "Conocimiento",
    icon: BookOpen,
    description: "Adquisición y aplicación de información y habilidades.",
    currentLevel: "60/100",
    xpInArea: "600/1000",
    value: 60,
    comingSoonText: "Próximamente: Herramientas y estrategias para mejorar esta área."
  }
];

const developmentRadarData: RadarChartDataPoint[] = attributes.map(attr => ({
  category: attr.name,
  value: attr.value, 
  fullMark: 100,
}));

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
        <p className="text-xs text-primary"><span className="font-medium">Nivel actual:</span> {attribute.currentLevel}</p>
        <p className="text-xs text-primary"><span className="font-medium">XP en Área:</span> {attribute.xpInArea}</p>
        <p className="text-xs text-muted-foreground pt-1">{attribute.comingSoonText}</p>
      </CardContent>
    </Card>
  );
};

export default function DevelopmentPage() {
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
          <CardDescription>Visualización de tus áreas de desarrollo actuales. (XP General Actual: 0)</CardDescription>
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
