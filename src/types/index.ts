
import type { LucideIcon } from 'lucide-react';

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  xp: number;
  streak: number;
  category: string;
  lastCompletedDate?: string | null; 
  createdAt: string; 
}

export interface Attribute {
  name: string;
  icon: LucideIcon;
  description: string;
  currentLevel: string; 
  xpInArea: string;     
  value: number;        
  comingSoonText: string;
}

export interface Goal {
  id: string;
  title: string; 
  description?: string; 
  measurable: string; 
  achievable: string; 
  relevant: string; 
  timeBound: string; 
  isCompleted: boolean;
  createdAt: string; 
  xp: number;
}

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepLog {
  id: string;
  date: string; 
  timeToBed: string; 
  timeWokeUp: string; 
  sleepDurationHours: number; 
  quality: SleepQuality;
  notes?: string;
  createdAt: string; 
}


export interface EraObjective {
  id: string;
  description: string;
  
}

export interface EraReward {
  type: 'xp' | 'item' | 'attribute_boost' | 'unlock';
  description: string; 
  value?: number | string; 
  attributeName?: string; 
}

export interface Era {
  id: string; 
  nombre: string; 
  descripcion: string; 
  descripcionCompletada?: string; 
  objetivos: EraObjective[]; 
  condiciones_completado_desc: string; 
  mecanicas_especiales_desc: string; 
  recompensas: EraReward[]; 
  tema_visual: { 
    colorPrincipal?: string; 
    icono?: LucideIcon; 
  };
  siguienteEraId?: string | null; 
  xpRequeridoParaIniciar?: number; 
}

export interface UserEraCustomizations {
  nombre?: string;
  descripcion?: string;
  condiciones_completado_desc?: string;
  mecanicas_especiales_desc?: string;
  xpRequeridoParaIniciar?: number;
}
