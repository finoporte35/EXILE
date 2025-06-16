
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Flame, Zap, CalendarDays, Trash2 } from "lucide-react";
import type { Habit } from '@/types'; 
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

export default function HabitItem({ habit, onToggle }: HabitItemProps) {
  const { deleteHabit } = useData();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteHabit(habit.id);
    toast({
      title: "Hábito Eliminado",
      description: `El hábito "${habit.name}" ha sido eliminado.`,
      variant: "destructive"
    });
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
      habit.completed ? "bg-green-500/10 border-green-500/30" : "bg-card border-card hover:border-primary/50",
      "hover:shadow-md"
    )}>
      <div className="flex items-center gap-3 flex-grow">
        <Checkbox
          id={`habit-${habit.id}`}
          checked={habit.completed}
          onCheckedChange={() => onToggle(habit.id)}
          aria-labelledby={`habit-label-${habit.id}`}
          className={cn(habit.completed ? "border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:text-primary-foreground" : "border-primary")}
        />
        <div className="flex-grow">
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 ml-2">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar hábito</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este hábito?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El hábito "{habit.name}" será eliminado permanentemente.
              Si el hábito estaba completado y había otorgado XP, ese XP se deducirá de tu total.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar hábito
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
