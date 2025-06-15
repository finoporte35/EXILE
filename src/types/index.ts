
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
  achievable: string; // Steps to make it achievable
  relevant: string; // Why is this goal important?
  timeBound: string; // ISO date string for deadline
  isCompleted: boolean;
  createdAt: string; // ISO Date string
  xp: number;
}
