import type { LucideIcon } from 'lucide-react';

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  xp: number;
  streak: number;
  category: string;
}

export interface Attribute {
  name: string;
  icon: LucideIcon;
  description: string;
  currentLevel: string; // Display purposes, can be derived or static for now
  xpInArea: string;     // Display purposes, can be derived or static for now
  value: number;        // Core value (0-100) for radar charts and stats
  comingSoonText: string;
}

// Keep Rank type definition in RankItem and import where needed or move here if widely used outside ranks component
// For now, RankItem.tsx exports it.
