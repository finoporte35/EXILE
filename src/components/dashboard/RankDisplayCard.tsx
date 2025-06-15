"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

// Mock data
const userRank = "Aprendiz";
const userXP = 1250;
const nextRankXP = 2000;
const rankIcon = Star; 

export default function RankDisplayCard() {
  const xpPercentage = (userXP / nextRankXP) * 100;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(xpPercentage), 100); // Animate on mount
    return () => clearTimeout(timer);
  }, [xpPercentage]);

  return (
    <Card className="shadow-lg_ border-primary/10_">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-gradient-red">Tu Rango Actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <rankIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">{userRank}</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">XP Actual</p>
            <p className="font-bold text-lg text-primary">{userXP.toLocaleString()} / {nextRankXP.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progreso al siguiente rango</span>
            <span>{Math.round(xpPercentage)}%</span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" aria-label={`Progreso al siguiente rango: ${Math.round(xpPercentage)}%`} />
        </div>
        <p className="text-xs text-center text-muted-foreground">Sigue esforzándote para alcanzar el rango de <span className="font-semibold text-accent">Adepto</span>!</p>
      </CardContent>
    </Card>
  );
}
