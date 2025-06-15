
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Zap, Filter } from "lucide-react";
import HabitItem from "./HabitItem";
import HabitProgressChart from './HabitProgressChart';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from '@/contexts/DataContext';
import { HABIT_CATEGORIES } from '@/lib/app-config';
import type { Habit } from '@/types'; // Ensure Habit type is imported

export default function HabitTracker() {
  const { habits, addHabit: contextAddHabit, toggleHabit, userXP } = useData();
  const [newHabitName, setNewHabitName] = useState('');
  // Default to first real category, excluding "Todos"
  const availableCategories = HABIT_CATEGORIES;
  const [newHabitCategory, setNewHabitCategory] = useState(availableCategories[0]);
  const [filter, setFilter] = useState<string>("Todos");

  const handleAddHabit = () => {
    if (newHabitName.trim() === '') return;
    contextAddHabit(newHabitName, newHabitCategory);
    setNewHabitName('');
    // setNewHabitCategory(availableCategories[0]); // Optionally reset category
  };

  const totalXPFromCompletedHabits = useMemo(() => habits.reduce((sum, habit) => sum + (habit.completed ? habit.xp : 0), 0), [habits]);
  const maxPossibleXPFromHabits = useMemo(() => habits.reduce((sum, habit) => sum + habit.xp, 0), [habits]);
  const progressPercentage = maxPossibleXPFromHabits > 0 ? (totalXPFromCompletedHabits / maxPossibleXPFromHabits) * 100 : 0;
  
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => setAnimatedProgress(progressPercentage), 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const filteredHabits = useMemo(() => {
    if (filter === "Todos") return habits;
    return habits.filter(habit => habit.category === filter);
  }, [habits, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-card rounded-lg shadow">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Añadir nuevo hábito..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="w-full"
            aria-label="Nuevo hábito"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
        <Select value={newHabitCategory} onValueChange={setNewHabitCategory}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Categoría de nuevo hábito">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddHabit} className="bg-new-button-gradient text-primary-foreground hover:opacity-90 whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2 text-lg">
          <Zap className="h-6 w-6 text-yellow-400" />
          <span className="font-semibold text-foreground">XP Hoy (Hábitos): {totalXPFromCompletedHabits} / {maxPossibleXPFromHabits}</span>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
           <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar hábitos por categoría">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              {["Todos", ...availableCategories].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Progreso Diario de XP (Hábitos)</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress 
            value={animatedProgress} 
            className="h-3 bg-secondary" 
            indicatorClassName="bg-main-gradient" 
            aria-label={`Progreso diario de XP de hábitos: ${Math.round(progressPercentage)}%`} 
        />
      </div>

      {filteredHabits.length > 0 ? (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No hay hábitos en esta categoría o aún no has añadido ninguno. ¡Añade algunos para empezar!
        </p>
      )}
      
      <div className="mt-8">
        <HabitProgressChart habits={habits} />
      </div>
    </div>
  );
}
