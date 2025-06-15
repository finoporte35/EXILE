import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface Rank {
  name: string;
  xpRequired: number;
  description: string;
  icon: LucideIcon;
  percentage?: number; // Percentage of people with this rank
  isCurrent?: boolean;
  isNext?: boolean;
}

interface RankItemProps {
  rank: Rank;
}

export default function RankItem({ rank }: RankItemProps) {
  const Icon = rank.icon;
  return (
    <Card className={`shadow-lg transition-all duration-300 hover:shadow-primary/30 ${rank.isCurrent ? 'border-2 border-primary ring-2 ring-primary/50' : 'border-primary/10'} ${rank.isNext ? 'opacity-80' : ''}`}>
      <CardHeader className="items-center text-center">
        <div className={`mb-3 rounded-full p-3 w-16 h-16 flex items-center justify-center bg-gradient-to-br ${rank.isCurrent || rank.isNext ? 'from-primary to-secondary' : 'from-muted to-card'}`}>
          <Icon className={`h-8 w-8 ${rank.isCurrent || rank.isNext ? 'text-primary-foreground' : 'text-foreground'}`} />
        </div>
        <CardTitle className={`font-headline text-2xl ${rank.isCurrent || rank.isNext ? 'text-gradient-red' : 'text-foreground'}`}>{rank.name}</CardTitle>
        <CardDescription>{rank.xpRequired.toLocaleString()} XP requeridos</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-2">{rank.description}</p>
        {rank.percentage !== undefined && ( // check for undefined explicitly for 0%
          <p className="text-xs text-accent">
            Top {rank.percentage}% de jugadores
          </p>
        )}
        {rank.isCurrent && (
          <p className="mt-2 text-sm font-semibold text-primary">¡Este es tu rango actual!</p>
        )}
         {rank.isNext && !rank.isCurrent && (
          <p className="mt-2 text-sm font-semibold text-accent">¡Tu próximo desafío!</p>
        )}
      </CardContent>
    </Card>
  );
}
