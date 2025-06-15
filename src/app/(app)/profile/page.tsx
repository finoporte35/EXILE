
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageUp, Zap, Brain, Shield, Target, BookOpen, TrendingUp } from 'lucide-react'; // Added more icons for stats

const user = {
  name: "Usuario Desconocido",
  status: "No disponible",
  avatarFallback: "U",
  isNpc: true,
  xpForNextRank: 100,
  rankProgressPercent: 0,
  rankProgressText: "100 XP para Hombre", // As per image, "Hombre" seems like a placeholder rank name
};

const stats = [
  { name: "Motivación", value: 0, Icon: Zap },
  { name: "Energía", value: 0, Icon: Brain }, // Using Brain for Energía, can be adjusted
  { name: "Disciplina", value: 0, Icon: Shield },
  { name: "Enfoque", value: 0, Icon: Target },
  { name: "Conocimiento", value: 0, Icon: BookOpen },
  { name: "Resiliencia", value: 0, Icon: TrendingUp }, // Using TrendingUp for Resiliencia
];

const StatItem = ({ name, value, Icon }: { name: string; value: number; Icon: React.ElementType }) => (
  <div className="text-center">
    <p className="text-xs text-muted-foreground mb-1">{name}</p>
    <p className="text-4xl font-bold text-foreground mb-1">{value}</p>
    <Progress value={value} className="h-1 bg-muted" indicatorClassName="bg-primary" />
  </div>
);


export default function ProfilePage() {
  return (
    <div className="space-y-8 flex flex-col items-center min-h-full py-8">
      <h1 className="text-4xl font-headline font-bold text-gradient-red text-center">Perfil</h1>

      <Card className="w-full max-w-md bg-card shadow-xl p-6 sm:p-8 relative">
        <CardContent className="p-0">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              {/* Placeholder for actual image if available */}
              {/* <AvatarImage src="https://placehold.co/100x100.png" alt={user.name} /> */}
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{user.avatarFallback}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.status}</p>
            {user.isNpc && (
              <span className="mt-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                NPC
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
            {stats.map((stat) => (
              <StatItem key={stat.name} name={stat.name} value={stat.value} Icon={stat.Icon} />
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-muted-foreground">Progreso al Siguiente Rango</p>
              <p className="text-sm font-semibold text-primary">{user.rankProgressPercent}%</p>
            </div>
            <Progress value={user.rankProgressPercent} className="h-2 bg-muted mb-1" indicatorClassName="bg-primary" />
            <p className="text-xs text-muted-foreground text-center">{user.rankProgressText}</p>
          </div>
          
          <p className="absolute bottom-3 right-4 text-xs text-muted-foreground opacity-50">EXILE</p>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <ImageUp className="mr-2 h-4 w-4" /> Cambiar Avatar
        </Button>
      </div>
      
      <footer className="text-center text-xs text-muted-foreground mt-auto pt-8">
        EXILE MOBILE © 2025. All rights reserved. Cyber-enhanced for peak performance.
      </footer>
    </div>
  );
}

    