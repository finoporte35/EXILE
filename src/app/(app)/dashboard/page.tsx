import UserStatsCard from '@/components/dashboard/UserStatsCard';
import RankDisplayCard from '@/components/dashboard/RankDisplayCard';
import HabitAnalysisCard from '@/components/dashboard/HabitAnalysisCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListChecks, BookOpen, ArrowRight } from 'lucide-react';
import Image from 'next/image';


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gradient-red">Bienvenido a EXILE</h1>
          <p className="text-muted-foreground">Tu centro de mando para el desarrollo colectivo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserStatsCard />
        <RankDisplayCard />
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-gradient-red">Próximos Hábitos</CardTitle>
            <CardDescription>Tus tareas pendientes para hoy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <span>Meditación Matutina</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/habits">Ver <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <span>Leer 30 mins</span>
              </div>
               <Button variant="ghost" size="sm" asChild>
                <Link href="/habits">Ver <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <Button className="w-full mt-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90" asChild>
              <Link href="/habits">Ir a Hábitos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HabitAnalysisCard />
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-gradient-red">Zona de Enfoque</CardTitle>
            <CardDescription>Un espacio para concentrarte y crecer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image 
                src="https://placehold.co/1200x675.png" 
                alt="Focus Zone Image" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="futuristic abstract"
                className="transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-2xl font-semibold text-white text-center p-4">"La disciplina es el puente entre metas y logros."</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
