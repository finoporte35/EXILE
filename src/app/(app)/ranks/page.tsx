
"use client";
import RankItem from '@/components/ranks/RankItem';
import { useData } from '@/contexts/DataContext';
import { RANKS_DATA } from '@/lib/app-config';


export default function RanksPage() {
  const { userXP, currentRank, nextRank } = useData();

  const ranksWithStatus = RANKS_DATA.map(rank => ({
    ...rank,
    isCurrent: rank.name === currentRank.name,
    isNext: nextRank ? rank.name === nextRank.name : false,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Sistema de Rangos</h1>
        <p className="text-muted-foreground">Asciende en EXILE, desbloquea insignias y demuestra tu progreso.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ranksWithStatus.map((rank) => (
          <RankItem key={rank.name} rank={rank} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-headline font-semibold text-gradient-red mb-4">Tu Camino en EXILE</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cada rango representa un hito en tu desarrollo. Completa hábitos, acumula XP y asciende. Las insignias son un reflejo de tu compromiso y crecimiento constante. ¡Sigue adelante!
        </p>
        <p className="text-sm text-primary mt-2">XP Actual: {userXP.toLocaleString()}</p>
      </div>
    </div>
  );
}
