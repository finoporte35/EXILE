
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, Send, Crown } from 'lucide-react';
import { useData, EraIconMapper } from '@/contexts/DataContext';
import type { Attribute, Era } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AttributeRatingItemProps {
  label: string;
  value: number;
  progressColorClass?: string;
}

const AttributeRatingItem: React.FC<AttributeRatingItemProps> = ({ label, value, progressColorClass = "bg-primary" }) => (
  <div className="flex flex-col items-start">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-4xl font-bold text-foreground my-1">{value}</p>
    <Progress
      value={value}
      className="h-2 w-full bg-neutral-700"
      indicatorClassName={cn(progressColorClass)}
    />
  </div>
);

export default function ProfilePage() {
  const {
    userName,
    userAvatar,
    updateUserAvatar,
    currentRank,
    attributes,
    completedEras,
    isPremium
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateUserAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const displayAttributes = attributes.slice(0, 6);

  const mostRecentCompletedEra = completedEras.length > 0 ? completedEras[completedEras.length - 1] : null;

  return (
    <div className="flex flex-col items-center justify-start min-h-full py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gradient-red mb-4">Perfil</h1>

      <Card className="relative w-full max-w-lg bg-card shadow-neon-red-card rounded-3xl p-6 border-2 border-primary/40">
        <div className="relative flex justify-center mb-4">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="user portrait" />
            <AvatarFallback className="text-5xl bg-neutral-800 text-neutral-400">{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="p-0 mt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
            {displayAttributes.map((attr) => (
              <AttributeRatingItem
                key={attr.name}
                label={attr.name}
                value={attr.value}
              />
            ))}
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-medium text-primary uppercase tracking-widest flex items-center justify-center gap-2">
              {currentRank.name.split(" - ")[1] || currentRank.name}
              {isPremium && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Crown className="h-5 w-5 text-yellow-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cuenta Premium</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </p>
            {mostRecentCompletedEra && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-2 inline-block cursor-default">
                      <EraIconMapper
                        iconName={mostRecentCompletedEra.tema_visual.icono}
                        className={cn("h-6 w-6", mostRecentCompletedEra.tema_visual.colorPrincipal || "text-muted-foreground")}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Última Era Completada: {mostRecentCompletedEra.nombre}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>

        <div className="absolute bottom-4 right-6 pointer-events-none">
          <p className="text-2xl font-headline font-bold text-primary opacity-20 select-none">
            EXILE
          </p>
        </div>
      </Card>

      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <div className="w-full max-w-lg flex mt-2">
        <Button
          onClick={handleUploadButtonClick}
          variant="outline"
          className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary h-12 rounded-xl text-base"
        >
          <Download className="mr-2 h-5 w-5" /> Cambiar Avatar
        </Button>
      </div>

      <footer className="text-center text-xs text-muted-foreground mt-auto pt-8">
        EXILE MOBILE © 2025. All rights reserved. Cyber-enhanced for peak performance.
      </footer>
    </div>
  );
}
