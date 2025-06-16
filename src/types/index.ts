
import type { LucideIcon } from 'lucide-react';

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  xp: number;
  streak: number;
  category: string;
  lastCompletedDate?: string | null; // YYYY-MM-DD or null
  createdAt: string; // ISO Date string
}

export interface Attribute {
  name: string;
  icon: LucideIcon;
  description: string;
  currentLevel: string; 
  xpInArea: string;     
  value: number;        // Core value (0-100) for radar charts and stats
  comingSoonText: string;
}

export interface Goal {
  id: string;
  title: string; // Specific
  description?: string; // Further detail for Specific
  measurable: string; // How will progress be measured?
  achievable: string; // Steps to make it attainable
  relevant: string; // Why is this goal important?
  timeBound: string; // ISO date string for deadline
  isCompleted: boolean;
  createdAt: string; // ISO Date string
  xp: number;
}

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepLog {
  id: string;
  date: string; // ISO string for the date the sleep period began
  timeToBed: string; // HH:mm format
  timeWokeUp: string; // HH:mm format
  sleepDurationHours: number; // Calculated duration in hours
  quality: SleepQuality;
  notes?: string;
  createdAt: string; // ISO string for when the log was created
}

// ERAS System Types
export interface EraObjective {
  id: string;
  description: string;
  // Future: type: 'habit' | 'goal' | 'action', targetId?: string, requiredCompletions?: number
}

export interface EraReward {
  type: 'xp' | 'item' | 'attribute_boost' | 'unlock';
  description: string; // e.g., "+500 XP", "Unlock 'Meditator's Cloak'", "Focus +5"
  value?: number | string; // For XP amount or item ID
  attributeName?: string; // For attribute boosts
}

export interface Era {
  id: string; // e.g., "era_0_awakening"
  nombre: string; // e.g., "El Despertar del Iniciado"
  descripcion: string; // Narrative intro to the Era
  descripcionCompletada?: string; // Narrative text for when the era is completed
  objetivos: EraObjective[]; // List of objectives to complete this Era
  condiciones_completado_desc: string; // Textual description of completion
  mecanicas_especiales_desc: string; // Textual description of special rules
  recompensas: EraReward[]; // Rewards upon completion
  tema_visual: { // Basic theming
    colorPrincipal?: string; // e.g., 'bg-blue-700', 'text-blue-300'
    icono?: LucideIcon; // Icon representing the Era
  };
  siguienteEraId?: string | null; // ID of the next Era, null if it's the last or branches
  xpRequeridoParaIniciar?: number; // XP needed before this era can be started (optional)
}
