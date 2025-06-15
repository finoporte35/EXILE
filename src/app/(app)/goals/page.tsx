"use client";

import GoalManager from '@/components/goals/GoalManager';
import { Target } from 'lucide-react';

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Gestor de Metas</h1>
      </div>
      <p className="text-muted-foreground ml-10">Define, sigue y alcanza tus objetivos S.M.A.R.T.</p>
      <GoalManager />
    </div>
  );
}
