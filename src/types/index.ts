
import type { LucideIcon } from 'lucide-react';

export type UserStatus = 'free' | 'premium' | 'lifetime';

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
  id: string; 
  type: 'xp' | 'item' | 'attribute_boost' | 'unlock'; 
  description: string; 
  value?: number | string; 
  attributeName?: string | null; 
}

export interface EraVisualTheme {
  colorPrincipal?: string; 
  icono?: string; 
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
  tema_visual: EraVisualTheme;
  siguienteEraId?: string | null; 
  xpRequeridoParaIniciar?: number;
  isUserCreated?: boolean; 
  createdAt?: string; 
  updatedAt?: string; 
  fechaInicio?: string | null; 
  fechaFin?: string | null; 
}

export interface UserEraCustomizations {
  nombre?: string;
  descripcion?: string;
  condiciones_completado_desc?: string;
  mecanicas_especiales_desc?: string;
  xpRequeridoParaIniciar?: number;
  tema_visual?: EraVisualTheme; 
  fechaInicio?: string | null; 
  fechaFin?: string | null;
}

export interface PassiveSkill {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  cost: number; 
  category: 'General' | 'Hábitos' | 'Metas' | 'Atributos'; 
  effectDescription: string; 
}

// Theme Customization Types
export interface SimpleThemeColors {
  primary: string; // HSL string "H S% L%"
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string; // Added for better card theming
  // Sidebar
  sidebarPrimary: string;
  sidebarAccent: string;
  // Add other key variables if needed, e.g., for destructive, muted, border, input, ring
  // For now, keeping it to the most visually impactful ones.
}

export interface AppTheme {
  id: string;   // Unique ID like "cyber-blue"
  name: string; // User-facing name like "Ciber Azul"
  colors: SimpleThemeColors;
}
