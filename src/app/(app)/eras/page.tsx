
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react'; 
import { useData, EraIconMapper } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { CheckCircle, Loader2, Lock, Award, ShieldCheck, Info, Edit3, Save, Settings2, PlusCircle, Trash2, Milestone, CalendarDays } from 'lucide-react';
import type { Era, EraObjective, EraReward, UserEraCustomizations, EraVisualTheme } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';


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
  onSave: (eraId: string, details: Partial<Era>) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EraEditorDialog: React.FC<EraEditorDialogProps> = ({ eraToEdit, onSave, isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const [editableName, setEditableName] = useState(eraToEdit.nombre);
  const [editableDescription, setEditableDescription] = useState(eraToEdit.descripcion);
  const [editableCondiciones, setEditableCondiciones] = useState(eraToEdit.condiciones_completado_desc);
  const [editableMecanicas, setEditableMecanicas] = useState(eraToEdit.mecanicas_especiales_desc);
  const [editableXpRequerido, setEditableXpRequerido] = useState<string>(
    eraToEdit.xpRequeridoParaIniciar !== undefined ? String(eraToEdit.xpRequeridoParaIniciar) : ""
  );
  const [editableIcono, setEditableIcono] = useState(eraToEdit.tema_visual.icono || "Milestone");
  const [editableColor, setEditableColor] = useState(eraToEdit.tema_visual.colorPrincipal || "text-gray-400");

  // For user-created eras, objective/reward descriptions
  const [editableObjectives, setEditableObjectives] = useState<EraObjective[]>(eraToEdit.objetivos.map(o => ({...o})));
  const [editableRewards, setEditableRewards] = useState<EraReward[]>(eraToEdit.recompensas.map(r => ({...r})));


  useEffect(() => {
    if (isOpen && eraToEdit) {
      setEditableName(eraToEdit.nombre);
      setEditableDescription(eraToEdit.descripcion);
      setEditableCondiciones(eraToEdit.condiciones_completado_desc);
      setEditableMecanicas(eraToEdit.mecanicas_especiales_desc);
      setEditableXpRequerido(eraToEdit.xpRequeridoParaIniciar !== undefined ? String(eraToEdit.xpRequeridoParaIniciar) : "");
      setEditableIcono(eraToEdit.tema_visual.icono || "Milestone");
      setEditableColor(eraToEdit.tema_visual.colorPrincipal || "text-gray-400");
      setEditableObjectives(eraToEdit.objetivos.map(o => ({...o})));
      setEditableRewards(eraToEdit.recompensas.map(r => ({...r})));
    }
  }, [isOpen, eraToEdit]);

  const handleObjectiveDescriptionChange = (index: number, newDescription: string) => {
    setEditableObjectives(prev => prev.map((obj, i) => i === index ? { ...obj, description: newDescription } : obj));
  };
  const handleRewardDescriptionChange = (index: number, newDescription: string) => {
    setEditableRewards(prev => prev.map((rew, i) => i === index ? { ...rew, description: newDescription } : rew));
  };


  const handleSaveChanges = async () => {
    if (!editableName.trim()) {
      toast({ variant: "destructive", title: "Campo Requerido", description: "El nombre de la Era no puede estar vacío." });
      return;
    }
    
    const detailsToUpdate: Partial<Era> = {
        nombre: editableName.trim(),
        descripcion: editableDescription.trim(),
        condiciones_completado_desc: editableCondiciones.trim(),
        mecanicas_especiales_desc: editableMecanicas.trim(),
        tema_visual: { icono: editableIcono.trim() || "Milestone", colorPrincipal: editableColor.trim() || "text-gray-400" },
    };
    
    const parsedXpRequerido = parseInt(String(editableXpRequerido), 10);
    if (!isNaN(parsedXpRequerido)) {
        detailsToUpdate.xpRequeridoParaIniciar = parsedXpRequerido;
    } else if (String(editableXpRequerido).trim() === "") {
        detailsToUpdate.xpRequeridoParaIniciar = undefined; 
    }

    if (eraToEdit.isUserCreated) {
        detailsToUpdate.objetivos = editableObjectives.map(obj => ({...obj, description: obj.description.trim()}));
        detailsToUpdate.recompensas = editableRewards.map(rew => ({...rew, description: rew.description.trim()}));
    }

    await onSave(eraToEdit.id, detailsToUpdate);
    toast({ title: "Era Actualizada", description: `Los detalles de la Era "${eraToEdit.nombre}" han sido guardados.` });
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Detalles de la Era: {eraToEdit.nombre}</DialogTitle>
          <DialogDescription>Personaliza los aspectos de esta era. Los cambios se guardarán para tu perfil.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-200px)] p-1 pr-3">
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
            <Label htmlFor={`eraCondiciones-${eraToEdit.id}`}>Condiciones de Completado (Descripción)</Label>
            <Textarea id={`eraCondiciones-${eraToEdit.id}`} value={editableCondiciones} onChange={(e) => setEditableCondiciones(e.target.value)} rows={2} />
          </div>
          <div>
            <Label htmlFor={`eraMecanicas-${eraToEdit.id}`}>Mecánicas Especiales (Descripción)</Label>
            <Textarea id={`eraMecanicas-${eraToEdit.id}`} value={editableMecanicas} onChange={(e) => setEditableMecanicas(e.target.value)} rows={2} />
          </div>
          <div>
            <Label htmlFor={`eraXpRequerido-${eraToEdit.id}`}>XP Requerido para Iniciar (opcional)</Label>
            <Input id={`eraXpRequerido-${eraToEdit.id}`} type="number" placeholder="Ej: 1000" value={editableXpRequerido} onChange={(e) => setEditableXpRequerido(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor={`eraIcono-${eraToEdit.id}`}>Icono (Nombre de Lucide Icon)</Label>
                <Input id={`eraIcono-${eraToEdit.id}`} value={editableIcono} onChange={(e) => setEditableIcono(e.target.value)} placeholder="Ej: Sunrise, Zap"/>
            </div>
            <div>
                <Label htmlFor={`eraColor-${eraToEdit.id}`}>Color Principal (Clase Tailwind)</Label>
                <Input id={`eraColor-${eraToEdit.id}`} value={editableColor} onChange={(e) => setEditableColor(e.target.value)} placeholder="Ej: text-blue-500"/>
            </div>
          </div>

          {eraToEdit.fechaInicio && (
            <div>
              <Label>Fecha de Inicio</Label>
              <Input value={format(parseISO(eraToEdit.fechaInicio), "PPP", { locale: es })} readOnly disabled className="text-muted-foreground"/>
            </div>
          )}
          {eraToEdit.fechaFin && (
            <div>
              <Label>Fecha de Finalización</Label>
              <Input value={format(parseISO(eraToEdit.fechaFin), "PPP", { locale: es })} readOnly disabled className="text-muted-foreground"/>
            </div>
          )}


          {eraToEdit.isUserCreated && (
            <>
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-sm font-medium">Editar Descripciones de Objetivos</h4>
                {editableObjectives.map((obj, index) => (
                  <div key={obj.id || index}>
                    <Label htmlFor={`obj-desc-${index}`}>Descripción Objetivo {index + 1} (ID: {obj.id || 'nuevo'})</Label>
                    <Textarea id={`obj-desc-${index}`} value={obj.description} onChange={(e) => handleObjectiveDescriptionChange(index, e.target.value)} rows={2}/>
                  </div>
                ))}
                 {editableObjectives.length === 0 && <p className="text-xs text-muted-foreground">Aún no has definido objetivos para esta Era. Añádelos aquí.</p>}
                 {/* Placeholder for adding new objectives if needed in future */}
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-sm font-medium">Editar Descripciones de Recompensas</h4>
                {editableRewards.map((rew, index) => (
                  <div key={rew.type + index}>
                     <Label htmlFor={`rew-desc-${index}`}>Descripción Recompensa {index + 1} (Tipo: {rew.type}, Valor: {rew.value || 'N/A'})</Label>
                    <Textarea id={`rew-desc-${index}`} value={rew.description} onChange={(e) => handleRewardDescriptionChange(index, e.target.value)} rows={2}/>
                  </div>
                ))}
                {editableRewards.length === 0 && <p className="text-xs text-muted-foreground">Aún no has definido recompensas. Añádelas aquí.</p>}
                {/* Placeholder for adding new rewards */}
              </div>
            </>
          )}

        </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const CurrentEraDisplay: React.FC = () => {
  const { currentEra, completeCurrentEra, isLoading, isEraObjectiveCompleted, userXP, updateEraCustomizations, getEraDetails } = useData();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [eraForEditor, setEraForEditor] = useState<Era | null>(null);

  const handleOpenEditor = () => {
    if (currentEra) {
        const freshEraDetails = getEraDetails(currentEra.id);
        if (freshEraDetails) {
            setEraForEditor(freshEraDetails);
            setIsEditorOpen(true);
        }
    }
  };

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
          <CardTitle className="text-xl text-gradient-red">Viaje en Calma</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Actualmente no hay una Era activa.</p>
          <p className="text-muted-foreground mt-2">Puedes iniciar una nueva Era desde la sección "Eras Futuras" o crear la tuya propia.</p>
        </CardContent>
      </Card>
    );
  }

  const allObjectivesMet = currentEra.objetivos.every(obj => isEraObjectiveCompleted(obj.id, currentEra.id));
  const currentEraXpRequirement = currentEra.xpRequeridoParaIniciar !== undefined ? currentEra.xpRequeridoParaIniciar : 0;
  const xpFromDominating = currentEra.recompensas.find(r => r.type === 'xp' && r.value && typeof r.value === 'number' && r.description.toLowerCase().includes("dominar"))?.value || 0; 
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
    <>
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
            <Button variant="outline" size="icon" className="text-primary hover:bg-primary/10" onClick={handleOpenEditor}>
                <Edit3 className="h-5 w-5" />
                <span className="sr-only">Editar Era Actual</span>
            </Button>
        </div>
        <CardDescription className="text-base leading-relaxed">{currentEra.descripcion}</CardDescription>
        {currentEra.fechaInicio && (
            <p className="text-xs text-sky-400 mt-2 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Iniciada el: {format(parseISO(currentEra.fechaInicio), "PPP", { locale: es })}
            </p>
        )}
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
                <p className="text-sm text-muted-foreground">No hay objetivos específicos definidos para esta era. ¡Enfócate en tu crecimiento general o edita la era para añadirlos!</p>
            )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2"><Award className="h-5 w-5 text-amber-400"/>Recompensas al Completar:</h3>
          <ul className="space-y-1 list-inside">
            {currentEra.recompensas.map((reward, index) => (
              <EraRewardItem key={index} reward={reward} />
            ))}
             {currentEra.recompensas.length === 0 && <p className="text-sm text-muted-foreground">Sin recompensas específicas definidas. Edita la era para añadir.</p>}
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
    {eraForEditor && (
        <EraEditorDialog 
            eraToEdit={eraForEditor}
            onSave={updateEraCustomizations}
            isOpen={isEditorOpen}
            onOpenChange={setIsEditorOpen}
        />
    )}
    </>
  );
};

interface EraListItemProps {
  era: Era;
  type: 'completed' | 'upcoming' | 'user-created';
  onStart?: (eraId: string) => void;
  canStartStatus?: boolean;
  onEdit: (era: Era) => void;
  onDelete?: (eraId: string) => void;
}

const EraListItem: React.FC<EraListItemProps> = ({ era, type, onStart, canStartStatus, onEdit, onDelete }) => {
  const { toast } = useToast();
  
  const handleDeleteWithToast = () => {
    if (onDelete) {
      onDelete(era.id);
      toast({ title: "Era Eliminada", description: `La era "${era.nombre}" ha sido eliminada.`});
    }
  };

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
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onEdit(era)}>
                  <Edit3 className="h-4 w-4" />
                  <span className="sr-only">Editar Era</span>
              </Button>
              {era.isUserCreated && onDelete && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar Era</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar la era "{era.nombre}". Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteWithToast}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
        </div>
        {era.xpRequeridoParaIniciar !== undefined && <p className="text-xs text-muted-foreground pt-1">Requiere: {era.xpRequeridoParaIniciar.toLocaleString()} XP</p>}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{type === 'completed' ? era.descripcionCompletada || era.descripcion : era.descripcion}</p>
         {era.fechaInicio && (
            <p className="text-xs text-sky-400 mt-2 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Iniciada: {format(parseISO(era.fechaInicio), "dd MMM yy", { locale: es })}
                 {era.fechaFin && ` - Fin: ${format(parseISO(era.fechaFin), "dd MMM yy", { locale: es })}`}
            </p>
        )}
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
    deleteUserEra,
    getEraDetails
  } = useData();

  const [eraToEditInDialog, setEraToEditInDialog] = useState<Era | null>(null);
  const [isEditorOpenInPage, setIsEditorOpenInPage] = useState(false);


  const handleEditEra = useCallback((era: Era) => {
    const detailedEra = getEraDetails(era.id); 
    if (detailedEra) {
        setEraToEditInDialog(detailedEra);
        setIsEditorOpenInPage(true);
    }
  }, [getEraDetails]);

  const allKnownErasForFiltering = useMemo(() => {
    // Now that predefinedEras is empty, we only care about userCreatedEras
    const eraMap = new Map<string, Era>();
    userCreatedEras.forEach(era => {
        const detailedEra = getEraDetails(era.id); 
        if (detailedEra) eraMap.set(detailedEra.id, detailedEra);
    });
    return Array.from(eraMap.values());
  }, [userCreatedEras, getEraDetails]);


  const upcomingEras = useMemo(() => {
    return allKnownErasForFiltering
      .filter(era => 
        !completedEraObjects.find(cEra => cEra.id === era.id) && 
        era.id !== currentEraId
      )
      .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : 0)); // Sort by creation date
  }, [allKnownErasForFiltering, completedEraObjects, currentEraId]);


  if (isLoading && !currentEraId && completedEraObjects.length === 0 && userCreatedEras.length === 0) {
    return (
      <div className="flex justify-center items-center p-10 h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
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
          <h2 className="text-2xl font-semibold text-primary mb-4">Eras Futuras Creadas</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEras.map(era => {
              const isPossibleToStart = canStartEra(era.id);
              return (
                <EraListItem 
                    key={era.id} 
                    era={era} 
                    type="user-created" // All upcoming are user-created now
                    onStart={startEra}
                    canStartStatus={isPossibleToStart}
                    onEdit={() => handleEditEra(era)}
                    onDelete={deleteUserEra} // All user-created eras are deletable
                />
              );
            })}
          </div>
        </div>
      )}
      
      {upcomingEras.length === 0 && userCreatedEras.length === 0 && !currentEraId && completedEraObjects.length === 0 && !isLoading && (
         <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground font-normal">Tu Lienzo Te Espera</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <Milestone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Aún no has forjado ninguna Era.</p>
            <p className="text-sm text-muted-foreground">Usa el botón "Crear Nueva Era" para comenzar tu saga personalizada.</p>
          </CardContent>
        </Card>
      )}


      {eraToEditInDialog && (
        <EraEditorDialog
            eraToEdit={eraToEditInDialog}
            onSave={updateEraCustomizations}
            isOpen={isEditorOpenInPage}
            onOpenChange={setIsEditorOpenInPage}
        />
      )}
      
    </div>
  );
}
