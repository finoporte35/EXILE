import HabitTracker from '@/components/habits/HabitTracker';

export default function HabitsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Seguimiento de Hábitos</h1>
        <p className="text-muted-foreground">Construye rutinas poderosas y observa tu progreso.</p>
      </div>
      <HabitTracker />
    </div>
  );
}
