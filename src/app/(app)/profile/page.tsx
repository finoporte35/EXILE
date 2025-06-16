
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageUp, Send, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Attribute } from '@/types';
import { cn } from '@/lib/utils';

interface AttributeRatingItemProps {
  label: string;
  value: number;
  progressColorClass?: string; // e.g., "bg-green-500", "bg-orange-500"
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
    attributes 
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

  // Select the first 6 attributes for display, or fewer if not available
  const displayAttributes = attributes.slice(0, 6);

  // Placeholder for share functionality
  const handleShare = () => {
    // Implement share functionality (e.g., copy link, use Web Share API)
    console.log("Share button clicked");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Perfil</h1>

      <Card className="w-full max-w-sm bg-neutral-900 shadow-xl rounded-3xl p-6 border-2 border-neutral-800">
        <div className="relative flex justify-center mb-2">
          <Avatar className="h-32 w-32 border-4 border-neutral-700">
            <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="user portrait" />
            <AvatarFallback className="text-5xl bg-neutral-800 text-neutral-400">{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="p-0 mt-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
            {displayAttributes.map((attr) => (
              <AttributeRatingItem 
                key={attr.name} 
                label={attr.name} 
                value={attr.value}
                // Example of conditional coloring if needed later:
                // progressColorClass={attr.name === "Potential" ? "bg-green-500" : "bg-primary"}
              />
            ))}
          </div>
          
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
            {currentRank.name.split(" - ")[1] || currentRank.name}
          </p>
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

      <div className="w-full max-w-sm flex gap-4 mt-2">
        <Button 
          onClick={handleUploadButtonClick}
          variant="outline"
          className="flex-1 bg-neutral-800 border-neutral-700 text-foreground hover:bg-neutral-700 h-12 rounded-xl text-base"
        >
          <Download className="mr-2 h-5 w-5" /> Cambiar Avatar
        </Button>
        <Button 
          onClick={handleShare}
          className="flex-1 bg-neutral-50 text-neutral-900 hover:bg-neutral-200 h-12 rounded-xl text-base"
        >
          <Send className="mr-2 h-5 w-5" /> Compartir
        </Button>
      </div>
      
      <footer className="text-center text-xs text-muted-foreground mt-auto pt-8">
        EXILE MOBILE © 2025. All rights reserved. Cyber-enhanced for peak performance.
      </footer>
    </div>
  );
}
