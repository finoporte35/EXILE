
import RankItem, { type Rank } from '@/components/ranks/RankItem';
import { User, PersonStanding, Sparkles, Crown, Atom, HelpCircle } from 'lucide-react';

// XP del usuario actual. Esto determinará qué rango es 'isCurrent' y 'isNext'.
// Con 50 XP: NPC (0 XP) será actual, Hombre (100 XP) será el siguiente.
const currentUserXP = 50; 

const ranks: Rank[] = [
  { 
    name: "NPC", 
    xpRequired: 0, 
    description: "Iniciando el camino, el potencial es ilimitado.", 
    icon: User, 
    percentage: 60 
  },
  { 
    name: "Hombre", 
    xpRequired: 100, 
    description: "Has trascendido la existencia básica. Sigue forjando tu voluntad.", 
    icon: PersonStanding, 
    percentage: 25 
  },
  { 
    name: "SemiDios", 
    xpRequired: 1000, 
    description: "Un poder notable fluye en ti. Los mortales te admiran.", 
    icon: Sparkles, 
    percentage: 10 
  },
  { 
    name: "Dios", 
    xpRequired: 5000, 
    description: "Has alcanzado la divinidad. Tu influencia es innegable.", 
    icon: Crown, 
    percentage: 4 
  },
  { 
    name: "Un Ser", 
    xpRequired: 20000, 
    description: "Trasciendes la comprensión. Eres una fuerza de la naturaleza.", 
    icon: Atom, 
    percentage: 0.9 
  },
  { 
    name: "?????" , 
    xpRequired: 100000, 
    description: "Un misterio insondable. Tu existencia es una leyenda susurrada.", 
    icon: HelpCircle, 
    percentage: 0.1 
  },
];


const ranksWithStatus = ranks.map((rank, index, arr) => {
  let isCurrent = false;
  let isNext = false;

  if (currentUserXP >= rank.xpRequired) {
    // Es candidato a ser actual si el XP del usuario es mayor o igual al requerido
    if (index === arr.length - 1 || currentUserXP < arr[index+1].xpRequired) {
      // Es el último rango, o el XP del usuario es menor que el del siguiente rango
      isCurrent = true;
    }
  }
  
  if (!isCurrent) {
    // Si no es actual, podría ser el siguiente
    // El primer rango cuyo XP requerido sea mayor que el del usuario es el "siguiente"
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

