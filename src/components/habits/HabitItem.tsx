"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Flame, Zap, CalendarDays, TrendingUp } from "lucide-react";
import type { Habit } from './HabitTracker';
import { cn } from "@/lib/utils";

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void; // Optional delete functionality
}

export default function HabitItem({ habit, onToggle, onDelete }: HabitItemProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
      habit.completed ? "bg-green-500/10 border-green-500/30" : "bg-card border-card hover:border-primary/50",
      "hover:shadow-md"
    )}>
      <div className="flex items-center gap-3">
        <Checkbox
          id={`habit-${habit.id}`}
          checked={habit.completed}
          onCheckedChange={() => onToggle(habit.id)}
          aria-labelledby={`habit-label-${habit.id}`}
          className={cn(habit.completed ? "border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:text-primary-foreground" : "border-primary")}
        />
        <div>
          <label htmlFor={`habit-${habit.id}`} id={`habit-label-${habit.id}`} className={cn("font-medium text-base cursor-pointer", habit.completed ? "line-through text-muted-foreground" : "text-foreground")}>
            {habit.name}
          </label>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1" title="XP por completar">
              <Zap className="h-3 w-3 text-yellow-500" /> {habit.xp} XP
            </span>
            <span className="flex items-center gap-1" title="Racha actual">
              <Flame className="h-3 w-3 text-orange-500" /> {habit.streak} días
            </span>
            <span className="flex items-center gap-1" title="Categoría">
              <CalendarDays className="h-3 w-3 text-blue-500" /> {habit.category}
            </span>
          </div>
        </div>
      </div>
      {/* Future: Could add an edit/delete button here */}
      {/* {onDelete && (
        <Button variant="ghost" size="icon" onClick={() => onDelete(habit.id)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="h-4 w-4" />
        </Button>
      )} */}
    </div>
  );
}
