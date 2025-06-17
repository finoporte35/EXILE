
import type { Rank } from '@/components/ranks/RankItem';
import type { Attribute, Goal, SleepLog, PassiveSkill } from '@/types';
import { User, PersonStanding, Sparkles, Shield, Zap, Users, Brain, Crown, Atom, TrendingUp, Activity, GitFork, Lightbulb, BookOpen, ShieldCheck, Target, Unlock, Puzzle, ZapIcon, BrainIcon, TargetIcon, ActivityIcon } from 'lucide-react';

export const DEFAULT_USERNAME = "Explorador";
export const INITIAL_XP = 0;
export const MOCK_USER_ID = "default-exile-user"; // Note: MOCK_USER_ID is largely deprecated by Firebase Auth

export const RANKS_DATA: Rank[] = [
  { name: "Level 1 - NPC", xpRequired: 0, description: "El inicio de tu jornada.", icon: User, percentage: 86 },
  { name: "Level 2 - Hombre", xpRequired: 100, description: "Desbloquea Chat con miembros.", icon: PersonStanding, percentage: 6 },
  { name: "Level 3 - Hombre de alto valor", xpRequired: 500, description: "Demuestras valor y potencial.", icon: Sparkles, percentage: 3 },
  { name: "Level 4 - Héroe", xpRequired: 1500, description: "Tus hazañas comienzan a ser reconocidas.", icon: Shield, percentage: 1 },
  { name: "Level 5 - Superheroe", xpRequired: 5000, description: "Un poder extraordinario reside en ti.", icon: Zap, percentage: 1 },
  { name: "Level 6 - Lider", xpRequired: 15000, description: "Guías a otros con tu ejemplo.", icon: Users, percentage: 1 },
  { name: "Level 7 - Líder experto", xpRequired: 30000, description: "Tu sabiduría y liderazgo son incomparables.", icon: Brain, percentage: 1 },
  { name: "Level 8 - Rey", xpRequired: 60000, description: "Gobiernas tu dominio con autoridad.", icon: Crown, percentage: 1 },
  { name: "Level 9 - Dios Griego", xpRequired: 100000, description: "Has trascendido a un plano divino.", icon: Atom, percentage: 0 }
];

export const INITIAL_ATTRIBUTES: Attribute[] = [
  { name: "Motivación", icon: TrendingUp, description: "Impulso interno y externo para actuar y alcanzar metas.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Energía", icon: Zap, description: "Nivel de vitalidad física y mental para afrontar el día.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Disciplina", icon: ShieldCheck, description: "Capacidad de autocontrol y constancia en hábitos y tareas.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Enfoque", icon: Target, description: "Habilidad para concentrarse en una tarea sin distracciones.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Resiliencia", icon: Activity, description: "Capacidad para superar adversidades y adaptarse al cambio.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Adaptabilidad", icon: GitFork, description: "Flexibilidad para ajustarse a nuevas situaciones o entornos.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Estrategia", icon: Lightbulb, description: "Habilidad para planificar y tomar decisiones efectivas.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." },
  { name: "Conocimiento", icon: BookOpen, description: "Adquisición y aplicación de información y habilidades.", currentLevel: "0/100", xpInArea: "0/1000", value: 0, comingSoonText: "Herramientas y estrategias próximamente." }
];

export const HABIT_CATEGORIES = ["Salud Física", "Desarrollo Mental", "Productividad", "Bienestar Emocional", "Relaciones Sociales", "Crecimiento Espiritual"];

export const HABIT_CATEGORY_XP_MAP: Record<string, number> = {
  'Salud Física': 20,
  'Desarrollo Mental': 15,
  'Productividad': 10,
  'Bienestar Emocional': 15,
  'Relaciones Sociales': 10,
  'Crecimiento Espiritual': 20,
};
export const DEFAULT_HABIT_XP = 5;

export const INITIAL_GOALS: Goal[] = [];
export const DEFAULT_GOAL_XP = 50;

export const INITIAL_SLEEP_LOGS: SleepLog[] = [];


export const PASSIVE_SKILLS_DATA: PassiveSkill[] = [
  {
    id: "ps001",
    name: "Impulso de XP General",
    description: "Aumenta permanentemente toda la XP ganada.",
    icon: ZapIcon,
    cost: 500,
    category: "General",
    effectDescription: "+5% a toda la XP ganada (Efecto no funcional aún).",
  },
  {
    id: "ps002",
    name: "Maestro de Hábitos",
    description: "Gana más XP al completar hábitos.",
    icon: BrainIcon,
    cost: 300,
    category: "Hábitos",
    effectDescription: "+10% XP de hábitos (Efecto no funcional aún).",
  },
  {
    id: "ps003",
    name: "Cazador de Metas",
    description: "Recibe un bono de XP al completar metas.",
    icon: TargetIcon,
    cost: 400,
    category: "Metas",
    effectDescription: "+15% XP de metas completadas (Efecto no funcional aún).",
  },
  {
    id: "ps004",
    name: "Fortaleza de Atributo",
    description: "Mejora la ganancia base de un atributo específico (elegir al desbloquear).",
    icon: ActivityIcon,
    cost: 750,
    category: "Atributos",
    effectDescription: "Bonificación a la velocidad de mejora de un atributo (Efecto no funcional aún).",
  },
];

// Removed ALL_PREDEFINED_ERAS_DATA from here, it's in eras-config.ts
