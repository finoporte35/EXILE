
"use client";

import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, HelpCircle, Lock, Puzzle, Unlock, Zap, Loader2 } from 'lucide-react';
import { PASSIVE_SKILLS_DATA } from '@/lib/app-config';
import type { PassiveSkill } from '@/types';
import { cn } from '@/lib/utils';

const SkillCard: React.FC<{ skill: PassiveSkill; isUnlocked: boolean; canUnlock: boolean; onUnlock: (skillId: string) => void; isUnlocking: boolean; }> = ({ skill, isUnlocked, canUnlock, onUnlock, isUnlocking }) => {
  const Icon = skill.icon;
  const [unlockingThis, setUnlockingThis] = useState(false);

  const handleUnlock = async () => {
    setUnlockingThis(true);
    await onUnlock(skill.id);
    setUnlockingThis(false);
  };

  return (
    <Card className={cn("shadow-lg flex flex-col h-full", isUnlocked ? "border-green-500/40 bg-green-500/5" : "border-primary/10")}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={cn("h-8 w-8", isUnlocked ? "text-green-500" : "text-primary")} />
          <CardTitle className={cn("text-xl font-semibold", isUnlocked ? "text-green-400" : "text-foreground")}>{skill.name}</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed min-h-[40px]">{skill.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="text-xs text-muted-foreground">
          <p><span className="font-semibold">Categoría:</span> {skill.category}</p>
          <p><span className="font-semibold">Efecto:</span> {skill.effectDescription}</p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-2 pt-4 border-t border-neutral-700/50">
        <div className="flex justify-between items-center w-full">
          <p className="text-sm font-medium text-primary">Costo: {skill.cost} XP</p>
          {isUnlocked ? (
            <div className="flex items-center gap-1 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Desbloqueado</span>
            </div>
          ) : (
             <div className="flex items-center gap-1 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <span>Bloqueado</span>
            </div>
          )}
        </div>
        {!isUnlocked && (
          <Button
            onClick={handleUnlock}
            disabled={!canUnlock || isUnlocking || unlockingThis}
            className="w-full mt-2 bg-new-button-gradient text-primary-foreground hover:opacity-90"
          >
            {unlockingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
            {unlockingThis ? "Desbloqueando..." : (canUnlock ? "Desbloquear Habilidad" : "XP Insuficiente")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function SkillsPage() {
  const { userXP, unlockedSkillIds, unlockSkill, isLoading: isDataLoading } = useData();
  const [isUnlockingGlobal, setIsUnlockingGlobal] = useState(false);


  const handleUnlockSkill = async (skillId: string) => {
    setIsUnlockingGlobal(true);
    await unlockSkill(skillId);
    setIsUnlockingGlobal(false);
  };
  
  if (isDataLoading && PASSIVE_SKILLS_DATA.length === 0) { // Show loader only if data is truly loading and skills aren't ready
    return (
      <div className="flex justify-center items-center h-full p-10">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Puzzle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-gradient-red">Ventajas Pasivas</h1>
        </div>
        <p className="text-muted-foreground ml-12 sm:ml-0">Desbloquea habilidades permanentes para potenciar tu progreso en EXILE.</p>
        <p className="text-sm text-primary mt-2">XP Disponible: {userXP.toLocaleString()}</p>
      </div>

      {PASSIVE_SKILLS_DATA.length === 0 && !isDataLoading && (
        <Card className="mt-6">
            <CardHeader className="items-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <CardTitle className="text-center text-muted-foreground font-normal">Sistema de Ventajas en Desarrollo</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
                <p className="text-muted-foreground text-lg">Actualmente no hay ventajas pasivas disponibles para desbloquear.</p>
                <p className="text-sm text-muted-foreground">¡Vuelve pronto! Estamos trabajando en añadir nuevas formas de potenciar tu desarrollo.</p>
            </CardContent>
        </Card>
      )}

      {PASSIVE_SKILLS_DATA.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PASSIVE_SKILLS_DATA.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isUnlocked={unlockedSkillIds.includes(skill.id)}
              canUnlock={userXP >= skill.cost && !unlockedSkillIds.includes(skill.id)}
              onUnlock={handleUnlockSkill}
              isUnlocking={isUnlockingGlobal}
            />
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          Nota: Los efectos de las Ventajas Pasivas son actualmente descriptivos. La funcionalidad completa que altere las mecánicas del juego (ej. bonos de XP) se implementará en futuras actualizaciones.
        </p>
      </div>
    </div>
  );
}
