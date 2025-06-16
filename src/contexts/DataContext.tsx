
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP, INITIAL_GOALS, DEFAULT_GOAL_XP, INITIAL_SLEEP_LOGS, MOCK_USER_ID } from '@/lib/app-config';
import { ALL_ERAS_DATA } from '@/lib/eras-config'; 
import type { Habit, Attribute, Goal, SleepLog, SleepQuality, Era, EraObjective, EraReward, UserEraCustomizations } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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
  orderBy,
  where
} from 'firebase/firestore';


interface DataContextState {
  userName: string;
  userEmail: string;
  userXP: number;
  userAvatar: string | null;
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
  
  
  allEras: Era[];
  currentEra: Era | null;
  currentEraId: string | null; 
  completedEras: Era[];
  canStartEra: (eraId: string) => boolean;
  startEra: (eraId: string) => Promise<void>;
  completeCurrentEra: () => Promise<void>;
  isEraObjectiveCompleted: (objectiveId: string, eraId?: string) => boolean;
  updateCurrentEraDetails: (details: UserEraCustomizations) => Promise<void>;


  addHabit: (name: string, category: string) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void; 
  addGoal: (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => void;
  toggleGoalCompletion: (id: string) => void;
  deleteGoal: (id: string) => void;
  addSleepLog: (logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => void;
  deleteSleepLog: (id: string) => void;
  updateUserProfile: (newUsername: string, newEmail: string) => Promise<{success: boolean, message: string}>;
  updateUserAvatar: (avatarDataUri: string | null) => void;
  isLoading: boolean;
  dataLoadingError: Error | null;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadingError, setDataLoadingError] = useState<Error | null>(null);
  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  
  const [allEras] = useState<Era[]>(ALL_ERAS_DATA);
  const [currentEraId, setCurrentEraId] = useState<string | null>(null);
  const [completedEraIds, setCompletedEraIds] = useState<string[]>([]);
  const [currentEraCustomizations, setCurrentEraCustomizations] = useState<UserEraCustomizations | null>(null);

  const currentEra = useMemo(() => {
    if (!currentEraId) return null;
    const baseEra = allEras.find(era => era.id === currentEraId);
    if (!baseEra) return null;
    return {
      ...baseEra,
      nombre: currentEraCustomizations?.nombre || baseEra.nombre,
      descripcion: currentEraCustomizations?.descripcion || baseEra.descripcion,
    };
  }, [allEras, currentEraId, currentEraCustomizations]);
  
  const completedEras = useMemo(() => completedEraIds.map(id => allEras.find(era => era.id === id)).filter(Boolean) as Era[], [allEras, completedEraIds]);


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

        let initialCurrentEraId = ALL_ERAS_DATA.length > 0 ? ALL_ERAS_DATA[0].id : null;
        let initialCompletedEraIds: string[] = [];
        let initialEraCustomizations: UserEraCustomizations | null = null;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserName(userData.username || DEFAULT_USERNAME);
          setUserEmail(userData.email || "");
          setUserXP(userData.xp || INITIAL_XP);
          setUserAvatar(userData.avatarUrl || localStorage.getItem('userAvatar') || null);
          
          initialCurrentEraId = userData.currentEraId || initialCurrentEraId;
          initialCompletedEraIds = userData.completedEraIds || [];
          initialEraCustomizations = userData.currentEraCustomizations || null;

          localStorage.setItem('username', userData.username || DEFAULT_USERNAME);
          localStorage.setItem('userEmail', userData.email || "");
          console.log("DataContext: User profile data loaded:", userData);
        } else {
          console.log("DataContext: No user profile found for", MOCK_USER_ID, ". Creating with defaults.");
          const initialAvatarFromStorage = localStorage.getItem('userAvatar');
          await setDoc(userDocRef, {
            username: DEFAULT_USERNAME,
            email: "", 
            xp: INITIAL_XP,
            avatarUrl: initialAvatarFromStorage || null,
            currentEraId: initialCurrentEraId,
            completedEraIds: initialCompletedEraIds,
            currentEraCustomizations: null,
            createdAt: serverTimestamp()
          });
          setUserName(DEFAULT_USERNAME);
          setUserEmail("");
          setUserXP(INITIAL_XP);
          setUserAvatar(initialAvatarFromStorage);
          localStorage.setItem('username', DEFAULT_USERNAME);
          localStorage.setItem('userEmail', "");
        }
        setCurrentEraId(initialCurrentEraId);
        setCompletedEraIds(initialCompletedEraIds);
        setCurrentEraCustomizations(initialEraCustomizations);


        const habitsColRef = collection(db, "users", MOCK_USER_ID, "habits");
        const habitsQuery = query(habitsColRef, orderBy("createdAt", "desc"));
        const habitsSnapshot = await getDocs(habitsQuery);
        const loadedHabits = habitsSnapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                lastCompletedDate: data.lastCompletedDate instanceof Timestamp ? data.lastCompletedDate.toDate().toISOString().split('T')[0] : (data.lastCompletedDate || null),
                createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())).toISOString()
            } as Habit;
        });
        setHabits(loadedHabits);

        const goalsColRef = collection(db, "users", MOCK_USER_ID, "goals");
        const goalsQuery = query(goalsColRef, orderBy("createdAt", "desc"));
        const goalsSnapshot = await getDocs(goalsQuery);
        const loadedGoals = goalsSnapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timeBound: (data.timeBound instanceof Timestamp ? data.timeBound.toDate() : new Date(data.timeBound)).toISOString(),
            createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())).toISOString(),
          } as Goal;
        });
        setGoals(loadedGoals);

        const sleepLogsColRef = collection(db, "users", MOCK_USER_ID, "sleepLogs");
        const sleepLogsQuery = query(sleepLogsColRef, orderBy("date", "desc"));
        const sleepLogsSnapshot = await getDocs(sleepLogsQuery);
        const loadedSleepLogs = sleepLogsSnapshot.docs.map(s => {
            const data = s.data();
            return {
                id: s.id,
                ...data,
                date: (data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)).toISOString(),
                createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())).toISOString(),
            } as SleepLog;
        });
        setSleepLogs(loadedSleepLogs);
        console.log("DataContext: Successfully loaded all data including ERAS for", MOCK_USER_ID);

      } catch (error: any) {
        console.error("DataContext: Error loading data from Firestore for", MOCK_USER_ID, error);
        setDataLoadingError(error);
        
        setUserName(localStorage.getItem('username') || DEFAULT_USERNAME);
        setUserEmail(localStorage.getItem('userEmail') || "");
        setUserXP(parseInt(localStorage.getItem('userXP') || String(INITIAL_XP),10));
        setUserAvatar(localStorage.getItem('userAvatar') || null);
        
        setCurrentEraId(ALL_ERAS_DATA.length > 0 ? ALL_ERAS_DATA[0].id : null);
        setCompletedEraIds([]);
        setCurrentEraCustomizations(null);
        setHabits([]);
        setGoals([]);
        setSleepLogs([]);
      } finally {
        setIsLoading(false);
        console.log("DataContext: Loading complete. isLoading set to false.");
      }
    };

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn || window.location.pathname.startsWith('/signup')) {
        loadData();
    } else {
        setIsLoading(false);
    }
  }, []);


  const updateUserProfile = useCallback(async (newUsername: string, newEmail: string): Promise<{success: boolean, message: string}> => {
    if (!MOCK_USER_ID) {
        return { success: false, message: "ID de usuario no disponible."};
    }
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    try {
        
        if (newUsername !== userName) {
            const usersRef = collection(db, "users");
            const qUsername = query(usersRef, where("username", "==", newUsername));
            const usernameSnapshot = await getDocs(qUsername);
            for (const userDoc of usernameSnapshot.docs) {
                if (userDoc.id !== MOCK_USER_ID) {
                    return { success: false, message: "Este nombre de usuario ya está en uso." };
                }
            }
        }
        if (newEmail !== userEmail) {
            const usersRef = collection(db, "users");
            const qEmail = query(usersRef, where("email", "==", newEmail));
            const emailSnapshot = await getDocs(qEmail);
            for (const userDoc of emailSnapshot.docs) {
                if (userDoc.id !== MOCK_USER_ID) {
                    return { success: false, message: "Este correo electrónico ya está registrado." };
                }
            }
        }
        
        await updateDoc(userDocRef, {
            username: newUsername,
            email: newEmail,
            updatedAt: serverTimestamp()
        });
        setUserName(newUsername);
        setUserEmail(newEmail);
        localStorage.setItem('username', newUsername);
        localStorage.setItem('userEmail', newEmail); 
        return { success: true, message: "Perfil actualizado con éxito." };
    } catch (error) {
        console.error("DataContext: Error updating user profile in Firestore for", MOCK_USER_ID, error);
        return { success: false, message: "No se pudo actualizar el perfil en la base de datos." };
    }
  }, [userName, userEmail]);

  const updateUserAvatar = useCallback(async (avatarDataUri: string | null) => {
    setUserAvatar(avatarDataUri);
    if (avatarDataUri) {
      localStorage.setItem('userAvatar', avatarDataUri);
    } else {
      localStorage.removeItem('userAvatar');
    }
    if (MOCK_USER_ID) {
      const userDocRef = doc(db, "users", MOCK_USER_ID);
      try {
        await updateDoc(userDocRef, { avatarUrl: avatarDataUri, updatedAt: serverTimestamp() });
      } catch (error) {
        console.error("DataContext: Error updating avatar in Firestore for", MOCK_USER_ID, error);
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
      lastCompletedDate: null, 
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
        lastCompletedDate: null, 
        createdAt: new Date().toISOString()
      };
      setHabits(prev => [newHabitForState, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      console.log("DataContext: Habit added successfully. Firestore ID:", docRef.id);
    } catch (error) {
      console.error("DataContext: Error adding habit to Firestore for", MOCK_USER_ID, error);
    }
  }, []);

  const toggleHabit = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    const originalHabits = [...habits];
    const originalUserXP = userXP;
    const habitToToggle = originalHabits.find(h => h.id === id);
    if (!habitToToggle) return;

    const newCompletedStatus = !habitToToggle.completed;
    const xpChange = newCompletedStatus ? habitToToggle.xp : -habitToToggle.xp;
    const newTotalUserXP = Math.max(0, originalUserXP + xpChange);

    let newStreak = habitToToggle.streak;
    let newLastCompletedDateString: string | null = habitToToggle.lastCompletedDate;
    const todayDateString = new Date().toISOString().split('T')[0];

    if (newCompletedStatus) {
        if (habitToToggle.lastCompletedDate !== todayDateString) { 
            newStreak = (habitToToggle.streak || 0) + 1;
            newLastCompletedDateString = todayDateString;
        }
    } else {
        if (habitToToggle.lastCompletedDate === todayDateString) {
            newStreak = Math.max(0, (habitToToggle.streak || 0) - 1);
            newLastCompletedDateString = null; 
        }
    }
    const updatedHabitClientData = {
        completed: newCompletedStatus,
        streak: newStreak,
        lastCompletedDate: newLastCompletedDateString,
    };
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updatedHabitClientData } : h));
    setUserXP(newTotalUserXP);
    localStorage.setItem('userXP', String(newTotalUserXP));

    const habitDocRef = doc(db, "users", MOCK_USER_ID, "habits", id);
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    const batch = writeBatch(db);
    
    const firestoreHabitUpdate: Record<string, any> = {
      completed: newCompletedStatus,
      streak: newStreak,
    };
    if (newLastCompletedDateString === null) {
        firestoreHabitUpdate.lastCompletedDate = null; 
    } else {
        firestoreHabitUpdate.lastCompletedDate = newLastCompletedDateString;
    }

    batch.update(habitDocRef, firestoreHabitUpdate);
    batch.update(userDocRef, { xp: newTotalUserXP });
    try {
        await batch.commit();
    } catch (error) {
        setHabits(originalHabits);
        setUserXP(originalUserXP);
        localStorage.setItem('userXP', String(originalUserXP));
        console.error("DataContext: Error toggling habit/updating XP in Firestore. Reverting. ID:", id, error);
    }
  }, [userXP, habits]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;

    const originalHabits = [...habits];
    const habitToDelete = originalHabits.find(h => h.id === id);
    if (!habitToDelete) return;

    const originalUserXP = userXP;
    let newTotalUserXP = userXP;

    
    if (habitToDelete.completed) {
      newTotalUserXP = Math.max(0, userXP - habitToDelete.xp);
    }

    
    setHabits(prev => prev.filter(h => h.id !== id));
    if (newTotalUserXP !== userXP) {
      setUserXP(newTotalUserXP);
      localStorage.setItem('userXP', String(newTotalUserXP));
    }

    
    const habitDocRef = doc(db, "users", MOCK_USER_ID, "habits", id);
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    const batch = writeBatch(db);

    batch.delete(habitDocRef);
    if (newTotalUserXP !== userXP) {
      batch.update(userDocRef, { xp: newTotalUserXP });
    }

    try {
      await batch.commit();
      console.log("DataContext: Habit deleted and XP updated successfully. Habit ID:", id);
    } catch (error) {
      
      setHabits(originalHabits);
      if (newTotalUserXP !== userXP) {
        setUserXP(originalUserXP);
        localStorage.setItem('userXP', String(originalUserXP));
      }
      console.error("DataContext: Error deleting habit or updating XP in Firestore. Reverting. ID:", id, error);
    }
  }, [userXP, habits]);

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
      const newGoalForState: Goal = {
        id: docRef.id,
        ...goalData,
        isCompleted: false,
        createdAt: new Date().toISOString()
      };
      setGoals(prev => [newGoalForState, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("DataContext: Error adding goal to Firestore for", MOCK_USER_ID, error);
    }
  }, []);

  const toggleGoalCompletion = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    const originalGoals = [...goals];
    const originalUserXP = userXP;
    const goalToToggle = originalGoals.find(g => g.id === id);
    if (!goalToToggle) return;

    const newCompletedStatus = !goalToToggle.isCompleted;
    let xpChange = newCompletedStatus ? goalToToggle.xp : -goalToToggle.xp;
    const newTotalUserXP = Math.max(0, originalUserXP + xpChange);

    setGoals(prev => prev.map(goal => goal.id === id ? { ...goal, isCompleted: newCompletedStatus } : goal));
    setUserXP(newTotalUserXP);
    localStorage.setItem('userXP', String(newTotalUserXP));

    const goalDocRef = doc(db, "users", MOCK_USER_ID, "goals", id);
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    const batch = writeBatch(db);
    batch.update(goalDocRef, { isCompleted: newCompletedStatus });
    batch.update(userDocRef, { xp: newTotalUserXP });
    try {
        await batch.commit();
    } catch (error) {
        setGoals(originalGoals);
        setUserXP(originalUserXP);
        localStorage.setItem('userXP', String(originalUserXP));
        console.error("DataContext: Error toggling goal completion/updating XP. Reverting. Goal ID:", id, error);
    }
  }, [userXP, goals]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    const originalGoals = [...goals];
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    const goalDocRef = doc(db, "users", MOCK_USER_ID, "goals", id);
    try {
      await deleteDoc(goalDocRef);
    } catch (error) {
      setGoals(originalGoals);
      console.error("DataContext: Error deleting goal from Firestore. Reverting. ID:", id, error);
    }
  }, [goals]);

  const addSleepLog = useCallback(async (logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => {
    if (!MOCK_USER_ID) return;
    const { date, timeToBed, timeWokeUp, quality, notes } = logData;
    const baseDate = new Date(date);
    const [bedHoursStr, bedMinutesStr] = timeToBed.split(':');
    const [wokeHoursStr, wokeMinutesStr] = timeWokeUp.split(':');
    const bedHours = parseInt(bedHoursStr, 10);
    const bedMinutes = parseInt(bedMinutesStr, 10);
    const wokeHours = parseInt(wokeHoursStr, 10);
    const wokeMinutes = parseInt(wokeMinutesStr, 10);
    if (isNaN(bedHours) || isNaN(bedMinutes) || isNaN(wokeHours) || isNaN(wokeMinutes)) return;

    let bedDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), bedHours, bedMinutes);
    let wokeDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), wokeHours, wokeMinutes);
    if (wokeDateTime.getTime() <= bedDateTime.getTime()) {
      wokeDateTime.setDate(wokeDateTime.getDate() + 1);
    }
    const durationMs = wokeDateTime.getTime() - bedDateTime.getTime();
    const sleepDurationHours = Math.max(0, durationMs / (1000 * 60 * 60));

    const newLogFirestoreData = {
      date: Timestamp.fromDate(baseDate),
      timeToBed, timeWokeUp,
      sleepDurationHours: parseFloat(sleepDurationHours.toFixed(2)),
      quality, notes: notes || "", createdAt: serverTimestamp()
    };
    try {
      const sleepLogsColRef = collection(db, "users", MOCK_USER_ID, "sleepLogs");
      const docRef = await addDoc(sleepLogsColRef, newLogFirestoreData);
      const newLogForState: SleepLog = {
          id: docRef.id, date: baseDate.toISOString(),
          timeToBed, timeWokeUp,
          sleepDurationHours: newLogFirestoreData.sleepDurationHours,
          quality: newLogFirestoreData.quality as SleepQuality,
          notes: newLogFirestoreData.notes, createdAt: new Date().toISOString()
      };
      setSleepLogs(prev => [...prev, newLogForState].sort((a,b) => dateFnsParseISO(b.date).getTime() - dateFnsParseISO(a.date).getTime() || dateFnsParseISO(b.createdAt).getTime() - dateFnsParseISO(a.createdAt).getTime()));
    } catch (error) {
      console.error("DataContext: Error adding sleep log to Firestore for", MOCK_USER_ID, error);
    }
  }, []);

  const deleteSleepLog = useCallback(async (id: string) => {
    if (!MOCK_USER_ID) return;
    const originalLogs = [...sleepLogs];
    setSleepLogs(prev => prev.filter(log => log.id !== id));
    const sleepLogDocRef = doc(db, "users", MOCK_USER_ID, "sleepLogs", id);
    try {
      await deleteDoc(sleepLogDocRef);
    } catch (error) {
      setSleepLogs(originalLogs);
      console.error("DataContext: Error deleting sleep log from Firestore. Reverting. ID:", id, error);
    }
  }, [sleepLogs]);

  
  const canStartEra = useCallback((eraId: string): boolean => {
    const eraToStart = allEras.find(e => e.id === eraId);
    if (!eraToStart) return false;
    if (completedEraIds.includes(eraId) || currentEraId === eraId) return false; 

    
    if (eraToStart.xpRequeridoParaIniciar && userXP < eraToStart.xpRequeridoParaIniciar) {
        return false;
    }
    
    const previousEraIndex = allEras.findIndex(e => e.siguienteEraId === eraId);
    if (previousEraIndex !== -1) {
        const previousEra = allEras[previousEraIndex];
        if (!completedEraIds.includes(previousEra.id)) {
            return false; 
        }
    } else if (allEras.findIndex(e => e.id === eraId) > 0 && !currentEraId && completedEraIds.length === 0) {
        
        return false;
    }


    return true;
  }, [userXP, currentEraId, completedEraIds, allEras]);

  const startEra = useCallback(async (eraId: string) => {
    if (!MOCK_USER_ID || !canStartEra(eraId)) return;
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    try {
      await updateDoc(userDocRef, { 
        currentEraId: eraId, 
        currentEraCustomizations: null, 
        updatedAt: serverTimestamp() 
      });
      setCurrentEraId(eraId);
      setCurrentEraCustomizations(null); 
      console.log(`DataContext: User started new Era: ${eraId}`);
    } catch (error) {
      console.error(`DataContext: Error starting Era ${eraId}:`, error);
    }
  }, [canStartEra]);
  
  const isEraObjectiveCompleted = useCallback((objectiveId: string, eraIdToCheck?: string): boolean => {
    const targetEraId = eraIdToCheck || currentEraId;
    if (!targetEraId) return false;

    const era = allEras.find(e => e.id === targetEraId);
    if (!era) return false;
    
    const objective = era.objetivos.find(o => o.id === objectiveId);
    if (!objective) return false;

    
    
    switch(objective.id) {
        case 'obj0_1': 
            return !!(userName && userName !== DEFAULT_USERNAME && userEmail && userAvatar);
        case 'obj0_2': 
            return habits.length > 0;
        case 'obj0_3': 
            return habits.some(h => h.completed && h.streak > 0);
        case 'obj1_1': 
            return habits.some(h => (h.streak || 0) >= 3);
        case 'obj1_2': 
            return userXP >= 100;
        case 'obj1_3': 
            return goals.length > 0;
        case 'obj2_1': 
            return habits.filter(h => h.completed).length >= 5;
        case 'obj2_2': 
            return habits.some(h => (h.streak || 0) >= 7);
        case 'obj2_3': 
            return goals.some(g => g.isCompleted);
        
        default:
            return false;
    }
  }, [currentEraId, habits, goals, userXP, userName, userEmail, userAvatar, allEras]);


  const completeCurrentEra = useCallback(async () => {
    if (!MOCK_USER_ID || !currentEraId || !currentEra) return;

    const userDocRef = doc(db, "users", MOCK_USER_ID);
    const batch = writeBatch(db);

    let newXp = userXP;
    currentEra.recompensas.forEach(reward => {
      if (reward.type === 'xp' && typeof reward.value === 'number') {
        newXp += reward.value;
      }
      
    });

    const newCompletedIds = [...completedEraIds, currentEraId];
    const nextEraId = currentEra.siguienteEraId || null;

    batch.update(userDocRef, {
      currentEraId: nextEraId,
      completedEraIds: newCompletedIds,
      xp: newXp,
      currentEraCustomizations: null, 
      updatedAt: serverTimestamp(),
    });
    
    try {
      await batch.commit();
      setCompletedEraIds(newCompletedIds);
      setCurrentEraId(nextEraId);
      setCurrentEraCustomizations(null); 
      setUserXP(newXp); 
      localStorage.setItem('userXP', String(newXp)); 

      console.log(`DataContext: User completed Era: ${currentEraId}. Advanced to: ${nextEraId}. New XP: ${newXp}`);
    } catch (error) {
      console.error(`DataContext: Error completing Era ${currentEraId}:`, error);
    }
  }, [currentEraId, currentEra, completedEraIds, userXP, allEras]);

  const updateCurrentEraDetails = useCallback(async (details: UserEraCustomizations) => {
    if (!MOCK_USER_ID || !currentEraId) return;
    const userDocRef = doc(db, "users", MOCK_USER_ID);
    try {
      const newCustomizations = {
        nombre: details.nombre?.trim() || undefined,
        descripcion: details.descripcion?.trim() || undefined,
      };
      
      const finalCustomizations = (newCustomizations.nombre || newCustomizations.descripcion) ? newCustomizations : null;

      await updateDoc(userDocRef, {
        currentEraCustomizations: finalCustomizations,
        updatedAt: serverTimestamp(),
      });
      setCurrentEraCustomizations(finalCustomizations);
      console.log(`DataContext: Updated details for current Era ${currentEraId}:`, finalCustomizations);
    } catch (error) {
      console.error(`DataContext: Error updating details for Era ${currentEraId}:`, error);
    }
  }, [currentEraId]);


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
        if (i === 0) { 
            currentRankCalculated = RANKS_DATA[0]; 
            nextRankCalculated = RANKS_DATA.length > 0 ? RANKS_DATA[i] : null; 
        }
        else if (!nextRankCalculated) { 
             nextRankCalculated = RANKS_DATA[i];
        }
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
      progressPercent = totalXPForLevel > 0 ? (xpTowardsNext / totalXPForLevel) * 100 : 0;
       if (totalXPForLevel === 0 && userXP >= nextRankXpRequirement) { 
          progressPercent = 100;
      }
    } else { 
      const currentRankIndex = RANKS_DATA.findIndex(r => r.name === currentRankCalculated.name);
       if (currentRankIndex >= 0 && RANKS_DATA.length === 1) { 
        totalXPForLevel = Math.max(1, currentRankXpRequirement);
        xpTowardsNext = userXP;
        progressPercent = currentRankXpRequirement > 0 ? Math.min(100, (userXP / currentRankXpRequirement) * 100) : (userXP > 0 ? 100 : 0);
      } else if (currentRankIndex > 0) { 
        const previousRankXp = RANKS_DATA[currentRankIndex -1].xpRequired;
        totalXPForLevel = Math.max(1, currentRankXpRequirement - previousRankXp);
        xpTowardsNext = Math.max(0, userXP - previousRankXp);
        progressPercent = (userXP >= currentRankXpRequirement) ? 100 : ((xpTowardsNext / totalXPForLevel) * 100);
      } else { 
        totalXPForLevel = currentRankXpRequirement > 0 ? currentRankXpRequirement : (RANKS_DATA.length > 1 ? RANKS_DATA[1].xpRequired : 1);
        xpTowardsNext = userXP;
        progressPercent = (userXP >= currentRankXpRequirement && totalXPForLevel > 0) ? 100 : ((xpTowardsNext / totalXPForLevel) * 100);
      }
       if (userXP >= currentRankXpRequirement && !nextRankCalculated) { 
            progressPercent = 100;
            xpTowardsNext = totalXPForLevel;
        }
    }
    if (userXP === 0 && currentRankCalculated.xpRequired === 0 && nextRankCalculated) {
        xpTowardsNext = 0;
        totalXPForLevel = Math.max(1, nextRankCalculated.xpRequired - currentRankCalculated.xpRequired);
        progressPercent = 0;
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
        let rawValue = 0;
        switch (attr.name) {
            case "Motivación":
                const completedGoalsXP = goals.filter(g => g.isCompleted).reduce((sum, g) => sum + g.xp, 0);
                const totalGoalsXP = goals.reduce((sum, g) => sum + g.xp, DEFAULT_GOAL_XP * goals.length || 1); 
                let goalContribution = totalGoalsXP > 0 ? (completedGoalsXP / totalGoalsXP) * 70 : 0;
                
                let xpContributionRank = 0;
                if (userXP > 0) {
                  const maxPossibleUserXP = RANKS_DATA[RANKS_DATA.length -1]?.xpRequired || (userXP + 1000); 
                  xpContributionRank = (userXP / maxPossibleUserXP) * 30;
                }
                rawValue = goalContribution + xpContributionRank;
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
                    rawValue = recentLogs.length > 0 ? (qualityScore / (recentLogs.length * 4)) * 100 : 0;
                } else {
                    rawValue = 0; 
                }
                break;
            case "Disciplina":
                const totalHabitCompletions = habits.filter(h => h.completed).length;
                const totalHabitCount = habits.length;
                const averageStreak = totalHabitCount > 0 ? habits.reduce((sum, h) => sum + (h.streak || 0), 0) / totalHabitCount : 0;
                let habitCompletionRatio = totalHabitCount > 0 ? (totalHabitCompletions / totalHabitCount) * 80 : 0;
                let streakContribution = Math.min(20, (averageStreak / 7) * 20); 
                rawValue = habitCompletionRatio + streakContribution;
                break;
            default: 
                if (userXP === 0) {
                    rawValue = 0;
                } else if (RANKS_DATA.length > 0) {
                    const maxSystemXP = RANKS_DATA[RANKS_DATA.length - 1].xpRequired;
                    if (maxSystemXP > 0) {
                        rawValue = (userXP / maxSystemXP) * 100;
                    } else { 
                        rawValue = (userXP > 0) ? 100 : 0; 
                    }
                } else {
                    rawValue = 0; 
                }
                break;
        }
        const finalValue = Math.min(100, Math.max(0, Math.round(rawValue)));
        return {
            ...attr,
            value: finalValue,
            currentLevel: `${finalValue}/100`, 
            xpInArea: `${finalValue}/100`     
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
      userName, userEmail, userXP, userAvatar,
      habits, attributes, goals, sleepLogs,
      currentRank, nextRank, xpTowardsNextRank, totalXPForNextRankLevel, rankProgressPercent,
      totalHabits, completedHabits, activeGoalsCount, averageSleepLast7Days,
      allEras, currentEra, currentEraId, completedEras, canStartEra, startEra, completeCurrentEra, isEraObjectiveCompleted, updateCurrentEraDetails,
      addHabit, toggleHabit, deleteHabit,
      addGoal, toggleGoalCompletion, deleteGoal,
      addSleepLog, deleteSleepLog,
      updateUserProfile, updateUserAvatar,
      isLoading, dataLoadingError
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

