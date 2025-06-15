
"use client";

import type { Goal } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Target, Scaling, ListChecks, Focus, CalendarClock, Star, Trash2, Info, AlertTriangle } from "lucide-react";
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

interface GoalItemProps {
  goal: Goal;
}

const DetailRow: React.FC<{ icon: React.ElementType, label: string, value: string | undefined, valueClassName?: string }> = ({ icon: Icon, label, value, valueClassName }) => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
    <div>
      <span className="font-medium text-foreground">{label}:</span>
      <p className={cn("text-muted-foreground leading-snug", valueClassName)}>{value || "No especificado"}</p>
    </div>
  </div>
);

export default function GoalItem({ goal }: GoalItemProps) {
  const { toggleGoalCompletion, deleteGoal } = useData();
  const { toast } = useToast();

  const handleToggle = () => {
    toggleGoalCompletion(goal.id);
    toast({
      title: goal.isCompleted ? "Meta Desmarcada" : "¡Meta Completada!",
      description: `Has ${goal.isCompleted ? 'desmarcado' : 'completado'} la meta "${goal.title}". ${!goal.isCompleted ? `¡+${goal.xp} XP!` : ''}`,
    });
  };

  const handleDelete = () => {
    deleteGoal(goal.id);
    toast({
      title: "Meta Eliminada",
      description: `La meta "${goal.title}" ha sido eliminada.`,
      variant: "destructive"
    });
  };

  const deadline = parseISO(goal.timeBound);
  const daysRemaining = differenceInDays(deadline, new Date());
  const isOverdue = !goal.isCompleted && isPast(deadline);

  let timeBadgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
  let timeBadgeText = `${format(deadline, "PPP", { locale: es })}`;

  if (goal.isCompleted) {
    timeBadgeVariant = "default"; // Using Tailwind's 'green' directly for completed
    timeBadgeText = `Completada - ${format(deadline, "PPP", { locale: es })}`;
  } else if (isOverdue) {
    timeBadgeVariant = "destructive";
    timeBadgeText = `Vencida - ${format(deadline, "PPP", { locale: es })} (${Math.abs(daysRemaining)} días de retraso)`;
  } else if (daysRemaining < 0) { // Should be caught by isOverdue, but as a fallback
     timeBadgeVariant = "destructive";
     timeBadgeText = `Vencida - ${format(deadline, "PPP", { locale: es })}`;
  } else if (daysRemaining <= 3) {
    timeBadgeVariant = "destructive"; // Using Tailwind's 'yellow' for urgency
    timeBadgeText = `Vence en ${daysRemaining} días - ${format(deadline, "PPP", { locale: es })}`;
  } else if (daysRemaining <=7) {
     timeBadgeVariant = "default"; // Using Tailwind's 'blue' as secondary
     timeBadgeText = `Vence en ${daysRemaining} días - ${format(deadline, "PPP", { locale: es })}`;
  }


  return (
    <Card className={cn("shadow-md border-neutral-800 flex flex-col h-full", goal.isCompleted ? "bg-green-600/10 border-green-500/30" : "bg-card")}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className={cn("text-xl font-semibold leading-tight", goal.isCompleted ? "text-green-400 line-through" : "text-primary")}>{goal.title}</CardTitle>
          <Checkbox
            checked={goal.isCompleted}
            onCheckedChange={handleToggle}
            className={cn("ml-4 flex-shrink-0", goal.isCompleted ? "border-green-500 data-[state=checked]:bg-green-600" : "border-primary")}
            aria-label={`Marcar como ${goal.isCompleted ? 'incompleta' : 'completa'}`}
          />
        </div>
        {goal.description && <CardDescription className={cn(goal.isCompleted ? "text-muted-foreground/70" : "text-muted-foreground")}>{goal.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <DetailRow icon={Scaling} label="Medible" value={goal.measurable} />
        <DetailRow icon={ListChecks} label="Alcanzable" value={goal.achievable} />
        <DetailRow icon={Focus} label="Relevante" value={goal.relevant} />
      </CardContent>
      <CardFooter className="flex-col items-start space-y-3 pt-4 border-t border-neutral-700/50">
        <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
                <CalendarClock className={cn("h-4 w-4", isOverdue && !goal.isCompleted ? "text-red-500" : "text-muted-foreground")} />
                <Badge variant={timeBadgeVariant} className={cn(
                    {"bg-green-500/20 text-green-300 border-green-500/30": goal.isCompleted},
                    {"bg-red-500/20 text-red-300 border-red-500/30": timeBadgeVariant === "destructive" && !goal.isCompleted},
                    // Add other badge color conditions if needed
                )}>
                    {timeBadgeText}
                </Badge>
            </div>
             <div className="flex items-center gap-1 text-yellow-400" title={`${goal.xp} XP al completar`}>
                <Star className="h-4 w-4"/>
                <span className="text-sm font-medium">{goal.xp} XP</span>
            </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full mt-2 opacity-70 hover:opacity-100">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Meta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta meta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La meta "{goal.title}" será eliminada permanentemente.
                Si la meta estaba completada, el XP ganado <span className="font-semibold">no</span> se deducirá.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Sí, eliminar meta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
