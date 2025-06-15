
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageUp, TrendingUp, Zap, ShieldCheck, Target, BookOpen, Activity } from 'lucide-react';

const userProfile = {
  name: "Usuario Desconocido",
  status: "No disponible",
  avatarFallback: "U",
  isNpc: true,
  xpForNextRank: 100,
  rankProgressPercent: 0,
  rankProgressText: "100 XP para Hombre",
};

const stats = [
  { name: "Motivación", value: 70, Icon: TrendingUp, indicatorClass: "bg-gradient-to-r from-red-500 via-red-600 to-red-700" },
  { name: "Energía", value: 60, Icon: Zap, indicatorClass: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" },
  { name: "Disciplina", value: 80, Icon: ShieldCheck, indicatorClass: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" },
  { name: "Enfoque", value: 75, Icon: Target, indicatorClass: "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700" },
  { name: "Conocimiento", value: 65, Icon: BookOpen, indicatorClass: "bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" },
  { name: "Resiliencia", value: 85, Icon: Activity, indicatorClass: "bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" },
];


interface StatItemProps {
  name: string;
  value: number;
  Icon: React.ElementType;
  indicatorClass: string;
}

const StatItem: React.FC<StatItemProps> = ({ name, value, Icon, indicatorClass }) => (
  <div className="text-center">
    <p className="text-xs text-muted-foreground mb-1">{name}</p>
    <p className="text-4xl font-bold text-foreground mb-1">{value}</p>
    <Progress value={value} className="h-2 bg-muted" indicatorClassName={indicatorClass} />
  </div>
);


export default function ProfilePage() {
  return (
    <div className="space-y-8 flex flex-col items-center min-h-full py-8 px-4">
      <h1 className="text-4xl font-headline font-bold text-gradient-red text-center">Perfil</h1>

      <Card className="w-full max-w-md bg-card shadow-xl p-6 sm:p-8 relative border-neutral-800">
        <CardContent className="p-0">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar abstract" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{userProfile.avatarFallback}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-foreground">{userProfile.name}</h2>
            <p className="text-xs text-muted-foreground">{userProfile.status}</p>
            {userProfile.isNpc && (
              <span className="mt-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                NPC
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-6 mb-8">
            {stats.map((stat) => (
              <StatItem key={stat.name} name={stat.name} value={stat.value} Icon={stat.Icon} indicatorClass={stat.indicatorClass} />
            ))}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-muted-foreground">Progreso al Siguiente Rango</p>
              <p className="text-sm font-semibold text-primary">{userProfile.rankProgressPercent}%</p>
            </div>
            <Progress 
              value={userProfile.rankProgressPercent} 
              className="h-2 bg-muted mb-1" 
              indicatorClassName="bg-main-gradient"
            />
            <p className="text-xs text-muted-foreground text-center">{userProfile.rankProgressText}</p>
          </div>
          
          <p className="absolute bottom-3 right-4 text-xs text-muted-foreground opacity-50">EXILE</p>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Button className="bg-new-button-gradient text-primary-foreground hover:opacity-90">
          <ImageUp className="mr-2 h-4 w-4" /> Cambiar Avatar
        </Button>
      </div>
      
      <footer className="text-center text-xs text-muted-foreground mt-auto pt-8">
        EXILE MOBILE © 2025. All rights reserved. Cyber-enhanced for peak performance.
      </footer>
    </div>
  );
}
