
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, CalendarIcon, Loader2, BedDouble, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse, isValid } from "date-fns";
import { es } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/hooks/use-toast";
import SleepLogItem from "./SleepLogItem";
import type { SleepQuality, SleepLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';


const sleepQualityOptions: { value: SleepQuality; label: string }[] = [
  { value: "excellent", label: "Excelente" },
  { value: "good", label: "Bueno" },
  { value: "fair", label: "Regular" },
  { value: "poor", label: "Pobre" },
];

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm format

const sleepLogSchema = z.object({
  date: z.date({ required_error: "La fecha es obligatoria." }),
  timeToBed: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)."),
  timeWokeUp: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)."),
  quality: z.enum(["poor", "fair", "good", "excellent"], { required_error: "La calidad del sueño es obligatoria." }),
  notes: z.string().optional(),
}).refine(data => {
  // Basic check: timeWokeUp should not be identical to timeToBed on the same day, unless it's a 24h sleep (unlikely for this app)
  // More complex duration validation (e.g. max 24h) can be added if needed
  const bed = parse(data.timeToBed, "HH:mm", data.date);
  const woke = parse(data.timeWokeUp, "HH:mm", data.date);
  return bed.getTime() !== woke.getTime() || (woke.getTime() < bed.getTime()); // Allow woke < bed for crossing midnight
}, {
  message: "La hora de levantarse no puede ser igual a la hora de acostarse en el mismo día sin cruzar la medianoche.",
  path: ["timeWokeUp"],
});


type SleepLogFormData = z.infer<typeof sleepLogSchema>;

export default function SleepLogManager() {
  const { sleepLogs, addSleepLog, deleteSleepLog, isLoading: isDataContextLoading } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<SleepLogFormData>({
    resolver: zodResolver(sleepLogSchema),
    defaultValues: {
      date: new Date(),
      timeToBed: "22:00",
      timeWokeUp: "06:00",
      quality: "good",
      notes: "",
    },
  });

  const onSubmit = async (data: SleepLogFormData) => {
    setIsSubmitting(true);
    try {
      addSleepLog({
        date: data.date,
        timeToBed: data.timeToBed,
        timeWokeUp: data.timeWokeUp,
        quality: data.quality as SleepQuality,
        notes: data.notes,
      });
      toast({ title: "Registro de Sueño Añadido", description: "Tu entrada de sueño ha sido guardada." });
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding sleep log:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el registro de sueño." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteLog = (id: string) => {
    deleteSleepLog(id);
    toast({ title: "Registro Eliminado", description: "La entrada de sueño ha sido eliminada.", variant: "destructive" });
  };


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
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Registro de Sueño
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Sueño</DialogTitle>
            <DialogDescription>
              Añade los detalles de tu último periodo de sueño.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Fecha (Día que te fuiste a dormir)</Label>
              <Controller
                name="date"
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
                        disabled={(date) => date > new Date()} // Disable future dates
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeToBed">Hora de Acostarse</Label>
                <Input id="timeToBed" type="time" {...register("timeToBed")} />
                {errors.timeToBed && <p className="text-xs text-destructive mt-1">{errors.timeToBed.message}</p>}
              </div>
              <div>
                <Label htmlFor="timeWokeUp">Hora de Levantarse</Label>
                <Input id="timeWokeUp" type="time" {...register("timeWokeUp")} />
                {errors.timeWokeUp && <p className="text-xs text-destructive mt-1">{errors.timeWokeUp.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="quality">Calidad del Sueño</Label>
              <Controller
                name="quality"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la calidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {sleepQualityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.quality && <p className="text-xs text-destructive mt-1">{errors.quality.message}</p>}
            </div>

            <div>
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Ej: Soñé algo interesante, me desperté varias veces..." />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : "Guardar Registro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {sleepLogs.length === 0 && (
         <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground font-normal">Sin Registros</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <BedDouble className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Aún no has registrado ningún periodo de sueño.</p>
            <p className="text-sm text-muted-foreground">¡Añade tu primer registro para empezar a monitorizar tu descanso!</p>
          </CardContent>
        </Card>
      )}

      {sleepLogs.length > 0 && (
        <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-primary">Historial de Sueño</h2>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {sleepLogs.map(log => (
                    <SleepLogItem key={log.id} log={log} onDelete={handleDeleteLog} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
