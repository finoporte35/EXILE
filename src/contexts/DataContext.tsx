
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

  useEffect(() => {
    setIsLoading(true);
    const storedUserName = localStorage.getItem('username');
    const storedUserXP = localStorage.getItem('userXP');
    const storedHabits = localStorage.getItem('habits');

    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setUserName(DEFAULT_USERNAME);
      // localStorage.setItem('username', DEFAULT_USERNAME); // Save default if not found
    }

    if (storedUserXP) {
      setUserXP(Number(storedUserXP));
    } else {
      setUserXP(INITIAL_XP);
      // localStorage.setItem('userXP', String(INITIAL_XP)); // Save default if not found
    }

    if (storedHabits) {
      try {
        const parsedHabits = JSON.parse(storedHabits);
        if (Array.isArray(parsedHabits)) {
            setHabits(parsedHabits);
        } else {
            console.error("Stored habits are not an array, resetting.");
            setHabits([]);
            // localStorage.setItem('habits', JSON.stringify([]));
        }
      } catch (e) {
        console.error("Error parsing habits from localStorage, resetting.", e);
        setHabits([]);
        // localStorage.setItem('habits', JSON.stringify([])); 
      }
    } else {
      setHabits([]);
      // localStorage.setItem('habits', JSON.stringify([])); 
    }
    
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
            streak: newCompletedStatus ? habit.streak + 1 : Math.max(0, habit.streak -1) , 
          };
        }
        return habit;
      });
      setUserXP(currentXP => Math.max(0, currentXP + xpChange));
      return updatedHabits;
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
            progressPercent = 100; // Should be 100 if it's the first rank and XP met or exceeded
        }
    } else { // This covers the very first rank where xpRequired is 0
        if (RANKS_DATA.length > 1 && RANKS_DATA[1].xpRequired > 0) { // if there's a next rank
            totalXPForLevel = RANKS_DATA[1].xpRequired;
            progressPercent = totalXPForLevel > 0 ? (userXP / totalXPForLevel) * 100 : 0;
        } else { // Only one rank in the system or first rank is also max rank
            progressPercent = userXP > 0 ? 100:0; // or 100 if any XP means 100% of the only rank
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

  if (isLoading && typeof window !== 'undefined') {
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
