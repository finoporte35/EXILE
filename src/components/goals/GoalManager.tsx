
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, CalendarIcon, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/hooks/use-toast";
import GoalItem from "./GoalItem";
import { DEFAULT_GOAL_XP } from '@/lib/app-config';
import type { Goal } from '@/types';

const goalSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  measurable: z.string().min(3, "Define cómo medirás el progreso."),
  achievable: z.string().min(3, "Describe los pasos o cómo es alcanzable."),
  relevant: z.string().min(3, "Explica la relevancia de esta meta."),
  timeBound: z.date({ required_error: "La fecha límite es obligatoria." }),
  xp: z.coerce.number().min(1, "La XP debe ser al menos 1.").optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export default function GoalManager() {
  const { goals, addGoal, isLoading: isDataContextLoading, userName, currentRank } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = userName === 'emptystreet';

  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: undefined,
      xp: DEFAULT_GOAL_XP,
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const goalXp = isAdmin
        ? (data.xp || DEFAULT_GOAL_XP)
        : (DEFAULT_GOAL_XP + (currentRank.level * 10));

      const goalToAdd: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'> = {
        ...data,
        xp: goalXp,
        timeBound: data.timeBound.toISOString(),
      };
      addGoal(goalToAdd);
      toast({ title: "Meta Añadida", description: `"${data.title}" ha sido creada.` });
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la meta." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  if (isDataContextLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto bg-new-button-gradient text-primary-foreground hover:opacity-90">
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Meta S.M.A.R.T.
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Meta S.M.A.R.T.</DialogTitle>
            <DialogDescription>
              Define tu objetivo siguiendo los criterios S.M.A.R.T. para asegurar su éxito.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Título (Específico)</Label>
              <Input id="title" {...register("title")} placeholder="Ej: Aprender React en 3 meses" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Descripción (Detalle adicional)</Label>
              <Textarea id="description" {...register("description")} placeholder="Ej: Completar un curso online y construir 2 proyectos." />
            </div>
            <div>
              <Label htmlFor="measurable">Medible (¿Cómo sabrás que lo lograste?)</Label>
              <Textarea id="measurable" {...register("measurable")} placeholder="Ej: Finalizar todas las lecciones del curso y desplegar los proyectos."/>
              {errors.measurable && <p className="text-xs text-destructive mt-1">{errors.measurable.message}</p>}
            </div>
            <div>
              <Label htmlFor="achievable">Alcanzable (¿Es realista? ¿Pasos?)</Label>
              <Textarea id="achievable" {...register("achievable")} placeholder="Ej: Dedicar 1 hora diaria, seguir el plan de estudios, pedir ayuda si es necesario."/>
              {errors.achievable && <p className="text-xs text-destructive mt-1">{errors.achievable.message}</p>}
            </div>
            <div>
              <Label htmlFor="relevant">Relevante (¿Por qué es importante para ti?)</Label>
              <Textarea id="relevant" {...register("relevant")} placeholder="Ej: Mejorar mis habilidades de desarrollo frontend para nuevas oportunidades." />
              {errors.relevant && <p className="text-xs text-destructive mt-1">{errors.relevant.message}</p>}
            </div>
            <div>
              <Label htmlFor="timeBound">Tiempo Límite (Fecha Límite)</Label>
              <Controller
                name="timeBound"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.timeBound && <p className="text-xs text-destructive mt-1">{errors.timeBound.message}</p>}
            </div>
             {isAdmin && (
              <div>
                <Label htmlFor="xp">XP por Completar</Label>
                <Input id="xp" type="number" {...register("xp")} defaultValue={DEFAULT_GOAL_XP} />
                {errors.xp && <p className="text-xs text-destructive mt-1">{errors.xp.message}</p>}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : "Guardar Meta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {goals.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">Aún no has definido ninguna meta.</p>
          <p className="text-sm text-muted-foreground">¡Crea tu primera meta S.M.A.R.T. para empezar!</p>
        </div>
      )}

      {activeGoals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">Metas Activas</h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {activeGoals.map(goal => <GoalItem key={goal.id} goal={goal} />)}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold text-green-500">Metas Completadas</h2>
           <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {completedGoals.map(goal => <GoalItem key={goal.id} goal={goal} />)}
          </div>
        </section>
      )}
    </div>
  );
}
