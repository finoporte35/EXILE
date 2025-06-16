
"use client";

import { useState, useEffect, useMemo } from 'react'; 
import { useData, EraIconMapper } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { CheckCircle, Loader2, Lock, Award, ShieldCheck, Info, Edit3, Save, Settings2, PlusCircle } from 'lucide-react';
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
    <span>{reward.description} {(reward.type === 'xp' && reward.value) ? `(+${reward.value} XP)` : ''}</span>
  </li>
);


interface EraEditorDialogProps {
  eraToEdit: Era; 
  onSave: (eraId: string, details: UserEraCustomizations) => Promise<void>;
  triggerButton: React.ReactNode;
}

const EraEditorDialog: React.FC<EraEditorDialogProps> = ({ eraToEdit, onSave, triggerButton }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editableName, setEditableName] = useState(eraToEdit.nombre);
  const [editableDescription, setEditableDescription] = useState(eraToEdit.descripcion);
  const [editableCondiciones, setEditableCondiciones] = useState(eraToEdit.condiciones_completado_desc);
  const [editableMecanicas, setEditableMecanicas] = useState(eraToEdit.mecanicas_especiales_desc);
  const [editableXpRequerido, setEditableXpRequerido] = useState<string>(
    eraToEdit.xpRequeridoParaIniciar !== undefined ? String(eraToEdit.xpRequeridoParaIniciar) : ""
  );

  useEffect(() => {
    if (isOpen) {
      setEditableName(eraToEdit.nombre);
      setEditableDescription(eraToEdit.descripcion);
      setEditableCondiciones(eraToEdit.condiciones_completado_desc);
      setEditableMecanicas(eraToEdit.mecanicas_especiales_desc);
      setEditableXpRequerido(eraToEdit.xpRequeridoParaIniciar !== undefined ? String(eraToEdit.xpRequeridoParaIniciar) : "");
    }
  }, [isOpen, eraToEdit]);


  const handleSaveChanges = async () => {
    if (!editableName.trim()) {
      toast({ variant: "destructive", title: "Campo Requerido", description: "El nombre de la Era no puede estar vacío." });
      return;
    }
    
    const detailsToUpdate: UserEraCustomizations = {};
    detailsToUpdate.nombre = editableName.trim();
    detailsToUpdate.descripcion = editableDescription.trim();
    detailsToUpdate.condiciones_completado_desc = editableCondiciones.trim();
    detailsToUpdate.mecanicas_especiales_desc = editableMecanicas.trim();
    
    const parsedXpRequerido = parseInt(String(editableXpRequerido), 10);
    if (!isNaN(parsedXpRequerido)) {
        detailsToUpdate.xpRequeridoParaIniciar = parsedXpRequerido;
    } else if (String(editableXpRequerido).trim() === "") {
        detailsToUpdate.xpRequeridoParaIniciar = undefined; 
    }

    await onSave(eraToEdit.id, detailsToUpdate);
    toast({ title: "Era Actualizada", description: `Los detalles de la Era "${eraToEdit.nombre}" han sido guardados.` });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Detalles de la Era: {eraToEdit.nombre}</DialogTitle>
          <DialogDescription>Personaliza los aspectos narrativos y algunos parámetros de esta era.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor={`eraName-${eraToEdit.id}`}>Nombre de la Era</Label>
            <Input id={`eraName-${eraToEdit.id}`} value={editableName} onChange={(e) => setEditableName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`eraDescription-${eraToEdit.id}`}>Descripción de la Era</Label>
            <Textarea id={`eraDescription-${eraToEdit.id}`} value={editableDescription} onChange={(e) => setEditableDescription(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor={`eraCondiciones-${eraToEdit.id}`}>Descripción de Condiciones de Completado</Label>
            <Textarea id={`eraCondiciones-${eraToEdit.id}`} value={editableCondiciones} onChange={(e) => setEditableCondiciones(e.target.value)} rows={2} />
          </div>
          <div>
            <Label htmlFor={`eraMecanicas-${eraToEdit.id}`}>Descripción de Mecánicas Especiales</Label>
            <Textarea id={`eraMecanicas-${eraToEdit.id}`} value={editableMecanicas} onChange={(e) => setEditableMecanicas(e.target.value)} rows={2} />
          </div>
          <div>
            <Label htmlFor={`eraXpRequerido-${eraToEdit.id}`}>XP Requerido para Iniciar esta Era (opcional)</Label>
            <Input id={`eraXpRequerido-${eraToEdit.id}`} type="number" placeholder="Ej: 1000" value={editableXpRequerido} onChange={(e) => setEditableXpRequerido(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Si se deja vacío, se usará el valor por defecto de la Era (0 si es nueva). Afecta si puedes *comenzar* esta Era.</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const CurrentEraDisplay: React.FC = () => {
  const { currentEra, completeCurrentEra, isLoading, isEraObjectiveCompleted, userXP, updateEraCustomizations } = useData();
  const [isCompleting, setIsCompleting] = useState(false);

  if (isLoading && !currentEra) { 
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
          <p className="text-muted-foreground">Has completado todas las Eras disponibles o no hay una era activa.</p>
          <p className="text-muted-foreground mt-2">Pronto habrá nuevos capítulos en tu aventura o puedes iniciar una nueva.</p>
        </CardContent>
      </Card>
    );
  }

  const allObjectivesMet = currentEra.objetivos.every(obj => isEraObjectiveCompleted(obj.id, currentEra.id));
  
  const currentEraXpRequirement = currentEra.xpRequeridoParaIniciar !== undefined ? currentEra.xpRequeridoParaIniciar : 0;
  const xpFromDominating = currentEra.recompensas.find(r => r.type === 'xp' && r.value && typeof r.value === 'number' && r.description.toLowerCase().includes("por dominar"))?.value || 0; 
  const totalXpNeededForCompletion = currentEraXpRequirement + (xpFromDominating || 0); 
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

  return (
    <Card className="shadow-xl border-primary/20 bg-card mb-8">
      <CardHeader className="border-b border-neutral-700/50 pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
            <EraIconMapper iconName={currentEra.tema_visual.icono} className={cn("h-10 w-10", currentEra.tema_visual.colorPrincipal || 'text-primary')} />
            <div>
                <p className="text-sm font-medium text-muted-foreground">ERA ACTUAL</p>
                <CardTitle className={cn("text-3xl font-headline", currentEra.tema_visual.colorPrincipal || 'text-gradient-red')}>
                {currentEra.nombre}
                </CardTitle>
            </div>
            </div>
             <EraEditorDialog 
                eraToEdit={currentEra}
                onSave={updateEraCustomizations}
                triggerButton={
                    <Button variant="outline" size="icon" className="text-primary hover:bg-primary/10">
                        <Edit3 className="h-5 w-5" />
                        <span className="sr-only">Editar Era Actual</span>
                    </Button>
                }
            />
        </div>
        <CardDescription className="text-base leading-relaxed">{currentEra.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-sky-400"/>Objetivos de la Era:</h3>
           {currentEra.objetivos.length > 0 ? (
            <ul className="space-y-1.5 list-inside">
                {objectivesWithStatus.map(obj => (
                <EraObjectiveItem key={obj.id} objective={obj} completed={obj.completed} />
                ))}
            </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No hay objetivos específicos definidos para esta era. ¡Enfócate en tu crecimiento general!</p>
            )}
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
                 <p className="text-xs text-muted-foreground">(XP de inicio base: {currentEra.xpRequeridoParaIniciar.toLocaleString()})</p>
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

const EraListItem: React.FC<{ era: Era; type: 'completed' | 'upcoming' | 'user-created'; onStart?: (eraId: string) => void; canStartStatus?: boolean; onEdit: (era: Era) => void; }> = ({ era, type, onStart, canStartStatus, onEdit }) => {
  return (
    <Card className={cn("bg-card/80 border-neutral-700 shadow-sm flex flex-col h-full", 
        type === 'completed' && "border-green-500/20 opacity-80",
        type === 'upcoming' && !canStartStatus && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <EraIconMapper iconName={era.tema_visual.icono} className={cn("h-6 w-6", era.tema_visual.colorPrincipal || 'text-muted-foreground')} />
            <CardTitle className={cn("text-lg", era.tema_visual.colorPrincipal || (type === 'completed' ? 'text-green-400' : 'text-foreground'))}>{era.nombre}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onEdit(era)}>
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Editar Era</span>
            </Button>
        </div>
        {era.xpRequeridoParaIniciar !== undefined && <p className="text-xs text-muted-foreground pt-1">Requiere: {era.xpRequeridoParaIniciar.toLocaleString()} XP</p>}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{type === 'completed' ? era.descripcionCompletada || era.descripcion : era.descripcion}</p>
      </CardContent>
      {type !== 'completed' && onStart && (
        <CardFooter>
          <Button onClick={() => onStart(era.id)} disabled={!canStartStatus} className="w-full">
            {canStartStatus ? "Comenzar esta Era" : "Requisitos no cumplidos"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const CreateEraDialog: React.FC<{ onCreate: (details: { nombre: string, descripcion: string }) => Promise<void> }> = ({ onCreate }) => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!nombre.trim()) {
            toast({ variant: "destructive", title: "Nombre Requerido", description: "El nombre de la nueva Era no puede estar vacío." });
            return;
        }
        setIsSubmitting(true);
        await onCreate({ nombre, descripcion });
        toast({ title: "Era Creada", description: `La Era "${nombre}" ha sido añadida a tus futuras eras.` });
        setNombre("");
        setDescripcion("");
        setIsOpen(false);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Era
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nueva Era</DialogTitle>
                    <DialogDescription>Define el nombre y la descripción inicial de tu nueva Era. Podrás editar más detalles después.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="newEraName">Nombre de la Era</Label>
                        <Input id="newEraName" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: La Era de la Autodisciplina"/>
                    </div>
                    <div>
                        <Label htmlFor="newEraDescription">Descripción Breve</Label>
                        <Textarea id="newEraDescription" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Un período enfocado en construir hábitos sólidos..." rows={3}/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancelar</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !nombre.trim()}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        {isSubmitting ? "Creando..." : "Crear Era"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function ErasPage() {
  const { 
    predefinedEras, 
    userCreatedEras,
    completedEras: completedEraObjects, 
    isLoading, 
    currentEraId, 
    startEra, 
    canStartEra,
    updateEraCustomizations,
    createUserEra,
    getEraDetails
  } = useData();

  const [eraToEditInDialog, setEraToEditInDialog] = useState<Era | null>(null);

  const handleEditEra = (era: Era) => {
    const detailedEra = getEraDetails(era.id);
    if (detailedEra) {
        setEraToEditInDialog(detailedEra);
    }
  };

  const allKnownErasForFiltering = useMemo(() => {
    const combined = [...predefinedEras, ...userCreatedEras];
    const eraMap = new Map<string, Era>();
    combined.forEach(era => eraMap.set(era.id, era));
    return Array.from(eraMap.values());
  }, [predefinedEras, userCreatedEras]);


  const upcomingEras = useMemo(() => {
    return allKnownErasForFiltering
      .filter(era => 
        !completedEraObjects.find(cEra => cEra.id === era.id) && 
        era.id !== currentEraId
      )
      .map(era => getEraDetails(era.id)) 
      .filter(Boolean) as Era[];
  }, [allKnownErasForFiltering, completedEraObjects, currentEraId, getEraDetails]);


  if (isLoading && !currentEraId && completedEraObjects.length === 0 && userCreatedEras.length === 0 && predefinedEras.length === 0) {
    return (
      <div className="flex justify-center items-center p-10 h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <EraIconMapper iconName="BookCopy" className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-headline font-bold text-gradient-red">Saga de Eras</h1>
            </div>
            <p className="text-muted-foreground ml-10 sm:ml-0">Revive tus capítulos completados, contempla tu era actual y forja las futuras.</p>
        </div>
        <CreateEraDialog onCreate={createUserEra} />
      </div>


      <CurrentEraDisplay />

      {completedEraObjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Crónicas de tu Saga (Eras Completadas)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEraObjects.slice().reverse().map(era => ( 
              <EraListItem 
                key={era.id} 
                era={era} 
                type="completed" 
                onEdit={() => handleEditEra(era)}
              />
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
                <EraListItem 
                    key={era.id} 
                    era={era} 
                    type={era.isUserCreated ? "user-created" : "upcoming"}
                    onStart={startEra}
                    canStartStatus={isPossibleToStart}
                    onEdit={() => handleEditEra(era)}
                />
              );
            })}
          </div>
        </div>
      )}

      {eraToEditInDialog && (
        <EraEditorDialog
            eraToEdit={eraToEditInDialog}
            onSave={async (eraId, details) => {
                await updateEraCustomizations(eraId, details);
                setEraToEditInDialog(null); 
            }}
            triggerButton={<button style={{ display: 'none' }} />} // Placeholder, actual triggers are on list items
        />
      )}
      
    </div>
  );
}


    