
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP, INITIAL_GOALS, DEFAULT_GOAL_XP, INITIAL_SLEEP_LOGS } from '@/lib/app-config';
import type { Habit, Attribute, Goal, SleepLog, SleepQuality } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { differenceInMilliseconds, parse, isValid } from 'date-fns';
import { db } from '@/lib/firebase'; // Import Firestore instance
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

// For now, we'll use a mock user ID. Later, this will come from Firebase Auth.
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
  dataLoadingError: Error | null; // Added to track loading errors
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadingError, setDataLoadingError] = useState<Error | null>(null); // State for loading error
  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setDataLoadingError(null); // Reset error on new load attempt
      console.log("DataContext: Attempting to load data for user:", MOCK_USER_ID);
      
      if (!MOCK_USER_ID) {
        console.error("DataContext: User ID is not available. Cannot load data.");
        setDataLoadingError(new Error("User ID not available. Cannot load data."));
        setIsLoading(false);
        // Consider redirecting to login or showing an error message globally
        return;
      }
      
      try {
        const userDocRef = doc(db, "users", MOCK_USER_ID);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserName(userData.username || DEFAULT_USERNAME);
          setUserXP(userData.xp || INITIAL_XP);
          console.log("DataContext: User profile data loaded:", { username: userData.username, xp: userData.xp });
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
        const loadedHabits = habitsSnapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: (d.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() } as Habit));
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
            timeBound: (data.timeBound as Timestamp)?.toDate().toISOString(),
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
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
                date: (data.date as Timestamp)?.toDate().toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as SleepLog;
        });
        setSleepLogs(loadedSleepLogs);
        console.log("DataContext: Sleep logs loaded:", loadedSleepLogs.length);
        console.log("DataContext: Successfully loaded all data for", MOCK_USER_ID);

      } catch (error: any) {
        console.error("DataContext: Error loading data from Firestore for", MOCK_USER_ID, error);
        setDataLoadingError(error); // Set the error state
        // Fallback to defaults if loading fails
        setUserName(DEFAULT_USERNAME);
        setUserXP(INITIAL_XP);
        setHabits([]);
        setGoals(INITIAL_GOALS); 
        setSleepLogs(INITIAL_SLEEP_LOGS);
      } finally {
        // Initialize attributes regardless of data loading success/failure
        setAttributes(INITIAL_ATTRIBUTES.map(attr => ({ ...attr, value: 0, currentLevel: "0/100", xpInArea: "0/1000" })));
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

  const updateUserXP = useCallback(async (newXP: number) => {
      setUserXP(newXP);
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
    if (!MOCK_USER_ID) return;
    const habitXP = HABIT_CATEGORY_XP_MAP[category] || DEFAULT_HABIT_XP;
    const newHabitData = {
      name,
      category,
      completed: false,
      xp: habitXP,
      streak: 0,
      createdAt: serverTimestamp() // Firestore server timestamp
    };
    try {
      const habitsColRef = collection(db, "users", MOCK_USER_ID, "habits");
      const docRef = await addDoc(habitsColRef, newHabitData);
      // Optimistically update UI, then confirm with actual data or handle error
      setHabits(prev => [{ id: docRef.id, ...newHabitData, createdAt: new Date().toISOString() } as Habit, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      console.log("DataContext: Habit added. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding habit to Firestore for", MOCK_USER_ID, error);
    }
  }, []);

  const toggleHabit = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    let xpChange = 0;
    let updatedHabitData: Partial<Habit> = {};
    
    // Optimistically update local state
    const originalHabits = habits;
    let newTotalXP = userXP;

    setHabits(prevHabits => {
        const newHabits = prevHabits.map(habit => {
            if (habit.id === id) {
                const newCompletedStatus = !habit.completed;
                xpChange = newCompletedStatus ? habit.xp : -habit.xp;
                updatedHabitData = {
                    completed: newCompletedStatus,
                    streak: newCompletedStatus ? habit.streak + 1 : Math.max(0, habit.streak -1), // Corrected streak logic
                };
                newTotalXP = Math.max(0, userXP + xpChange);
                return { ...habit, ...updatedHabitData };
            }
            return habit;
        });
        return newHabits;
    });
    setUserXP(newTotalXP); // Optimistically update XP

    // Persist to Firestore
    if (Object.keys(updatedHabitData).length > 0) {
        const habitDocRef = doc(db, "users", MOCK_USER_ID, "habits", id);
        try {
            await updateDoc(habitDocRef, updatedHabitData);
            await updateUserXP(newTotalXP); // This will also update Firestore for XP
            console.log("DataContext: Habit toggled & XP updated. Firestore ID:", id);
        } catch (error) {
            console.error("DataContext: Error toggling habit/updating XP in Firestore for", MOCK_USER_ID, "ID:", id, error);
            // Revert local state if Firestore update fails
            setHabits(originalHabits);
            setUserXP(userXP); // Revert XP
        }
    }
  }, [userXP, habits, updateUserXP]);


  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => {
    if (!MOCK_USER_ID) return;
    const newGoalFirestoreData = {
      ...goalData,
      timeBound: Timestamp.fromDate(new Date(goalData.timeBound)),
      isCompleted: false,
      createdAt: serverTimestamp()
    };
    try {
      const goalsColRef = collection(db, "users", MOCK_USER_ID, "goals");
      const docRef = await addDoc(goalsColRef, newGoalFirestoreData);
      setGoals(prev => [{ 
        id: docRef.id, 
        ...goalData, 
        isCompleted: false, 
        createdAt: new Date().toISOString() 
      }, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      console.log("DataContext: Goal added. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding goal to Firestore for", MOCK_USER_ID, error);
    }
  }, []);

  const toggleGoalCompletion = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    let xpChange = 0;
    let newCompletedStatus = false;
    
    const originalGoals = goals;
    let newTotalXP = userXP;

    setGoals(prevGoals => {
        const newGoals = prevGoals.map(goal => {
            if (goal.id === id) {
                newCompletedStatus = !goal.isCompleted;
                xpChange = newCompletedStatus ? goal.xp : -goal.xp;
                newTotalXP = Math.max(0, userXP + xpChange);
                return { ...goal, isCompleted: newCompletedStatus };
            }
            return goal;
        });
        return newGoals;
    });
    setUserXP(newTotalXP); // Optimistically update XP
    
    const goalDocRef = doc(db, "users", MOCK_USER_ID, "goals", id);
    try {
        await updateDoc(goalDocRef, { isCompleted: newCompletedStatus });
        await updateUserXP(newTotalXP);
        console.log("DataContext: Goal completion toggled & XP updated. Firestore ID:", id);
    } catch (error) {
        console.error("DataContext: Error toggling goal completion/updating XP in Firestore for", MOCK_USER_ID, "ID:", id, error);
        setGoals(originalGoals);
        setUserXP(userXP);
    }
  }, [userXP, goals, updateUserXP]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    const originalGoals = goals;
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    
    const goalDocRef = doc(db, "users", MOCK_USER_ID, "goals", id);
    try {
      await deleteDoc(goalDocRef);
      console.log("DataContext: Goal deleted from Firestore for", MOCK_USER_ID, "ID:", id);
    } catch (error) {
      console.error("DataContext: Error deleting goal from Firestore for", MOCK_USER_ID, "ID:", id, error);
      setGoals(originalGoals); // Revert if delete fails
    }
  }, [goals]);

  const addSleepLog = useCallback(async (logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => {
    if (!MOCK_USER_ID) return;
    const { date, timeToBed, timeWokeUp, quality, notes } = logData;

    const baseDate = new Date(date);
    const [bedHours, bedMinutes] = timeToBed.split(':').map(Number);
    const [wokeHours, wokeMinutes] = timeWokeUp.split(':').map(Number);
    
    if (isNaN(bedHours) || isNaN(bedMinutes) || isNaN(wokeHours) || isNaN(wokeMinutes)) {
        console.error("DataContext: Invalid time format for sleep log.", logData);
        return; // Or handle error appropriately
    }

    let bedDateTime = new Date(baseDate);
    bedDateTime.setHours(bedHours, bedMinutes, 0, 0);
    let wokeDateTime = new Date(baseDate);
    wokeDateTime.setHours(wokeHours, wokeMinutes, 0, 0);
    
    if (wokeDateTime <= bedDateTime) { // Use <= to handle cases where woke time is earlier or same as bed time on the same day
      wokeDateTime.setDate(wokeDateTime.getDate() + 1);
    }
    
    const durationMs = differenceInMilliseconds(wokeDateTime, bedDateTime);
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
      const newLogForState = {
          id: docRef.id, 
          ...logData,
          date: baseDate.toISOString(), 
          sleepDurationHours: parseFloat(sleepDurationHours.toFixed(2)),
          createdAt: new Date().toISOString() 
      };
      setSleepLogs(prev => [...prev, newLogForState].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      console.log("DataContext: Sleep log added. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding sleep log to Firestore for", MOCK_USER_ID, error);
    }
  }, []);

  const deleteSleepLog = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    const originalLogs = sleepLogs;
    setSleepLogs(prev => prev.filter(log => log.id !== id));
    const sleepLogDocRef = doc(db, "users", MOCK_USER_ID, "sleepLogs", id);
    try {
      await deleteDoc(sleepLogDocRef);
      console.log("DataContext: Sleep log deleted from Firestore for", MOCK_USER_ID, "ID:", id);
    } catch (error) {
      console.error("DataContext: Error deleting sleep log from Firestore for", MOCK_USER_ID, "ID:", id, error);
      setSleepLogs(originalLogs);
    }
  }, [sleepLogs]);

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
    let totalXPForLevel = 100; // Default to prevent division by zero if ranks are misconfigured
    let progressPercent = 0;

    if (nextRankCalculated) {
      xpTowardsNext = userXP - currentRankCalculated.xpRequired;
      totalXPForLevel = nextRankCalculated.xpRequired - currentRankCalculated.xpRequired;
      progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : (userXP >= currentRankCalculated.xpRequired ? 100 : 0);
    } else { // Max rank achieved or only one rank defined
        const currentRankIndex = RANKS_DATA.findIndex(r => r.name === currentRankCalculated.name);
        if (currentRankIndex > 0) { // If not the very first rank
            const prevRank = RANKS_DATA[currentRankIndex -1];
            xpTowardsNext = userXP - prevRank.xpRequired;
            totalXPForLevel = currentRankCalculated.xpRequired - prevRank.xpRequired;
            progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 100;
        } else if (RANKS_DATA.length === 1 || currentRankCalculated.xpRequired === 0) { // Only one rank or first rank is 0 XP
             progressPercent = userXP >= currentRankCalculated.xpRequired ? 100 : 0;
             if (RANKS_DATA.length > 1 && RANKS_DATA[1].xpRequired > 0) { // Edge case for first rank, progress towards next
                totalXPForLevel = RANKS_DATA[1].xpRequired;
                progressPercent = totalXPForLevel > 0 ? (userXP / totalXPForLevel) * 100 : 0;
             } else { // Only one rank in the system or next rank is also 0 XP
                totalXPForLevel = currentRankCalculated.xpRequired > 0 ? currentRankCalculated.xpRequired : 100; // Avoid div by zero if 0 XP rank
                progressPercent = userXP > 0 ? 100 : 0;
             }
        }
         if (userXP >= currentRankCalculated.xpRequired) progressPercent = 100; // If at max rank, show 100%
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

    const recentSleepLogs = sleepLogs.filter(log => {
        try {
            const logDate = parseISO(log.date);
            return isValid(logDate) && logDate >= sevenDaysAgo;
        } catch { return false; }
    });

    if (recentSleepLogs.length === 0) return "0.0 hrs";

    const totalSleepHours = recentSleepLogs.reduce((sum, log) => sum + log.sleepDurationHours, 0);
    const average = totalSleepHours / recentSleepLogs.length;
    return `${average.toFixed(1)} hrs`;
  }, [sleepLogs]);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const activeGoalsCount = goals.filter(g => !g.isCompleted).length;

  // No specific loading UI here as AppLayout handles the main loading state
  // and error display based on isLoading and dataLoadingError.

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
      dataLoadingError // Expose the error state
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
