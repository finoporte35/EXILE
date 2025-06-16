
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Attribute } from '@/types';

interface StatItemProps {
  name: string;
  value: number; 
  Icon: React.ElementType; 
}

const StatItem: React.FC<StatItemProps> = ({ name, value, Icon }) => (
  <div className="text-center">
    <p className="text-xs text-muted-foreground mb-1">{name}</p>
    <div className="flex items-center justify-center gap-1 mb-1">
      <Icon className="h-5 w-5 text-primary" />
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
    <Progress value={value} className="h-2 bg-muted" indicatorClassName="bg-primary" />
  </div>
);


export default function ProfilePage() {
  const { 
    userName, 
    userAvatar, // Get avatar from context
    updateUserAvatar, // Get update function from context
    currentRank, 
    nextRank, 
    userXP, 
    rankProgressPercent,
    attributes 
  } = useData();
    
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateUserAvatar(result); // Update avatar through context
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const rankName = currentRank.name.split(" - ")[1] || currentRank.name;
  const rankLevel = currentRank.name.split(" - ")[0];

  const xpToNextRankDisplay = nextRank 
    ? `${(nextRank.xpRequired - userXP).toLocaleString()} XP para ${nextRank.name.split(" - ")[1]}`
    : "Rango Máximo";

  const motivation = attributes.find(a => a.name === "Motivación");
  const energy = attributes.find(a => a.name === "Energía");
  const discipline = attributes.find(a => a.name === "Disciplina");

  const displayStats = [
    motivation && { name: motivation.name, value: motivation.value, Icon: motivation.icon },
    energy && { name: energy.name, value: energy.value, Icon: energy.icon },
    discipline && { name: discipline.name, value: discipline.value, Icon: discipline.icon },
  ].filter(Boolean) as { name: string; value: number; Icon: React.ElementType }[];


  return (
    <div className="space-y-8 flex flex-col items-center min-h-full py-8 px-4">
      <h1 className="text-4xl font-headline font-bold text-gradient-red text-center">Perfil</h1>

      <Card className="w-full max-w-md bg-card shadow-lg p-6 sm:p-8 relative border-neutral-800">
        <CardContent className="p-0">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="user avatar abstract" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
            <p className="text-xs text-muted-foreground">{rankLevel}</p>
            
            <span className="mt-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {rankName}
            </span>
            
          </div>

          {displayStats.length > 0 && (
            <div className="grid grid-cols-3 gap-x-4 gap-y-6 mb-8">
              {displayStats.map((stat) => (
                <StatItem key={stat.name} name={stat.name} value={stat.value} Icon={stat.Icon} />
              ))}
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-muted-foreground">Progreso al Siguiente Rango</p>
              <p className="text-sm font-semibold text-primary">{Math.round(rankProgressPercent)}%</p>
            </div>
            <Progress 
              value={rankProgressPercent} 
              className="h-2 bg-muted mb-1" 
              indicatorClassName="bg-main-gradient"
            />
            <p className="text-xs text-muted-foreground text-center">{xpToNextRankDisplay}</p>
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
