
"use client";

import type { SleepLog } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, TrendingUp, MessageSquare, Trash2, Star } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface SleepLogItemProps {
  log: SleepLog;
  onDelete: (id: string) => void;
}

const qualityColors: Record<SleepLog['quality'], string> = {
    excellent: 'bg-green-500/20 text-green-300 border-green-500/50',
    good: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    fair: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    poor: 'bg-red-500/20 text-red-300 border-red-500/50',
};
const qualityText: Record<SleepLog['quality'], string> = {
    excellent: 'Excelente',
    good: 'Buena',
    fair: 'Regular',
    poor: 'Pobre',
};


export default function SleepLogItem({ log, onDelete }: SleepLogItemProps) {
  const formattedDate = format(parseISO(log.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const durationText = `${log.sleepDurationHours.toFixed(1)} horas`;

  return (
    <Card className="shadow-md border-neutral-800 flex flex-col h-full bg-card hover:border-primary/30 transition-colors duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {formattedDate}
            </CardTitle>
             <Badge variant="outline" className={cn("text-xs", qualityColors[log.quality])}>
                {qualityText[log.quality]}
            </Badge>
        </div>
         <CardDescription className="text-sm text-muted-foreground pt-1">
            De {log.timeToBed} a {log.timeWokeUp}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 flex-grow">
        <div className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-accent" />
          <span className="font-medium text-foreground">Duración Total:</span>
          <span className="text-accent font-semibold">{durationText}</span>
        </div>
        
        {log.notes && (
          <div className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Notas:</span>
              <p className="text-muted-foreground leading-snug whitespace-pre-wrap">{log.notes}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-neutral-700/50">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full opacity-80 hover:opacity-100">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Registro
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de eliminar este registro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El registro de sueño del {formattedDate} será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(log.id)} className="bg-destructive hover:bg-destructive/90">
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
