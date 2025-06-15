
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP, INITIAL_GOALS, DEFAULT_GOAL_XP, INITIAL_SLEEP_LOGS } from '@/lib/app-config';
import type { Habit, Attribute, Goal, SleepLog, SleepQuality } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { differenceInMilliseconds, parse, isValid, parseISO as dateFnsParseISO } from 'date-fns';
import { db } from '@/lib/firebase'; 
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore';


const MOCK_USER_ID = "default-exile-user";

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
  dataLoadingError: Error | null;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadingError, setDataLoadingError] = useState<Error | null>(null);
  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(INITIAL_SLEEP_LOGS);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setDataLoadingError(null);
      console.log("DataContext: Attempting to load data for user:", MOCK_USER_ID);
      
      if (!MOCK_USER_ID) {
        console.error("DataContext: User ID is not available. Cannot load data.");
        setDataLoadingError(new Error("User ID not available. Cannot load data."));
        setIsLoading(false);
        return;
      }
      
      try {
        const userDocRef = doc(db, "users", MOCK_USER_ID);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserName(userData.username || DEFAULT_USERNAME);
          setUserXP(userData.xp || INITIAL_XP);
          console.log("DataContext: User profile data loaded:", userData);
        } else {
          console.log("DataContext: No user profile found for", MOCK_USER_ID, ". Creating with defaults.");
          await setDoc(userDocRef, {
            username: DEFAULT_USERNAME,
            xp: INITIAL_XP,
            createdAt: serverTimestamp()
          });
          setUserName(DEFAULT_USERNAME);
          setUserXP(INITIAL_XP);
        }

        const habitsColRef = collection(db, "users", MOCK_USER_ID, "habits");
        const habitsQuery = query(habitsColRef, orderBy("createdAt", "desc"));
        const habitsSnapshot = await getDocs(habitsQuery);
        const loadedHabits = habitsSnapshot.docs.map(d => {
            const data = d.data();
            return { 
                id: d.id, 
                ...data, 
                lastCompletedDate: data.lastCompletedDate || undefined, // Ensure field is handled
                createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()).toISOString() 
            } as Habit;
        });
        setHabits(loadedHabits);
        console.log("DataContext: Habits loaded:", loadedHabits.length);

        const goalsColRef = collection(db, "users", MOCK_USER_ID, "goals");
        const goalsQuery = query(goalsColRef, orderBy("createdAt", "desc"));
        const goalsSnapshot = await getDocs(goalsQuery);
        const loadedGoals = goalsSnapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timeBound: (data.timeBound instanceof Timestamp ? data.timeBound.toDate() : new Date(data.timeBound)).toISOString(),
            createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()).toISOString(),
          } as Goal;
        });
        setGoals(loadedGoals);
        console.log("DataContext: Goals loaded:", loadedGoals.length);
        
        const sleepLogsColRef = collection(db, "users", MOCK_USER_ID, "sleepLogs");
        const sleepLogsQuery = query(sleepLogsColRef, orderBy("date", "desc"));
        const sleepLogsSnapshot = await getDocs(sleepLogsQuery);
        const loadedSleepLogs = sleepLogsSnapshot.docs.map(s => {
            const data = s.data();
            return {
                id: s.id,
                ...data,
                date: (data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)).toISOString(),
                createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()).toISOString(),
            } as SleepLog;
        });
        setSleepLogs(loadedSleepLogs);
        console.log("DataContext: Sleep logs loaded:", loadedSleepLogs.length);

        console.log("DataContext: Successfully loaded all data for", MOCK_USER_ID);

      } catch (error: any) {
        console.error("DataContext: Error loading data from Firestore for", MOCK_USER_ID, error);
        setDataLoadingError(error); 
        setUserName(prev => prev || DEFAULT_USERNAME);
        setUserXP(prev => prev || INITIAL_XP);
        setHabits(prev => prev.length > 0 ? prev : []);
        setGoals(prev => prev.length > 0 ? prev : INITIAL_GOALS); 
        setSleepLogs(prev => prev.length > 0 ? prev : INITIAL_SLEEP_LOGS);
      } finally {
        setIsLoading(false);
        console.log("DataContext: Loading complete. isLoading set to false.");
      }
    };

    loadData();
  }, []);


  const setUserNameState = useCallback(async (name: string) => {
    setUserName(name);
    if (MOCK_USER_ID) {
      const userDocRef = doc(db, "users", MOCK_USER_ID);
      try {
        await updateDoc(userDocRef, { username: name });
        console.log("DataContext: Username updated in Firestore for", MOCK_USER_ID);
      } catch (error) {
        console.error("DataContext: Error updating username in Firestore for", MOCK_USER_ID, error);
      }
    }
  }, []);

  const updateUserXPInFirestore = useCallback(async (newXP: number) => {
      if (MOCK_USER_ID) {
          const userDocRef = doc(db, "users", MOCK_USER_ID);
          try {
              await updateDoc(userDocRef, { xp: newXP });
              console.log("DataContext: User XP updated in Firestore for", MOCK_USER_ID, "to", newXP);
          } catch (error) {
              console.error("DataContext: Error updating user XP in Firestore for", MOCK_USER_ID, error);
          }
      }
  }, []);


  const addHabit = useCallback(async (name: string, category: string) => {
    if (!MOCK_USER_ID) {
        console.error("DataContext: MOCK_USER_ID not available, cannot add habit.");
        return;
    }
    const habitXP = HABIT_CATEGORY_XP_MAP[category] || DEFAULT_HABIT_XP;
    const newHabitData = {
      name,
      category,
      completed: false,
      xp: habitXP,
      streak: 0,
      lastCompletedDate: undefined, // Initialize new field
      createdAt: serverTimestamp() 
    };
    try {
      const habitsColRef = collection(db, "users", MOCK_USER_ID, "habits");
      const docRef = await addDoc(habitsColRef, newHabitData);
      
      const newHabitForState: Habit = { 
        id: docRef.id, 
        name: newHabitData.name,
        category: newHabitData.category,
        completed: newHabitData.completed,
        xp: newHabitData.xp,
        streak: newHabitData.streak,
        lastCompletedDate: newHabitData.lastCompletedDate,
        createdAt: new Date().toISOString() 
      };
      setHabits(prev => [newHabitForState, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      console.log("DataContext: Habit added successfully. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding habit to Firestore for", MOCK_USER_ID, error);
    }
  }, [MOCK_USER_ID]);

  const toggleHabit = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) {
        console.error("DataContext: MOCK_USER_ID not available, cannot toggle habit.");
        return;
    }
    
    const originalHabits = [...habits];
    const originalXP = userXP;
    const habitToToggle = originalHabits.find(h => h.id === id);

    if (!habitToToggle) {
        console.error("DataContext: Habit with ID not found for toggling:", id);
        return;
    }

    const newCompletedStatus = !habitToToggle.completed;
    let xpChange = newCompletedStatus ? habitToToggle.xp : -habitToToggle.xp;
    let newTotalXP = Math.max(0, userXP + xpChange);

    let newStreak = habitToToggle.streak;
    let newLastCompletedDate = habitToToggle.lastCompletedDate;
    const todayDateString = new Date().toISOString().split('T')[0];

    if (newCompletedStatus) { // Marking as complete
        if (habitToToggle.lastCompletedDate !== todayDateString) {
            newStreak = habitToToggle.streak + 1;
            newLastCompletedDate = todayDateString;
        }
    } else { // Marking as incomplete
        if (habitToToggle.lastCompletedDate === todayDateString) {
            // If it was completed today and is now being unchecked, revert today's streak increment.
            newStreak = Math.max(0, habitToToggle.streak - 1);
            newLastCompletedDate = undefined; // Or set to yesterday if more complex logic is needed
        }
        // If unchecking a habit completed on a previous day, streak and lastCompletedDate remain.
    }
    
    const updatedHabitClientData: Partial<Habit> = {
        completed: newCompletedStatus,
        streak: newStreak,
        lastCompletedDate: newLastCompletedDate,
    };

    const updatedHabitFirestoreData: any = { ...updatedHabitClientData };
    if (updatedHabitFirestoreData.lastCompletedDate === undefined) {
        updatedHabitFirestoreData.lastCompletedDate = null; // Firestore prefers null for removal
    }


    const newHabitsState = habits.map(h => 
        h.id === id ? { ...h, ...updatedHabitClientData } : h
    );
    
    setHabits(newHabitsState);
    setUserXP(newTotalXP);

    const habitDocRef = doc(db, "users", MOCK_USER_ID, "habits", id);
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    const batch = writeBatch(db);

    batch.update(habitDocRef, updatedHabitFirestoreData);
    batch.update(userDocRef, { xp: newTotalXP });
        
    try {
        await batch.commit();
        console.log("DataContext: Habit toggled & XP updated in Firestore. ID:", id, "New streak:", newStreak, "Last completed:", newLastCompletedDate);
    } catch (error) {
        console.error("DataContext: Error toggling habit/updating XP in Firestore. Reverting. ID:", id, error);
        setHabits(originalHabits);
        setUserXP(originalXP);
    }
  }, [userXP, habits, MOCK_USER_ID]);


  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => {
    if (!MOCK_USER_ID) {
        console.error("DataContext: MOCK_USER_ID not available, cannot add goal.");
        return;
    }
    const newGoalFirestoreData = {
      ...goalData,
      timeBound: Timestamp.fromDate(new Date(goalData.timeBound)),
      isCompleted: false,
      createdAt: serverTimestamp()
    };
    try {
      const goalsColRef = collection(db, "users", MOCK_USER_ID, "goals");
      const docRef = await addDoc(goalsColRef, newGoalFirestoreData);
      const newGoalForState: Goal = { 
        id: docRef.id, 
        ...goalData, 
        isCompleted: false, 
        createdAt: new Date().toISOString() 
      };
      setGoals(prev => [newGoalForState, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      console.log("DataContext: Goal added successfully. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding goal to Firestore for", MOCK_USER_ID, error);
    }
  }, [MOCK_USER_ID]);

  const toggleGoalCompletion = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) {
        console.error("DataContext: MOCK_USER_ID not available, cannot toggle goal completion.");
        return;
    }
    
    const originalGoals = [...goals];
    const originalXP = userXP;
    const goalToToggle = originalGoals.find(g => g.id === id);

    if (!goalToToggle) {
        console.error("DataContext: Goal with ID not found for toggling:", id);
        return;
    }

    const newCompletedStatus = !goalToToggle.isCompleted;
    let xpChange = newCompletedStatus ? goalToToggle.xp : -goalToToggle.xp;
    let newTotalXP = Math.max(0, userXP + xpChange);
    
    const newGoalsState = goals.map(goal => 
        goal.id === id ? { ...goal, isCompleted: newCompletedStatus } : goal
    );
    
    setGoals(newGoalsState);
    setUserXP(newTotalXP);
    
    const goalDocRef = doc(db, "users", MOCK_USER_ID, "goals", id);
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    const batch = writeBatch(db);

    batch.update(goalDocRef, { isCompleted: newCompletedStatus });
    batch.update(userDocRef, { xp: newTotalXP });
    
    try {
        await batch.commit();
        console.log("DataContext: Goal completion toggled & XP updated in Firestore. Goal ID:", id);
    } catch (error) {
        console.error("DataContext: Error toggling goal completion/updating XP. Reverting. Goal ID:", id, error);
        setGoals(originalGoals);
        setUserXP(originalXP);
    }
  }, [userXP, goals, MOCK_USER_ID]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) {
      console.error("DataContext: MOCK_USER_ID not available, cannot delete goal.");
      return;
    }
    const originalGoals = [...goals];
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    
    const goalDocRef = doc(db, "users", MOCK_USER_ID, "goals", id);
    try {
      await deleteDoc(goalDocRef);
      console.log("DataContext: Goal deleted successfully from Firestore. ID:", id);
    } catch (error) {
      console.error("DataContext: Error deleting goal from Firestore. Reverting. ID:", id, error);
      setGoals(originalGoals); 
    }
  }, [goals, MOCK_USER_ID]);

  const addSleepLog = useCallback(async (logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => {
    if (!MOCK_USER_ID) {
        console.error("DataContext: MOCK_USER_ID not available, cannot add sleep log.");
        return;
    }
    const { date, timeToBed, timeWokeUp, quality, notes } = logData;

    const baseDate = new Date(date); 
    const [bedHoursStr, bedMinutesStr] = timeToBed.split(':');
    const [wokeHoursStr, wokeMinutesStr] = timeWokeUp.split(':');

    const bedHours = parseInt(bedHoursStr, 10);
    const bedMinutes = parseInt(bedMinutesStr, 10);
    const wokeHours = parseInt(wokeHoursStr, 10);
    const wokeMinutes = parseInt(wokeMinutesStr, 10);
    
    if (isNaN(bedHours) || isNaN(bedMinutes) || isNaN(wokeHours) || isNaN(wokeMinutes)) {
        console.error("DataContext: Invalid time format for sleep log.", logData);
        return;
    }

    let bedDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), bedHours, bedMinutes, 0, 0);
    let wokeDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), wokeHours, wokeMinutes, 0, 0);
    
    if (wokeDateTime.getTime() <= bedDateTime.getTime()) { 
      wokeDateTime.setDate(wokeDateTime.getDate() + 1);
    }
    
    const durationMs = wokeDateTime.getTime() - bedDateTime.getTime();
    const sleepDurationHours = Math.max(0, durationMs / (1000 * 60 * 60));

    const newLogFirestoreData = {
      date: Timestamp.fromDate(baseDate), 
      timeToBed,
      timeWokeUp,
      sleepDurationHours: parseFloat(sleepDurationHours.toFixed(2)),
      quality,
      notes: notes || "",
      createdAt: serverTimestamp()
    };

    try {
      const sleepLogsColRef = collection(db, "users", MOCK_USER_ID, "sleepLogs");
      const docRef = await addDoc(sleepLogsColRef, newLogFirestoreData);
      const newLogForState: SleepLog = {
          id: docRef.id, 
          date: baseDate.toISOString(), 
          timeToBed: newLogFirestoreData.timeToBed,
          timeWokeUp: newLogFirestoreData.timeWokeUp,
          sleepDurationHours: newLogFirestoreData.sleepDurationHours,
          quality: newLogFirestoreData.quality as SleepQuality,
          notes: newLogFirestoreData.notes,
          createdAt: new Date().toISOString() 
      };
      setSleepLogs(prev => [...prev, newLogForState].sort((a,b) => dateFnsParseISO(b.date).getTime() - dateFnsParseISO(a.date).getTime() || dateFnsParseISO(b.createdAt).getTime() - dateFnsParseISO(a.createdAt).getTime()));
      console.log("DataContext: Sleep log added successfully. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding sleep log to Firestore for", MOCK_USER_ID, error);
    }
  }, [MOCK_USER_ID]);

  const deleteSleepLog = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) {
      console.error("DataContext: MOCK_USER_ID not available, cannot delete sleep log.");
      return;
    }
    const originalLogs = [...sleepLogs];
    setSleepLogs(prev => prev.filter(log => log.id !== id));
    const sleepLogDocRef = doc(db, "users", MOCK_USER_ID, "sleepLogs", id);
    try {
      await deleteDoc(sleepLogDocRef);
      console.log("DataContext: Sleep log deleted successfully from Firestore. ID:", id);
    } catch (error) {
      console.error("DataContext: Error deleting sleep log from Firestore. Reverting. ID:", id, error);
      setSleepLogs(originalLogs);
    }
  }, [sleepLogs, MOCK_USER_ID]);

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

    const currentRankXpRequirement = currentRankCalculated.xpRequired;

    if (nextRankCalculated) {
      const nextRankXpRequirement = nextRankCalculated.xpRequired;
      xpTowardsNext = Math.max(0, userXP - currentRankXpRequirement);
      totalXPForLevel = Math.max(1, nextRankXpRequirement - currentRankXpRequirement); 
      progressPercent = (xpTowardsNext / totalXPForLevel) * 100;
    } else { 
      if (RANKS_DATA.length === 1) {
        totalXPForLevel = currentRankXpRequirement > 0 ? currentRankXpRequirement : 100; 
        xpTowardsNext = userXP;
      } else { 
         const currentRankIndex = RANKS_DATA.findIndex(r => r.name === currentRankCalculated.name);
         if (currentRankIndex > 0) { 
            const previousRankXp = RANKS_DATA[currentRankIndex - 1].xpRequired;
            totalXPForLevel = Math.max(1, currentRankXpRequirement - previousRankXp);
            xpTowardsNext = Math.max(0, userXP - previousRankXp);
         } else { 
            totalXPForLevel = currentRankXpRequirement > 0 ? currentRankXpRequirement : 100;
            xpTowardsNext = userXP;
         }
      }
      progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 0;
      if (userXP >= currentRankXpRequirement && totalXPForLevel > 0) { 
        progressPercent = 100;
        xpTowardsNext = totalXPForLevel; 
      } else if (totalXPForLevel === 0 && userXP >= currentRankXpRequirement) {
        progressPercent = 100;
        xpTowardsNext = 0; // Or totalXPForLevel if it should be full
      }
    }
    
    return {
      currentRank: currentRankCalculated,
      nextRank: nextRankCalculated,
      xpTowardsNextRank: xpTowardsNext,
      totalXPForNextRankLevel: totalXPForLevel,
      rankProgressPercent: Math.min(100, Math.max(0, progressPercent)) 
    };
  }, [userXP]);

  useEffect(() => {
    const calculatedAttributes = INITIAL_ATTRIBUTES.map(attr => {
        let value = 0;
        switch (attr.name) {
            case "Motivación":
                const completedGoalsXP = goals.filter(g => g.isCompleted).reduce((sum, g) => sum + g.xp, 0);
                const totalGoalsXP = goals.reduce((sum, g) => sum + g.xp, DEFAULT_GOAL_XP * goals.length || 1); 
                value = totalGoalsXP > 0 ? (completedGoalsXP / totalGoalsXP) * 70 : 0; 
                value += (userXP / (nextRank?.xpRequired || userXP + 1000)) * 30; 
                break;
            case "Energía":
                if (sleepLogs.length > 0) {
                    const recentLogs = sleepLogs.slice(0, 7); 
                    const qualityScore = recentLogs.reduce((sum, log) => {
                        if (log.quality === "excellent") return sum + 4;
                        if (log.quality === "good") return sum + 3;
                        if (log.quality === "fair") return sum + 2;
                        if (log.quality === "poor") return sum + 1;
                        return sum;
                    }, 0);
                    const avgQuality = recentLogs.length > 0 ? (qualityScore / (recentLogs.length * 4)) * 100 : 50;
                    value = avgQuality;
                } else {
                    value = 50; 
                }
                break;
            case "Disciplina":
                const totalHabitCompletions = habits.filter(h => h.completed).length;
                const totalHabitCount = habits.length;
                const streakBonus = habits.reduce((sum, h) => sum + h.streak, 0) / (totalHabitCount || 1);
                value = totalHabitCount > 0 ? (totalHabitCompletions / totalHabitCount) * 80 : 0; 
                value += Math.min(20, streakBonus * 2); 
                break;
            default: 
                value = (userXP / (currentRank.xpRequired + (nextRank?.xpRequired || 1000))) * 50 + 10; 
                break;
        }
        value = Math.min(100, Math.max(0, Math.round(value)));
        return { 
            ...attr, 
            value: value,
            currentLevel: `${value}/100`,
            xpInArea: `${userXP}/${nextRank?.xpRequired || (currentRank.xpRequired + 1000)}` 
        };
    });
    setAttributes(calculatedAttributes);
  }, [userXP, habits, goals, sleepLogs, currentRank, nextRank]);


  const averageSleepLast7Days = React.useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSleepLogs = sleepLogs.filter(log => {
        try {
            const logDate = dateFnsParseISO(log.date);
            return isValid(logDate) && logDate >= sevenDaysAgo;
        } catch { return false; }
    });

    if (recentSleepLogs.length === 0) return "0.0 hrs";

    const totalSleepHours = recentSleepLogs.reduce((sum, log) => sum + (log.sleepDurationHours || 0), 0);
    const average = totalSleepHours / recentSleepLogs.length;
    return `${average.toFixed(1)} hrs`;
  }, [sleepLogs]);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const activeGoalsCount = goals.filter(g => !g.isCompleted).length;


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
      isLoading,
      dataLoadingError
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
