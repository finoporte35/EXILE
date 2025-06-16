
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
  tema_visual: { 
    colorPrincipal?: string; 
    // Store icon name as string for Firestore compatibility with user-created eras
    // The actual LucideIcon component will be mapped during rendering
    icono?: string; // e.g., "Sunrise", "Zap"
  };
  siguienteEraId?: string | null; 
  xpRequeridoParaIniciar?: number;
  // For user-created eras, we might add a flag or check presence in userCreatedEras list
  isUserCreated?: boolean; 
  createdAt?: string; // For sorting or tracking user-created eras
}

// Represents user-specific overrides for certain fields of an Era (predefined or user-created)
export interface UserEraCustomizations {
  nombre?: string;
  descripcion?: string;
  condiciones_completado_desc?: string;
  mecanicas_especiales_desc?: string;
  xpRequeridoParaIniciar?: number;
  // Note: objectives, rewards, tema_visual (icon/color mapping for user eras is part of base Era),
  // and siguienteEraId are not part of simple customization here.
  // For user-created eras, estos campos (nombre, desc, etc) son su base.
  // Esta interfaz es más para sobrescribir ERAS PREDEFINIDAS.
  // Para ERAS CREADAS por el usuario, estos campos se editan directamente en el documento de la Era.
}
