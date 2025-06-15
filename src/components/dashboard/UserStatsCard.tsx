"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Brain, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, icon: Icon, colorClass }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 100); // Animate on mount
    return () => clearTimeout(timer);
  }, [value]);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          {label}
        </span>
        <span className={`font-semibold ${colorClass}`}>{value}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-secondary" 
        indicatorClassName="bg-main-gradient"
        aria-label={`${label} ${value}%`} 
      />
    </div>
  );
};

export default function UserStatsCard() {
  // Mock data, will be connected to habit system later
  const stats = [
    { label: "Energía", value: 75, icon: Zap, colorClass: "text-primary" }, // colorClass for icon and text
    { label: "Motivación", value: 60, icon: Brain, colorClass: "text-accent" },
    { label: "Disciplina", value: 85, icon: Shield, colorClass: "text-secondary" }, // Mapped to --secondary in CSS which is very dark; consider adjusting if too dark for text.
  ];

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-gradient-red">Estadísticas de Personaje</CardTitle>
        <CardDescription>Tu progreso actual en EXILE.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <StatBar key={stat.label} {...stat} />
        ))}
      </CardContent>
    </Card>
  );
}
