
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
  // Future: type (e.g., 'xp_reach', 'habit_streak', 'goal_complete'), targetValue, currentProgress
}

export interface EraReward {
  type: 'xp' | 'item' | 'attribute_boost' | 'unlock';
  description: string; 
  value?: number | string; 
  attributeName?: string; 
  // Future: itemId, attributeToBoost, etc.
}

export interface EraVisualTheme {
  colorPrincipal?: string; // Tailwind text color class e.g. "text-blue-500"
  icono?: string; // Lucide icon name e.g. "Sunrise"
}

// Represents the fundamental structure of an Era, whether predefined or user-created
export interface Era {
  id: string; 
  nombre: string; 
  descripcion: string; 
  descripcionCompletada?: string; 
  objetivos: EraObjective[]; 
  condiciones_completado_desc: string; 
  mecanicas_especiales_desc: string; 
  recompensas: EraReward[]; 
  tema_visual: EraVisualTheme;
  siguienteEraId?: string | null; 
  xpRequeridoParaIniciar?: number;
  isUserCreated?: boolean; 
  createdAt?: string; // For sorting or tracking user-created eras
  updatedAt?: string; // For tracking user-created eras updates
}

// Represents user-specific overrides for CERTAIN fields of a PREDEFINED Era.
// User-created eras are modified directly.
export interface UserEraCustomizations {
  nombre?: string;
  descripcion?: string;
  condiciones_completado_desc?: string;
  mecanicas_especiales_desc?: string;
  xpRequeridoParaIniciar?: number;
  tema_visual?: EraVisualTheme; // Allow customizing visuals of predefined eras too
  // Note: objectives and rewards structures of predefined eras are not meant to be customized by the user via this object.
  // Their textual descriptions can be part of the main 'descripcion' or other text fields if needed for narrative.
}
