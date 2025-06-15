"use client";

import SleepLogManager from '@/components/sleep/SleepLogManager';
import { BedDouble } from 'lucide-react';

export default function SleepPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-1">
        <BedDouble className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Registro de Sueño</h1>
      </div>
      <p className="text-muted-foreground ml-10">Monitoriza tus patrones de sueño para optimizar tu descanso y energía.</p>
      <SleepLogManager />
    </div>
  );
}
