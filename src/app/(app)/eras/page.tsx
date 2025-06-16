
"use client";

import { useState, useEffect } from 'react'; 
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { CheckCircle, Loader2, Lock, BookCopy, Award, ShieldCheck, Info, Edit3, Save, Settings2 } from 'lucide-react';
import type { Era, EraObjective, EraReward, UserEraCustomizations } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const EraObjectiveItem: React.FC<{ objective: EraObjective; completed: boolean }> = ({ objective, completed }) => (
  <li className={cn("flex items-start gap-2", completed ? "text-green-400" : "text-muted-foreground")}>
    <CheckCircle className={cn("h-5 w-5 mt-0.5 flex-shrink-0", completed ? "text-green-500" : "text-gray-500")} />
    <span className={cn(completed && "line-through")}>{objective.description}</span>
  </li>
);

const EraRewardItem: React.FC<{ reward: EraReward }> = ({ reward }) => (
  <li className="flex items-center gap-2 text-sm text-amber-400">
    <Award className="h-4 w-4 text-amber-500" />
    <span>{reward.description}</span>
  </li>
);

const CurrentEraDisplay: React.FC = () => {
  const { currentEra, completeCurrentEra, isLoading, isEraObjectiveCompleted, userXP, updateCurrentEraDetails } = useData();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editableName, setEditableName] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [editableCondiciones, setEditableCondiciones] = useState("");
  const [editableMecanicas, setEditableMecanicas] = useState("");
  const [editableXpRequerido, setEditableXpRequerido] = useState<string | number>("");


  useEffect(() => {
    if (currentEra) {
      setEditableName(currentEra.nombre);
      setEditableDescription(currentEra.descripcion);
      setEditableCondiciones(currentEra.condiciones_completado_desc);
      setEditableMecanicas(currentEra.mecanicas_especiales_desc);
      setEditableXpRequerido(currentEra.xpRequeridoParaIniciar !== undefined ? String(currentEra.xpRequeridoParaIniciar) : "");
    }
  }, [currentEra, isEditing]); // Re-populate form when dialog opens or currentEra changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentEra) {
    return (
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl text-gradient-red">Fin de la Saga... por ahora</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Has completado todas las Eras disponibles. ¡Felicidades, leyenda!</p>
          <p className="text-muted-foreground mt-2">Pronto habrá nuevos capítulos en tu aventura.</p>
        </CardContent>
      </Card>
    );
  }

  const EraIcon = currentEra.tema_visual.icono || BookCopy;
  const allObjectivesMet = currentEra.objetivos.every(obj => isEraObjectiveCompleted(obj.id, currentEra.id));
  
  const currentEraXpRequirement = currentEra.xpRequeridoParaIniciar !== undefined ? currentEra.xpRequeridoParaIniciar : 0;
  const xpFromDominating = currentEra.recompensas.find(r => r.type === 'xp' && r.value && typeof r.value === 'number' && r.description.toLowerCase().includes("por dominar"))?.value || 0;
  const totalXpNeededForCompletion = currentEraXpRequirement + xpFromDominating;
  const canCompleteEra = allObjectivesMet && userXP >= totalXpNeededForCompletion;


  const handleCompleteEra = async () => {
    setIsCompleting(true);
    await completeCurrentEra();
    setIsCompleting(false);
  };
  
  const objectivesWithStatus = currentEra.objetivos.map(obj => ({
    ...obj,
    completed: isEraObjectiveCompleted(obj.id, currentEra.id)
  }));

  const handleSaveChanges = async () => {
    if (!editableName.trim()) {
      toast({ variant: "destructive", title: "Campo Requerido", description: "El nombre de la Era no puede estar vacío." });
      return;
    }
    
    const detailsToUpdate: UserEraCustomizations = {};
    if (editableName.trim() !== currentEra.nombre) {
        detailsToUpdate.nombre = editableName.trim();
    }
    if (editableDescription.trim() !== currentEra.descripcion) {
        detailsToUpdate.descripcion = editableDescription.trim();
    }
    if (editableCondiciones.trim() !== currentEra.condiciones_completado_desc) {
        detailsToUpdate.condiciones_completado_desc = editableCondiciones.trim();
    }
    if (editableMecanicas.trim() !== currentEra.mecanicas_especiales_desc) {
        detailsToUpdate.mecanicas_especiales_desc = editableMecanicas.trim();
    }
    
    const parsedXpRequerido = parseInt(String(editableXpRequerido), 10);
    if (!isNaN(parsedXpRequerido) && parsedXpRequerido !== currentEra.xpRequeridoParaIniciar) {
        detailsToUpdate.xpRequeridoParaIniciar = parsedXpRequerido;
    } else if (String(editableXpRequerido).trim() === "" && currentEra.xpRequeridoParaIniciar !== undefined) {
        // If user clears the field, and it was previously defined, allow setting it back to undefined (or let backend handle)
        // For now, this assumes that an empty string means "no specific XP requirement from customization"
        // and it will fall back to base Era's value. If base Era also has undefined, it will be undefined.
        // To explicitly set to 'undefined' from client is tricky if base has a value.
        // We'll let DataContext handle merging logic correctly.
        if (currentEra.xpRequeridoParaIniciar !== undefined) { // Only mark for update if it's a change from a defined value
           detailsToUpdate.xpRequeridoParaIniciar = undefined; // Signal to DataContext to potentially revert to base or store as undefined
        }
    }


    if (Object.keys(detailsToUpdate).length > 0) {
        await updateCurrentEraDetails(detailsToUpdate);
        toast({ title: "Era Actualizada", description: "Los detalles de tu Era actual han sido guardados." });
    }
    setIsEditing(false);
  };


  return (
    <Card className="shadow-xl border-primary/20 bg-card mb-8">
      <CardHeader className="border-b border-neutral-700/50 pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
            <EraIcon className={cn("h-10 w-10", currentEra.tema_visual.colorPrincipal || 'text-primary')} />
            <div>
                <p className="text-sm font-medium text-muted-foreground">ERA ACTUAL</p>
                <CardTitle className={cn("text-3xl font-headline", currentEra.tema_visual.colorPrincipal || 'text-gradient-red')}>
                {currentEra.nombre}
                </CardTitle>
            </div>
            </div>
            <Dialog open={isEditing} onOpenChange={(open) => {
                setIsEditing(open);
                if (open && currentEra) { // Re-populate form when dialog opens
                    setEditableName(currentEra.nombre);
                    setEditableDescription(currentEra.descripcion);
                    setEditableCondiciones(currentEra.condiciones_completado_desc);
                    setEditableMecanicas(currentEra.mecanicas_especiales_desc);
                    setEditableXpRequerido(currentEra.xpRequeridoParaIniciar !== undefined ? String(currentEra.xpRequeridoParaIniciar) : "");
                }
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-primary hover:bg-primary/10">
                        <Edit3 className="h-5 w-5" />
                        <span className="sr-only">Editar Era</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Detalles de la Era Actual</DialogTitle>
                        <DialogDescription>Personaliza los aspectos narrativos y algunos parámetros de tu era.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="eraName">Nombre de la Era</Label>
                            <Input id="eraName" value={editableName} onChange={(e) => setEditableName(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="eraDescription">Descripción de la Era</Label>
                            <Textarea id="eraDescription" value={editableDescription} onChange={(e) => setEditableDescription(e.target.value)} rows={3} />
                        </div>
                        <div>
                            <Label htmlFor="eraCondiciones">Descripción de Condiciones de Completado</Label>
                            <Textarea id="eraCondiciones" value={editableCondiciones} onChange={(e) => setEditableCondiciones(e.target.value)} rows={2} />
                        </div>
                        <div>
                            <Label htmlFor="eraMecanicas">Descripción de Mecánicas Especiales</Label>
                            <Textarea id="eraMecanicas" value={editableMecanicas} onChange={(e) => setEditableMecanicas(e.target.value)} rows={2} />
                        </div>
                        <div>
                            <Label htmlFor="eraXpRequerido">XP Requerido para Iniciar esta Era (opcional)</Label>
                            <Input id="eraXpRequerido" type="number" placeholder="Ej: 1000" value={editableXpRequerido} onChange={(e) => setEditableXpRequerido(e.target.value)} />
                             <p className="text-xs text-muted-foreground mt-1">Si se deja vacío, se usará el valor por defecto de la Era. Afecta si puedes *comenzar* esta Era.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <CardDescription className="text-base leading-relaxed">{currentEra.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-sky-400"/>Objetivos de la Era:</h3>
          <ul className="space-y-1.5 list-inside">
            {objectivesWithStatus.map(obj => (
              <EraObjectiveItem key={obj.id} objective={obj} completed={obj.completed} />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2"><Award className="h-5 w-5 text-amber-400"/>Recompensas al Completar:</h3>
          <ul className="space-y-1 list-inside">
            {currentEra.recompensas.map((reward, index) => (
              <EraRewardItem key={index} reward={reward} />
            ))}
          </ul>
        </div>
         {currentEra.mecanicas_especiales_desc && (
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2"><Settings2 className="h-5 w-5 text-indigo-400"/>Mecánicas Especiales:</h3>
                <p className="text-sm text-muted-foreground">{currentEra.mecanicas_especiales_desc}</p>
            </div>
        )}
        <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Condiciones para Completar:</h3>
            <p className="text-sm text-muted-foreground">{currentEra.condiciones_completado_desc}</p>
            {currentEra.xpRequeridoParaIniciar !== undefined && (
                 <p className="text-xs text-muted-foreground">(XP de inicio base: {currentEra.xpRequeridoParaIniciar})</p>
            )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-neutral-700/50 pt-4">
        <Button 
          onClick={handleCompleteEra} 
          disabled={!canCompleteEra || isCompleting || isLoading} 
          className="w-full bg-new-button-gradient text-primary-foreground hover:opacity-90 text-base py-3"
        >
          {isCompleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
          {isCompleting ? "Completando Era..." : (canCompleteEra ? "Marcar Era como Completada" : "Condiciones no cumplidas")}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CompletedEraItem: React.FC<{ era: Era }> = ({ era }) => {
  const EraIcon = era.tema_visual.icono || BookCopy;
  return (
    <Card className="bg-card/50 border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <EraIcon className={cn("h-6 w-6", era.tema_visual.colorPrincipal || 'text-gray-400')} />
          <CardTitle className={cn("text-lg", era.tema_visual.colorPrincipal || 'text-gray-300')}>{era.nombre}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{era.descripcionCompletada || era.descripcion}</p>
      </CardContent>
    </Card>
  );
};


export default function ErasPage() {
  const { completedEras, isLoading, allEras, startEra, canStartEra, currentEraId } = useData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const upcomingEras = allEras.filter(era => 
    !completedEras.find(cEra => cEra.id === era.id) && 
    era.id !== currentEraId 
    // The canStartEra logic for upcoming eras will use the base XP requirement from allEras,
    // as currentEraCustomizations only applies to the *current* active era.
  );


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-1">
        <BookCopy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Saga de Eras</h1>
      </div>
      <p className="text-muted-foreground ml-10">Revive tus capítulos completados y contempla tu era actual.</p>

      <CurrentEraDisplay />

      {completedEras.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Crónicas de tu Saga (Eras Completadas)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEras.slice().reverse().map(era => ( 
              <CompletedEraItem key={era.id} era={era} />
            ))}
          </div>
        </div>
      )}
      
      {upcomingEras.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-primary mb-4">Eras Futuras Desbloqueables</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEras.map(era => {
              const isPossibleToStart = canStartEra(era.id);
              return (
                <Card key={era.id} className="bg-card/80 border-neutral-700 shadow-sm">
                  <CardHeader>
                      <div className="flex items-center gap-2">
                          {era.tema_visual.icono ? <era.tema_visual.icono className={cn("h-6 w-6", era.tema_visual.colorPrincipal || 'text-muted-foreground')} /> : <Lock className="h-6 w-6 text-muted-foreground" />}
                          <CardTitle className={cn("text-lg", era.tema_visual.colorPrincipal || 'text-muted-foreground')}>{era.nombre}</CardTitle>
                      </div>
                      {era.xpRequeridoParaIniciar !== undefined && <p className="text-xs text-muted-foreground pt-1">Requiere: {era.xpRequeridoParaIniciar.toLocaleString()} XP</p>}
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{era.descripcion}</p>
                  </CardContent>
                  <CardFooter>
                      <Button onClick={() => startEra(era.id)} disabled={!isPossibleToStart} className="w-full">
                          {isPossibleToStart ? "Comenzar esta Era" : "Requisitos no cumplidos"}
                      </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

