import RankItem, { type Rank } from '@/components/ranks/RankItem';
import { Award, ShieldCheck, Star, Gem, Crown, Zap, TrendingUp, Medal } from 'lucide-react';

const ranks: Rank[] = [
  { name: "Neófito", xpRequired: 0, description: "El inicio de tu viaje. Cada leyenda comienza aquí.", icon: Award, percentage: 50, isCurrent: true },
  { name: "Aprendiz", xpRequired: 1000, description: "Has demostrado dedicación. Sigue aprendiendo y creciendo.", icon: Star, percentage: 35, isNext: true },
  { name: "Adepto", xpRequired: 5000, description: "Tus habilidades son notables. La maestría está a tu alcance.", icon: Gem, percentage: 20 },
  { name: "Experto", xpRequired: 15000, description: "Dominas tus hábitos y buscas la excelencia continua.", icon: Medal, percentage: 10 },
  { name: "Maestro", xpRequired: 50000, description: "Has alcanzado un alto nivel de desarrollo personal.", icon: Crown, percentage: 5 },
  { name: "Leyenda", xpRequired: 100000, description: "Tu disciplina es una inspiración. Eres una leyenda en EXILE.", icon: Zap, percentage: 1 },
];

// TODO: Fetch user's current XP and determine current/next rank dynamically
const currentUserXP = 0; // Example, fetch this from user data

const ranksWithStatus = ranks.map((rank, index) => {
  let isCurrent = false;
  let isNext = false;

  if (currentUserXP >= rank.xpRequired) {
    if (index === ranks.length - 1 || currentUserXP < ranks[index+1].xpRequired) {
      isCurrent = true;
    }
  }
  if (!isCurrent) {
    // Find first rank that user hasn't achieved yet
    const nextRankIndex = ranks.findIndex(r => currentUserXP < r.xpRequired);
    if (nextRankIndex === index) {
      isNext = true;
    }
  }
  
  return { ...rank, isCurrent, isNext };
});


export default function RanksPage() {
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
      </div>
    </div>
  );
}
