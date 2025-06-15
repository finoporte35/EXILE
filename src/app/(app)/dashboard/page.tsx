
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  History, CheckCircle2, Target, Moon, Zap, ClipboardList, ListTodo, Lightbulb, ListPlus, BedDouble 
} from 'lucide-react';
import DevelopmentRadarChart, { type RadarChartDataPoint } from '@/components/dashboard/DevelopmentRadarChart';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, iconColor = "text-primary" }) => (
  <Card className="bg-card border-neutral-800 shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

interface KeyIndicatorProps {
  name: string;
  percentage: number;
}

const KeyIndicatorItem: React.FC<KeyIndicatorProps> = ({ name, percentage }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-sm text-foreground">{name}</span>
      <span className="text-sm text-primary font-semibold">{percentage}%</span>
    </div>
    <Progress value={percentage} className="h-1.5 bg-neutral-700 [&>div]:bg-primary" indicatorClassName="bg-primary" />
  </div>
);

const developmentRadarData: RadarChartDataPoint[] = [
  { category: "Motivación", value: 0, fullMark: 100 },
  { category: "Conocimiento", value: 0, fullMark: 100 },
  { category: "Estrategia", value: 0, fullMark: 100 },
  { category: "Adaptabilidad", value: 0, fullMark: 100 },
  { category: "Resiliencia", value: 0, fullMark: 100 },
  { category: "Enfoque", value: 0, fullMark: 100 },
  { category: "Disciplina", value: 0, fullMark: 100 },
  { category: "Energía", value: 0, fullMark: 100 },
];

const quickActions = [
  { label: "Registrar Hábitos Diarios", icon: ListPlus, href: "/habits" },
  { label: "Gestionar Metas", icon: Target, href: "/goals" }, // Assuming /goals page
  { label: "Registrar Sueño", icon: BedDouble, href: "/sleep" }, // Assuming /sleep page
];

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background text-foreground min-h-full">
      {/* Panel Title Bar */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-foreground">Panel</h1>
        {/* Bell icon and User Menu are part of AppHeader, which is in layout.tsx */}
      </div>
      
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold text-gradient-red">Tu Panel</h2>
        <p className="text-muted-foreground">Bienvenido de nuevo, Usuario. Revisa tu progreso.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rango Actual" value="NPC" subtitle="100 XP para Hombre" icon={History} />
        <StatCard title="Hábitos de Hoy" value="0/0" subtitle="Objetivos diarios" icon={CheckCircle2} />
        <StatCard title="Metas Activas" value="0" subtitle="Misiones en curso" icon={Target} />
        <StatCard title="Prom. Sueño" value="0 hrs" subtitle="Últimos 7 días" icon={Moon} />
      </div>

      {/* Rank Progress Bar */}
      <div className="bg-card p-4 rounded-lg border border-neutral-800 shadow-md">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium text-muted-foreground">Progreso al Siguiente Rango</h3>
          <span className="text-sm font-semibold text-primary">0%</span>
        </div>
        <Progress value={0} className="h-2 bg-neutral-700 [&>div]:bg-primary" />
      </div>

      {/* Middle Section: Key Indicators & Development Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 bg-card border-neutral-800 shadow-md h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold text-gradient-red">Indicadores Clave</CardTitle>
            </div>
            <CardDescription>Monitorea tus indicadores de rendimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <KeyIndicatorItem name="Motivación" percentage={0} />
            <KeyIndicatorItem name="Energía" percentage={0} />
            <KeyIndicatorItem name="Disciplina" percentage={0} />
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3 h-full">
          <DevelopmentRadarChart 
            data={developmentRadarData} 
            title="Desarrollo Personal"
            description="Visualiza tu progreso en áreas clave."
          />
        </div>
      </div>

      {/* Bottom Section: Quick Actions & Motivational Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-neutral-800 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold text-gradient-red">Acciones Rápidas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button key={action.label} variant="outline" className="w-full justify-start border-neutral-700 hover:bg-neutral-700/50 hover:border-primary/50" asChild>
                <Link href={action.href}>
                  <action.icon className="mr-2 h-4 w-4 text-primary" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-neutral-800 shadow-md">
          <CardHeader>
             <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold text-gradient-red">Enlace Motivacional</CardTitle>
            </div>
            <CardDescription>Accede a tu dosis diaria de inspiración.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quotes">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg group cursor-pointer">
                <Image 
                  src="https://placehold.co/600x338.png" 
                  alt="Enlace Motivacional" 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint="dark inspirational"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
                  <p className="text-lg font-semibold text-center text-white">"La disciplina te lleva donde la motivación no puede."</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
