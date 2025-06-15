
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageUp, TrendingUp, Zap, ShieldCheck, GitFork, Lightbulb } from 'lucide-react';

const userProfile = {
  name: "Usuario Desconocido",
  status: "No disponible",
  avatarFallback: "U",
  isNpc: true,
  xpForNextRank: 100,
  rankProgressPercent: 0,
  rankProgressText: "100 XP para Hombre",
};

// Reduced to essential stats for a cleaner look
const stats = [
  { name: "Motivación", value: 75, Icon: TrendingUp, indicatorClass: "bg-primary" },
  { name: "Energía", value: 65, Icon: Zap, indicatorClass: "bg-[hsl(var(--chart-2))]" },
  { name: "Disciplina", value: 85, Icon: ShieldCheck, indicatorClass: "bg-destructive" },
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
  const [avatarSrc, setAvatarSrc] = useState("https://placehold.co/100x100.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 flex flex-col items-center min-h-full py-8 px-4">
      <h1 className="text-4xl font-headline font-bold text-gradient-red text-center">Perfil</h1>

      <Card className="w-full max-w-md bg-card shadow-lg p-6 sm:p-8 relative border-neutral-800">
        <CardContent className="p-0">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage src={avatarSrc} alt="User Avatar" data-ai-hint="user avatar abstract" />
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

      <input 
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        ref={fileInputRef}
        style={{ display: 'none' }} 
        aria-hidden="true"
      />
      <div className="text-center mt-6">
        <Button 
          onClick={handleButtonClick}
          className="bg-new-button-gradient text-primary-foreground hover:opacity-90"
        >
          <ImageUp className="mr-2 h-4 w-4" /> Cambiar Avatar
        </Button>
      </div>
      
      <footer className="text-center text-xs text-muted-foreground mt-auto pt-8">
        EXILE MOBILE © 2025. All rights reserved. Cyber-enhanced for peak performance.
      </footer>
    </div>
  );
}
