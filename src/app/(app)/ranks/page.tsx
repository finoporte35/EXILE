
import RankItem, { type Rank } from '@/components/ranks/RankItem';
import { User, PersonStanding, Sparkles, Shield, Zap, Users, Brain, Crown, Atom } from 'lucide-react';

// XP del usuario actual. Leidan Elias - Level 4 - Héroe, 83 points to level up.
// Level 4 Héroe: 1,500 XP. Level 5 Superheroe: 5,000 XP.
// XP to next level = 5000 - currentUserXP = 83 => currentUserXP = 5000 - 83 = 4917
const currentUserXP = 4917; 

const ranks: Rank[] = [
  { 
    name: "Level 1 - NPC", 
    xpRequired: 0, 
    description: "El inicio de tu jornada.", 
    icon: User, 
    percentage: 86 
  },
  { 
    name: "Level 2 - Hombre", 
    xpRequired: 100, 
    description: "Desbloquea Chat con miembros.", 
    icon: PersonStanding, 
    percentage: 6 
  },
  { 
    name: "Level 3 - Hombre de alto valor", 
    xpRequired: 500, 
    description: "Demuestras valor y potencial.", 
    icon: Sparkles, 
    percentage: 3 
  },
  { 
    name: "Level 4 - Héroe", 
    xpRequired: 1500, 
    description: "Tus hazañas comienzan a ser reconocidas.", 
    icon: Shield, 
    percentage: 1 
  },
  { 
    name: "Level 5 - Superheroe", 
    xpRequired: 5000, 
    description: "Un poder extraordinario reside en ti.", 
    icon: Zap, 
    percentage: 1 
  },
  { 
    name: "Level 6 - Lider", 
    xpRequired: 15000, 
    description: "Guías a otros con tu ejemplo.", 
    icon: Users, 
    percentage: 1 
  },
  {
    name: "Level 7 - Líder experto",
    xpRequired: 30000,
    description: "Tu sabiduría y liderazgo son incomparables.",
    icon: Brain,
    percentage: 1
  },
  {
    name: "Level 8 - Rey",
    xpRequired: 60000,
    description: "Gobiernas tu dominio con autoridad.",
    icon: Crown,
    percentage: 1
  },
  {
    name: "Level 9 - Dios Griego",
    xpRequired: 100000,
    description: "Has trascendido a un plano divino.",
    icon: Atom,
    percentage: 0
  }
];


const ranksWithStatus = ranks.map((rank, index, arr) => {
  let isCurrent = false;
  let isNext = false;

  if (currentUserXP >= rank.xpRequired) {
    if (index === arr.length - 1 || currentUserXP < arr[index+1].xpRequired) {
      isCurrent = true;
    }
  }
  
  if (!isCurrent) {
    const nextRankCandidateIndex = arr.findIndex(r => currentUserXP < r.xpRequired);
    if (nextRankCandidateIndex === index) {
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
