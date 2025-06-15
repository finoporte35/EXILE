
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP } from '@/lib/app-config';
import type { Habit, Attribute } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface DataContextState {
  userName: string;
  userXP: number;
  habits: Habit[];
  attributes: Attribute[];
  currentRank: Rank;
  nextRank: Rank | null;
  xpTowardsNextRank: number;
  totalXPForNextRankLevel: number; 
  rankProgressPercent: number;
  totalHabits: number;
  completedHabits: number;
  addHabit: (name: string, category: string) => void;
  toggleHabit: (id: string) => void;
  setUserNameState: (name: string) => void; // To allow signup form to update context
  isLoading: boolean;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);

  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) setUserName(storedName);

    const storedXP = localStorage.getItem('userXP');
    if (storedXP) setUserXP(Number(storedXP));
    
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) setHabits(JSON.parse(storedHabits));
    
    // Attributes are not stored in localStorage for now, use initial.
    // If you want to persist attribute changes, add localStorage logic here.
    setAttributes(INITIAL_ATTRIBUTES);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('username', userName);
    }
  }, [userName, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('userXP', String(userXP));
    }
  }, [userXP, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, isLoading]);


  const setUserNameState = useCallback((name: string) => {
    setUserName(name);
    // localStorage saving is handled by the useEffect above
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
    setHabits(prevHabits => {
      let xpChange = 0;
      const updatedHabits = prevHabits.map(habit => {
        if (habit.id === id) {
          const newCompletedStatus = !habit.completed;
          xpChange = newCompletedStatus ? habit.xp : -habit.xp;
          return {
            ...habit,
            completed: newCompletedStatus,
            streak: newCompletedStatus ? habit.streak + 1 : Math.max(0, habit.streak -1) , // Basic streak logic
          };
        }
        return habit;
      });
      setUserXP(currentXP => Math.max(0, currentXP + xpChange));
      return updatedHabits;
    });
  }, []);
  
  const { currentRank, nextRank, xpTowardsNextRank, totalXPForNextRankLevel, rankProgressPercent } = React.useMemo(() => {
    let currentRank: Rank = RANKS_DATA[0];
    let nextRank: Rank | null = null;

    for (let i = 0; i < RANKS_DATA.length; i++) {
      if (userXP >= RANKS_DATA[i].xpRequired) {
        currentRank = RANKS_DATA[i];
        if (i + 1 < RANKS_DATA.length) {
          nextRank = RANKS_DATA[i + 1];
        } else {
          nextRank = null; // Max rank
        }
      } else {
        break; 
      }
    }
    
    let xpTowardsNext = 0;
    let totalXPForLevel = 100; // Default if max rank or only one rank
    let progressPercent = 0;

    if (nextRank) {
      xpTowardsNext = userXP - currentRank.xpRequired;
      totalXPForLevel = nextRank.xpRequired - currentRank.xpRequired;
      progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 0;
    } else if (currentRank.xpRequired > 0) { // Max rank but not the very first rank
        xpTowardsNext = userXP - currentRank.xpRequired;
        // Find previous rank to define the "level" span for 100%
        const prevRankIndex = RANKS_DATA.findIndex(r => r.name === currentRank.name) -1;
        if (prevRankIndex >=0) {
            totalXPForLevel = currentRank.xpRequired - RANKS_DATA[prevRankIndex].xpRequired;
            progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 100;
             if (userXP >= currentRank.xpRequired) progressPercent = 100;
        } else { // Only one rank defined or at the first rank and it's max
            progressPercent = 100;
        }
    } else { // At the very first rank and it's the only/max rank
        progressPercent = 100;
    }
     if (userXP >= currentRank.xpRequired && !nextRank) { // handles being exactly at max rank
      progressPercent = 100;
    }


    return { 
      currentRank, 
      nextRank, 
      xpTowardsNextRank: xpTowardsNext,
      totalXPForNextRankLevel: totalXPForLevel,
      rankProgressPercent: Math.min(100, Math.max(0, progressPercent))
    };
  }, [userXP]);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;

  if (isLoading && typeof window !== 'undefined') {
     // This basic loader avoids SSR/hydration issues with more complex loaders inside context during init
    return <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4"><p className="text-xl text-foreground">Cargando Datos...</p></div>;
  }


  return (
    <DataContext.Provider value={{
      userName,
      userXP,
      habits,
      attributes,
      currentRank,
      nextRank,
      xpTowardsNextRank,
      totalXPForNextRankLevel,
      rankProgressPercent,
      totalHabits,
      completedHabits,
      addHabit,
      toggleHabit,
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
