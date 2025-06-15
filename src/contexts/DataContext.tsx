
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP, INITIAL_GOALS, DEFAULT_GOAL_XP, INITIAL_SLEEP_LOGS } from '@/lib/app-config';
import type { Habit, Attribute, Goal, SleepLog, SleepQuality } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { differenceInMilliseconds, parse } from 'date-fns';

interface DataContextState {
  userName: string;
  userXP: number;
  habits: Habit[];
  attributes: Attribute[];
  goals: Goal[];
  sleepLogs: SleepLog[];
  currentRank: Rank;
  nextRank: Rank | null;
  xpTowardsNextRank: number;
  totalXPForNextRankLevel: number; 
  rankProgressPercent: number;
  totalHabits: number;
  completedHabits: number;
  activeGoalsCount: number;
  averageSleepLast7Days: string;
  addHabit: (name: string, category: string) => void;
  toggleHabit: (id: string) => void;
  addGoal: (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => void;
  toggleGoalCompletion: (id: string) => void;
  deleteGoal: (id: string) => void;
  addSleepLog: (logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => void;
  deleteSleepLog: (id: string) => void;
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
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(INITIAL_SLEEP_LOGS);

  useEffect(() => {
    setIsLoading(true);
    const storedUserName = localStorage.getItem('username');
    const storedUserXP = localStorage.getItem('userXP');
    const storedHabits = localStorage.getItem('habits');
    const storedGoals = localStorage.getItem('goals');
    const storedSleepLogs = localStorage.getItem('sleepLogs');
    
    if (!storedUserName && !storedUserXP && !storedHabits && !storedGoals && !storedSleepLogs) {
        localStorage.removeItem('username');
        localStorage.removeItem('userXP');
        localStorage.removeItem('habits');
        localStorage.removeItem('goals');
        localStorage.removeItem('userAvatar');
        localStorage.removeItem('sleepLogs');
        setUserName(DEFAULT_USERNAME);
        setUserXP(INITIAL_XP);
        setHabits([]);
        setGoals(INITIAL_GOALS);
        setSleepLogs(INITIAL_SLEEP_LOGS);
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
         try {
            setSleepLogs(storedSleepLogs ? JSON.parse(storedSleepLogs) : INITIAL_SLEEP_LOGS);
        } catch (e) {
            console.error("Error parsing sleep logs, resetting to empty.", e);
            setSleepLogs(INITIAL_SLEEP_LOGS);
        }
        setAttributes(INITIAL_ATTRIBUTES.map(attr => ({ ...attr, value: 0, currentLevel: "0/100", xpInArea: "0/1000" })));
    }
    
    setIsLoading(false);
  }, []); 

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('username', userName);
      localStorage.setItem('userXP', String(userXP));
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('goals', JSON.stringify(goals));
      localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs));
    }
  }, [userName, userXP, habits, goals, sleepLogs, isLoading]);


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
    setGoals(prev => [newGoal, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
      return prevGoals.filter(goal => goal.id !== id);
    });
  }, []);

  const addSleepLog = useCallback((logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => {
    const { date, timeToBed, timeWokeUp, quality, notes } = logData;

    const baseDate = new Date(date); // This is the day the sleep period *started*

    // Parse time strings "HH:mm"
    const [bedHours, bedMinutes] = timeToBed.split(':').map(Number);
    const [wokeHours, wokeMinutes] = timeWokeUp.split(':').map(Number);

    let bedDateTime = new Date(baseDate);
    bedDateTime.setHours(bedHours, bedMinutes, 0, 0);

    let wokeDateTime = new Date(baseDate); // Initially assume same day
    wokeDateTime.setHours(wokeHours, wokeMinutes, 0, 0);

    // If wokeDateTime is earlier than bedDateTime, it means user woke up the next day
    if (wokeDateTime < bedDateTime) {
      wokeDateTime.setDate(wokeDateTime.getDate() + 1);
    }
    
    const durationMs = differenceInMilliseconds(wokeDateTime, bedDateTime);
    const sleepDurationHours = Math.max(0, durationMs / (1000 * 60 * 60)); // in hours

    const newLog: SleepLog = {
      id: String(Date.now()),
      date: baseDate.toISOString(),
      timeToBed,
      timeWokeUp,
      sleepDurationHours: parseFloat(sleepDurationHours.toFixed(2)),
      quality,
      notes,
      createdAt: new Date().toISOString(),
    };
    setSleepLogs(prev => [newLog, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    // Optionally add XP for logging sleep
    // setUserXP(currentXP => currentXP + (DEFAULT_SLEEP_LOG_XP || 0));
  }, []);

  const deleteSleepLog = useCallback((id: string) => {
    setSleepLogs(prev => prev.filter(log => log.id !== id));
    // Optionally deduct XP if an Xp was awarded
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

  const averageSleepLast7Days = React.useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSleepLogs = sleepLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
    if (recentSleepLogs.length === 0) return "0 hrs";
    
    const totalSleepHours = recentSleepLogs.reduce((sum, log) => sum + log.sleepDurationHours, 0);
    const average = totalSleepHours / recentSleepLogs.length;
    return `${average.toFixed(1)} hrs`;
  }, [sleepLogs]);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const activeGoalsCount = goals.filter(g => !g.isCompleted).length;

  if (isLoading && typeof window !== 'undefined') {
     return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
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
      sleepLogs,
      currentRank,
      nextRank,
      xpTowardsNextRank,
      totalXPForNextRankLevel,
      rankProgressPercent,
      totalHabits,
      completedHabits,
      activeGoalsCount,
      averageSleepLast7Days,
      addHabit,
      toggleHabit,
      addGoal,
      toggleGoalCompletion,
      deleteGoal,
      addSleepLog,
      deleteSleepLog,
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

