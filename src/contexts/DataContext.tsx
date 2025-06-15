
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP, INITIAL_GOALS, DEFAULT_GOAL_XP } from '@/lib/app-config';
import type { Habit, Attribute, Goal } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface DataContextState {
  userName: string;
  userXP: number;
  habits: Habit[];
  attributes: Attribute[];
  goals: Goal[];
  currentRank: Rank;
  nextRank: Rank | null;
  xpTowardsNextRank: number;
  totalXPForNextRankLevel: number; 
  rankProgressPercent: number;
  totalHabits: number;
  completedHabits: number;
  activeGoalsCount: number;
  addHabit: (name: string, category: string) => void;
  toggleHabit: (id: string) => void;
  addGoal: (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => void;
  toggleGoalCompletion: (id: string) => void;
  deleteGoal: (id: string) => void;
  setUserNameState: (name: string) => void; 
  isLoading: boolean;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  useEffect(() => {
    setIsLoading(true);
    const storedUserName = localStorage.getItem('username');
    const storedUserXP = localStorage.getItem('userXP');
    const storedHabits = localStorage.getItem('habits');
    const storedGoals = localStorage.getItem('goals');
    const storedAvatar = localStorage.getItem('userAvatar'); // To ensure avatar is reset if we clear everything

    // Reset logic - if these keys don't exist, it implies a fresh start or data wipe.
    // This part implements the "reset if no data" behavior
    if (!storedUserName && !storedUserXP && !storedHabits && !storedGoals && !storedAvatar) {
        localStorage.removeItem('username');
        localStorage.removeItem('userXP');
        localStorage.removeItem('habits');
        localStorage.removeItem('goals');
        localStorage.removeItem('userAvatar');
        setUserName(DEFAULT_USERNAME);
        setUserXP(INITIAL_XP);
        setHabits([]);
        setGoals(INITIAL_GOALS);
        setAttributes(INITIAL_ATTRIBUTES.map(attr => ({ ...attr, value: 0, currentLevel: "0/100", xpInArea: "0/1000" })));
    } else {
        setUserName(storedUserName || DEFAULT_USERNAME);
        setUserXP(Number(storedUserXP) || INITIAL_XP);

        try {
            setHabits(storedHabits ? JSON.parse(storedHabits) : []);
        } catch (e) {
            console.error("Error parsing habits, resetting to empty.", e);
            setHabits([]);
        }
        try {
            setGoals(storedGoals ? JSON.parse(storedGoals) : INITIAL_GOALS);
        } catch (e) {
            console.error("Error parsing goals, resetting to empty.", e);
            setGoals(INITIAL_GOALS);
        }
        setAttributes(INITIAL_ATTRIBUTES.map(attr => ({ ...attr, value: 0, currentLevel: "0/100", xpInArea: "0/1000" }))); // Ensure attributes start at 0
    }
    
    setIsLoading(false);
  }, []); 

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('username', userName);
      localStorage.setItem('userXP', String(userXP));
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [userName, userXP, habits, goals, isLoading]);


  const setUserNameState = useCallback((name: string) => {
    setUserName(name);
  }, []);

  const addHabit = useCallback((name: string, category: string) => {
    const newHabit: Habit = {
      id: String(Date.now()),
      name,
      category,
      completed: false,
      xp: HABIT_CATEGORY_XP_MAP[category] || DEFAULT_HABIT_XP,
      streak: 0,
    };
    setHabits(prev => [newHabit, ...prev]);
  }, []);

  const toggleHabit = useCallback((id: string) => {
    let xpChange = 0;
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === id) {
          const newCompletedStatus = !habit.completed;
          xpChange = newCompletedStatus ? habit.xp : -habit.xp;
          return {
            ...habit,
            completed: newCompletedStatus,
            streak: newCompletedStatus ? habit.streak + 1 : Math.max(0, habit.streak -1) , 
          };
        }
        return habit;
      })
    );
    setUserXP(currentXP => Math.max(0, currentXP + xpChange));
  }, []);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: String(Date.now()),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
  }, []);

  const toggleGoalCompletion = useCallback((id: string) => {
    let xpChange = 0;
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id === id) {
          const newCompletedStatus = !goal.isCompleted;
          xpChange = newCompletedStatus ? goal.xp : -goal.xp;
          return { ...goal, isCompleted: newCompletedStatus };
        }
        return goal;
      })
    );
    setUserXP(currentXP => Math.max(0, currentXP + xpChange));
  }, []);
  
  const deleteGoal = useCallback((id: string) => {
    setGoals(prevGoals => {
      const goalToDelete = prevGoals.find(g => g.id === id);
      if (goalToDelete && goalToDelete.isCompleted) {
        // Optionally deduct XP if a completed goal is deleted
        // setUserXP(currentXP => Math.max(0, currentXP - goalToDelete.xp));
      }
      return prevGoals.filter(goal => goal.id !== id);
    });
  }, []);
  
  const { currentRank, nextRank, xpTowardsNextRank, totalXPForNextRankLevel, rankProgressPercent } = React.useMemo(() => {
    let currentRankCalculated: Rank = RANKS_DATA[0];
    let nextRankCalculated: Rank | null = null;

    for (let i = 0; i < RANKS_DATA.length; i++) {
      if (userXP >= RANKS_DATA[i].xpRequired) {
        currentRankCalculated = RANKS_DATA[i];
        if (i + 1 < RANKS_DATA.length) {
          nextRankCalculated = RANKS_DATA[i + 1];
        } else {
          nextRankCalculated = null; 
        }
      } else {
        break; 
      }
    }
    
    let xpTowardsNext = 0;
    let totalXPForLevel = 100; 
    let progressPercent = 0;

    if (nextRankCalculated) {
      xpTowardsNext = userXP - currentRankCalculated.xpRequired;
      totalXPForLevel = nextRankCalculated.xpRequired - currentRankCalculated.xpRequired;
      progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 0;
    } else if (currentRankCalculated.xpRequired > 0) { 
        xpTowardsNext = userXP - currentRankCalculated.xpRequired;
        const prevRankIndex = RANKS_DATA.findIndex(r => r.name === currentRankCalculated.name) -1;
        if (prevRankIndex >=0) {
            totalXPForLevel = currentRankCalculated.xpRequired - RANKS_DATA[prevRankIndex].xpRequired;
            progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 100;
             if (userXP >= currentRankCalculated.xpRequired) progressPercent = 100;
        } else { 
            progressPercent = 100; 
        }
    } else { 
        if (RANKS_DATA.length > 1 && RANKS_DATA[1].xpRequired > 0) { 
            totalXPForLevel = RANKS_DATA[1].xpRequired;
            progressPercent = totalXPForLevel > 0 ? (userXP / totalXPForLevel) * 100 : 0;
        } else { 
            progressPercent = userXP > 0 ? 100:0; 
        }
    }
     if (userXP >= currentRankCalculated.xpRequired && !nextRankCalculated) { 
      progressPercent = 100;
    }

    return { 
      currentRank: currentRankCalculated, 
      nextRank: nextRankCalculated, 
      xpTowardsNextRank: xpTowardsNext,
      totalXPForNextRankLevel: totalXPForLevel,
      rankProgressPercent: Math.min(100, Math.max(0, progressPercent))
    };
  }, [userXP]);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const activeGoalsCount = goals.filter(g => !g.isCompleted).length;

  if (isLoading && typeof window !== 'undefined') {
     return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        {/* Icono de carga Loader2 u otro SVG/Spinner aquí */}
        <p className="text-xl text-foreground">Cargando Datos...</p>
      </div>
     );
  }


  return (
    <DataContext.Provider value={{
      userName,
      userXP,
      habits,
      attributes,
      goals,
      currentRank,
      nextRank,
      xpTowardsNextRank,
      totalXPForNextRankLevel,
      rankProgressPercent,
      totalHabits,
      completedHabits,
      activeGoalsCount,
      addHabit,
      toggleHabit,
      addGoal,
      toggleGoalCompletion,
      deleteGoal,
      setUserNameState,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextState => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
