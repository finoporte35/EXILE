
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP } from '@/lib/app-config';
import { ALL_PREDEFINED_ERAS_DATA } from '@/lib/eras-config';
import type { Habit, Attribute, Goal, SleepLog, SleepQuality, Era, EraObjective, EraReward, UserEraCustomizations, EraVisualTheme } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { isValid, parseISO as dateFnsParseISO } from 'date-fns';
import { db, auth } from '@/lib/firebase'; // Import auth
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'; // Import FirebaseUser
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
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


// Helper to get Lucide icon component from string name
const getIconComponent = (iconName?: string): LucideIcon => {
  if (iconName && LucideIcons[iconName as keyof typeof LucideIcons]) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  }
  return LucideIcons.Milestone; // Default icon for eras
};


interface DataContextState {
  authUser: FirebaseUser | null; // Firebase authenticated user
  authLoading: boolean; // Loading state for Firebase Auth

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

  predefinedEras: Era[];
  userCreatedEras: Era[];
  allUserEraCustomizations: Record<string, UserEraCustomizations>;

  getEraDetails: (eraId: string) => Era | null;
  currentEra: Era | null;
  currentEraId: string | null;
  completedEras: Era[];

  canStartEra: (eraId: string) => boolean;
  startEra: (eraId: string) => Promise<void>;
  completeCurrentEra: () => Promise<void>;
  isEraObjectiveCompleted: (objectiveId: string, eraId?: string) => boolean;

  updateEraCustomizations: (eraId: string, details: Partial<Era>) => Promise<void>;
  createUserEra: (baseDetails: { nombre: string, descripcion: string }) => Promise<void>;
  deleteUserEra: (eraId: string) => Promise<void>;

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
  isLoading: boolean; // Combined loading state (auth + data)
  dataLoadingError: Error | null;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true); // Specific for Firestore data
  const [dataLoadingError, setDataLoadingError] = useState<Error | null>(null);

  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  const predefinedEras = useMemo(() => ALL_PREDEFINED_ERAS_DATA, []);
  const [userCreatedEras, setUserCreatedEras] = useState<Era[]>([]);
  const [allUserEraCustomizations, setAllUserEraCustomizations] = useState<Record<string, UserEraCustomizations>>({});
  const [currentEraId, setCurrentEraId] = useState<string | null>(null);
  const [completedEraIds, setCompletedEraIds] = useState<string[]>([]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (!user) {
        // Clear user-specific data on logout
        setUserName(DEFAULT_USERNAME);
        setUserEmail("");
        setUserXP(INITIAL_XP);
        setUserAvatar(null);
        setHabits([]);
        setAttributes(INITIAL_ATTRIBUTES);
        setGoals([]);
        setSleepLogs([]);
        setCurrentEraId(null);
        setCompletedEraIds([]);
        setAllUserEraCustomizations({});
        setUserCreatedEras([]);
        setDataLoading(false); // No data to load if no user
      }
    });
    return () => unsubscribe();
  }, []);


  const getEraDetails = useCallback((eraId: string): Era | null => {
    if (!eraId) return null;

    let baseEra: Era | undefined = userCreatedEras.find(e => e.id === eraId);
    let isCustomizingPredefined = false;

    if (!baseEra) {
      baseEra = predefinedEras.find(e => e.id === eraId);
      if (baseEra) isCustomizingPredefined = true;
    }

    if (!baseEra) return null;

    const customizations = allUserEraCustomizations[eraId] || {};

    return {
      ...baseEra,
      nombre: customizations.nombre ?? baseEra.nombre,
      descripcion: customizations.descripcion ?? baseEra.descripcion,
      condiciones_completado_desc: customizations.condiciones_completado_desc ?? baseEra.condiciones_completado_desc,
      mecanicas_especiales_desc: customizations.mecanicas_especiales_desc ?? baseEra.mecanicas_especiales_desc,
      xpRequeridoParaIniciar: customizations.xpRequeridoParaIniciar !== undefined ? customizations.xpRequeridoParaIniciar : baseEra.xpRequeridoParaIniciar,
      tema_visual: {
        ...baseEra.tema_visual,
        ...(customizations.tema_visual || {})
      },
      fechaInicio: customizations.fechaInicio !== undefined ? customizations.fechaInicio : baseEra.fechaInicio,
      fechaFin: customizations.fechaFin !== undefined ? customizations.fechaFin : baseEra.fechaFin,
      objetivos: baseEra.isUserCreated ? baseEra.objetivos : (customizations.objetivos || baseEra.objetivos),
      recompensas: baseEra.isUserCreated ? baseEra.recompensas : (customizations.recompensas || baseEra.recompensas),
    };
  }, [userCreatedEras, predefinedEras, allUserEraCustomizations]);

  const currentEra = useMemo(() => {
    if (!currentEraId) return null;
    return getEraDetails(currentEraId);
  }, [currentEraId, getEraDetails]);

  const completedEras = useMemo(() => {
    return completedEraIds
      .map(id => getEraDetails(id))
      .filter(Boolean) as Era[];
  }, [completedEraIds, getEraDetails]);


  useEffect(() => {
    const loadData = async () => {
      if (!authUser) {
        setDataLoading(false);
        return;
      }
      setDataLoading(true);
      setDataLoadingError(null);
      console.log("DataContext: Attempting to load data for user:", authUser.uid);

      try {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let initialCurrentEraId = null;
        let initialCompletedEraIds: string[] = [];
        let initialAllUserEraCustomizations: Record<string, UserEraCustomizations> = {};

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserName(userData.username || DEFAULT_USERNAME);
          setUserEmail(userData.email || authUser.email || ""); // Prioritize DB email, then auth email
          setUserXP(userData.xp || INITIAL_XP);
          setUserAvatar(userData.avatarUrl || null);

          initialCurrentEraId = userData.currentEraId === undefined ? null : userData.currentEraId;
          initialCompletedEraIds = userData.completedEraIds || [];
          initialAllUserEraCustomizations = userData.allUserEraCustomizations || {};

        } else {
          // User exists in Auth but not in Firestore (e.g., first time after signup flow completion)
          // Create their Firestore document.
          console.log(`DataContext: No Firestore document found for user ${authUser.uid}. Creating one.`);
          const newUserData = {
            username: authUser.displayName || DEFAULT_USERNAME,
            email: authUser.email || "",
            xp: INITIAL_XP,
            avatarUrl: authUser.photoURL || null,
            currentEraId: null,
            completedEraIds: [],
            allUserEraCustomizations: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDocRef, newUserData);
          setUserName(newUserData.username);
          setUserEmail(newUserData.email);
          setUserXP(newUserData.xp);
          setUserAvatar(newUserData.avatarUrl);
        }
        setCurrentEraId(initialCurrentEraId);
        setCompletedEraIds(initialCompletedEraIds);
        setAllUserEraCustomizations(initialAllUserEraCustomizations);

        const userErasColRef = collection(db, "users", authUser.uid, "userCreatedEras");
        const userErasQuery = query(userErasColRef, orderBy("createdAt", "asc"));
        const userErasSnapshot = await getDocs(userErasQuery);
        const loadedUserCreatedEras = userErasSnapshot.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                id: d.id,
                isUserCreated: true,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : (data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
                objetivos: Array.isArray(data.objetivos) ? data.objetivos : [],
                recompensas: Array.isArray(data.recompensas) ? data.recompensas : [],
                tema_visual: data.tema_visual || { icono: 'Milestone', colorPrincipal: 'text-gray-400' },
                fechaInicio: data.fechaInicio instanceof Timestamp ? data.fechaInicio.toDate().toISOString() : (data.fechaInicio || null),
                fechaFin: data.fechaFin instanceof Timestamp ? data.fechaFin.toDate().toISOString() : (data.fechaFin || null),
            } as Era;
        });
        setUserCreatedEras(loadedUserCreatedEras);


        const habitsColRef = collection(db, "users", authUser.uid, "habits");
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

        const goalsColRef = collection(db, "users", authUser.uid, "goals");
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

        const sleepLogsColRef = collection(db, "users", authUser.uid, "sleepLogs");
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
        console.log("DataContext: Successfully loaded all data including ERAS for", authUser.uid);

      } catch (error: any) {
        console.error("DataContext: Error loading data from Firestore for", authUser.uid, error);
        setDataLoadingError(error);
        // Reset to defaults if Firestore load fails but authUser exists
        setUserName(DEFAULT_USERNAME);
        setUserEmail(authUser.email || "");
        setUserXP(INITIAL_XP);
        setUserAvatar(authUser.photoURL || null);
        setHabits([]);
        setGoals([]);
        setSleepLogs([]);
        setCurrentEraId(null);
        setCompletedEraIds([]);
        setAllUserEraCustomizations({});
        setUserCreatedEras([]);
      } finally {
        setDataLoading(false);
      }
    };

    if (authUser) {
        loadData();
    } else {
        setDataLoading(false); // No user, so no data to load
    }
  }, [authUser]);


  const updateUserProfile = useCallback(async (newUsername: string, newEmail: string): Promise<{success: boolean, message: string}> => {
    if (!authUser) {
        return { success: false, message: "Usuario no autenticado."};
    }
    const userDocRef = doc(db, "users", authUser.uid);
    try {
        // Note: Firebase Auth email update (updateEmail) and display name update (updateProfile)
        // are separate operations and might require re-authentication.
        // This function currently only updates Firestore.
        // For full profile update, you'd call Firebase Auth functions here too.

        if (newUsername !== userName) {
            const usersRef = collection(db, "users");
            const qUsername = query(usersRef, where("username", "==", newUsername));
            const usernameSnapshot = await getDocs(qUsername);
            for (const userDoc of usernameSnapshot.docs) {
                if (userDoc.id !== authUser.uid) { // Check against current auth user's UID
                    return { success: false, message: "Este nombre de usuario ya está en uso." };
                }
            }
        }
        if (newEmail !== userEmail) { // Assuming userEmail state reflects the current email in DB
            const usersRef = collection(db, "users");
            const qEmail = query(usersRef, where("email", "==", newEmail));
            const emailSnapshot = await getDocs(qEmail);
            for (const userDoc of emailSnapshot.docs) {
                if (userDoc.id !== authUser.uid) { // Check against current auth user's UID
                    return { success: false, message: "Este correo electrónico ya está registrado." };
                }
            }
        }

        await updateDoc(userDocRef, {
            username: newUsername,
            email: newEmail, // This updates Firestore email
            updatedAt: serverTimestamp()
        });
        setUserName(newUsername);
        setUserEmail(newEmail);
        // Consider updating authUser.displayName and authUser.email if Firebase Auth updateProfile/updateEmail were called
        return { success: true, message: "Perfil actualizado con éxito en la base deatos." };
    } catch (error) {
        console.error("DataContext: Error updating user profile in Firestore for", authUser.uid, error);
        return { success: false, message: "No se pudo actualizar el perfil en la base de datos." };
    }
  }, [authUser, userName, userEmail]);

  const updateUserAvatar = useCallback(async (avatarDataUri: string | null) => {
    if (!authUser) return;
    setUserAvatar(avatarDataUri);
    // localStorage for avatar can be removed if we solely rely on Firestore for this
    if (avatarDataUri) {
      localStorage.setItem(`userAvatar_${authUser.uid}`, avatarDataUri); // Scope localStorage avatar
    } else {
      localStorage.removeItem(`userAvatar_${authUser.uid}`);
    }

    const userDocRef = doc(db, "users", authUser.uid);
    try {
      await updateDoc(userDocRef, { avatarUrl: avatarDataUri, updatedAt: serverTimestamp() });
      // Consider updating authUser.photoURL if Firebase Auth updateProfile was called
    } catch (error) {
      console.error("DataContext: Error updating avatar in Firestore for", authUser.uid, error);
    }
  }, [authUser]);

  const addHabit = useCallback(async (name: string, category: string) => {
    if (!authUser) return;
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
      const habitsColRef = collection(db, "users", authUser.uid, "habits");
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
    } catch (error) {
      console.error("DataContext: Error adding habit to Firestore for", authUser.uid, error);
    }
  }, [authUser]);

  const toggleHabit = useCallback(async (id: string) => {
    if (!authUser) return;
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
            // Keep lastCompletedDate as today if unchecking on the same day it was checked
            // Or set to null if you want to fully revert the "completion" for the day
            // For simplicity, let's keep it as today if unchecking same day.
            // newLastCompletedDateString = null; // Alternative: fully revert
        }
    }
    const updatedHabitClientData = {
        completed: newCompletedStatus,
        streak: newStreak,
        lastCompletedDate: newLastCompletedDateString,
    };
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updatedHabitClientData } : h));
    setUserXP(newTotalUserXP);
    // localStorage.setItem('userXP', String(newTotalUserXP)); // This can be removed if Firestore is source of truth

    const habitDocRef = doc(db, "users", authUser.uid, "habits", id);
    const userDocRef = doc(db, "users", authUser.uid);
    const batch = writeBatch(db);

    const firestoreHabitUpdate: Record<string, any> = {
      completed: newCompletedStatus,
      streak: newStreak,
      lastCompletedDate: newLastCompletedDateString,
    };

    batch.update(habitDocRef, firestoreHabitUpdate);
    batch.update(userDocRef, { xp: newTotalUserXP, updatedAt: serverTimestamp() });
    try {
        await batch.commit();
    } catch (error) {
        setHabits(originalHabits);
        setUserXP(originalUserXP);
        // localStorage.setItem('userXP', String(originalUserXP));
        console.error("DataContext: Error toggling habit/updating XP in Firestore. Reverting. ID:", id, error);
    }
  }, [authUser, userXP, habits]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!authUser) return;
    const originalHabits = [...habits];
    const habitToDelete = originalHabits.find(h => h.id === id);
    if (!habitToDelete) return;

    const originalUserXP = userXP;
    let newTotalUserXP = userXP;
    if (habitToDelete.completed) { // Only deduct XP if it was completed *and* contributed to current XP
      newTotalUserXP = Math.max(0, userXP - habitToDelete.xp);
    }
    setHabits(prev => prev.filter(h => h.id !== id));
    if (newTotalUserXP !== userXP) {
      setUserXP(newTotalUserXP);
      // localStorage.setItem('userXP', String(newTotalUserXP));
    }
    const habitDocRef = doc(db, "users", authUser.uid, "habits", id);
    const userDocRef = doc(db, "users", authUser.uid);
    const batch = writeBatch(db);
    batch.delete(habitDocRef);
    if (newTotalUserXP !== userXP) {
      batch.update(userDocRef, { xp: newTotalUserXP, updatedAt: serverTimestamp() });
    } else {
      batch.update(userDocRef, { updatedAt: serverTimestamp() }); // Still update timestamp
    }
    try {
      await batch.commit();
    } catch (error) {
      setHabits(originalHabits);
      if (newTotalUserXP !== userXP) {
        setUserXP(originalUserXP);
        // localStorage.setItem('userXP', String(originalUserXP));
      }
      console.error("DataContext: Error deleting habit or updating XP in Firestore. Reverting. ID:", id, error);
    }
  }, [authUser, userXP, habits]);

  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt'>) => {
    if (!authUser) return;
    const newGoalFirestoreData = {
      ...goalData,
      timeBound: Timestamp.fromDate(new Date(goalData.timeBound)),
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    try {
      const goalsColRef = collection(db, "users", authUser.uid, "goals");
      const docRef = await addDoc(goalsColRef, newGoalFirestoreData);
      const newGoalForState: Goal = {
        id: docRef.id,
        ...goalData,
        isCompleted: false,
        createdAt: new Date().toISOString()
      };
      setGoals(prev => [newGoalForState, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("DataContext: Error adding goal to Firestore for", authUser.uid, error);
    }
  }, [authUser]);

  const toggleGoalCompletion = useCallback(async (id: string) => {
    if (!authUser) return;
    const originalGoals = [...goals];
    const originalUserXP = userXP;
    const goalToToggle = originalGoals.find(g => g.id === id);
    if (!goalToToggle) return;

    const newCompletedStatus = !goalToToggle.isCompleted;
    let xpChange = newCompletedStatus ? goalToToggle.xp : -goalToToggle.xp;
    const newTotalUserXP = Math.max(0, originalUserXP + xpChange);

    setGoals(prev => prev.map(goal => goal.id === id ? { ...goal, isCompleted: newCompletedStatus } : goal));
    setUserXP(newTotalUserXP);
    // localStorage.setItem('userXP', String(newTotalUserXP));

    const goalDocRef = doc(db, "users", authUser.uid, "goals", id);
    const userDocRef = doc(db, "users", authUser.uid);
    const batch = writeBatch(db);
    batch.update(goalDocRef, { isCompleted: newCompletedStatus, updatedAt: serverTimestamp() });
    batch.update(userDocRef, { xp: newTotalUserXP, updatedAt: serverTimestamp() });
    try {
        await batch.commit();
    } catch (error) {
        setGoals(originalGoals);
        setUserXP(originalUserXP);
        // localStorage.setItem('userXP', String(originalUserXP));
        console.error("DataContext: Error toggling goal completion/updating XP. Reverting. Goal ID:", id, error);
    }
  }, [authUser, userXP, goals]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!authUser) return;
    const originalGoals = [...goals];
    // XP is not deducted when deleting a completed goal, as per current logic.
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    const goalDocRef = doc(db, "users", authUser.uid, "goals", id);
    const userDocRef = doc(db, "users", authUser.uid);
    try {
      const batch = writeBatch(db);
      batch.delete(goalDocRef);
      batch.update(userDocRef, { updatedAt: serverTimestamp() }); // Just update timestamp
      await batch.commit();
    } catch (error) {
      setGoals(originalGoals);
      console.error("DataContext: Error deleting goal from Firestore. Reverting. ID:", id, error);
    }
  }, [authUser, goals]);

  const addSleepLog = useCallback(async (logData: { date: Date; timeToBed: string; timeWokeUp: string; quality: SleepQuality; notes?: string }) => {
    if (!authUser) return;
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
      quality, notes: notes || "", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    };
    try {
      const sleepLogsColRef = collection(db, "users", authUser.uid, "sleepLogs");
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
      console.error("DataContext: Error adding sleep log to Firestore for", authUser.uid, error);
    }
  }, [authUser]);

  const deleteSleepLog = useCallback(async (id: string) => {
    if (!authUser) return;
    const originalLogs = [...sleepLogs];
    setSleepLogs(prev => prev.filter(log => log.id !== id));
    const sleepLogDocRef = doc(db, "users", authUser.uid, "sleepLogs", id);
    const userDocRef = doc(db, "users", authUser.uid);
    try {
      const batch = writeBatch(db);
      batch.delete(sleepLogDocRef);
      batch.update(userDocRef, { updatedAt: serverTimestamp() });
      await batch.commit();
    } catch (error) {
      setSleepLogs(originalLogs);
      console.error("DataContext: Error deleting sleep log from Firestore. Reverting. ID:", id, error);
    }
  }, [authUser, sleepLogs]);


  const canStartEra = useCallback((eraId: string): boolean => {
    const eraToStart = getEraDetails(eraId);
    if (!eraToStart) return false;
    if (completedEraIds.includes(eraId) || currentEraId === eraId) return false;

    const xpRequired = eraToStart.xpRequeridoParaIniciar;
    if (xpRequired !== undefined && userXP < xpRequired) {
        return false;
    }
    return true;
  }, [userXP, currentEraId, completedEraIds, getEraDetails]);

  const startEra = useCallback(async (eraId: string) => {
    if (!authUser || !canStartEra(eraId)) return;

    const eraToStart = getEraDetails(eraId);
    if (!eraToStart) return;

    const userDocRef = doc(db, "users", authUser.uid);
    const batch = writeBatch(db);
    const todayISO = new Date().toISOString();

    batch.update(userDocRef, { currentEraId: eraId, updatedAt: serverTimestamp() });

    if (eraToStart.isUserCreated) {
        const userEraDocRef = doc(db, "users", authUser.uid, "userCreatedEras", eraId);
        batch.update(userEraDocRef, { fechaInicio: todayISO, updatedAt: serverTimestamp() });
        setUserCreatedEras(prev => prev.map(e => e.id === eraId ? { ...e, fechaInicio: todayISO } : e));
    } else {
        const updatedCustoms: UserEraCustomizations = { ...(allUserEraCustomizations[eraId] || {}), fechaInicio: todayISO };
        const newAllCustomizations = { ...allUserEraCustomizations, [eraId]: updatedCustoms };
        batch.update(userDocRef, { allUserEraCustomizations: newAllCustomizations });
        setAllUserEraCustomizations(newAllCustomizations);
    }

    try {
      await batch.commit();
      setCurrentEraId(eraId);
      console.log(`DataContext: User ${authUser.uid} started new Era: ${eraId}`);
    } catch (error) {
      console.error(`DataContext: Error starting Era ${eraId} for user ${authUser.uid}:`, error);
      if (eraToStart.isUserCreated) {
          setUserCreatedEras(prev => prev.map(e => e.id === eraId ? { ...e, fechaInicio: eraToStart.fechaInicio } : e));
      } else {
          setAllUserEraCustomizations(allUserEraCustomizations);
      }
       setCurrentEraId(currentEraId);
    }
  }, [authUser, canStartEra, getEraDetails, allUserEraCustomizations, userCreatedEras, currentEraId, setCurrentEraId, setUserCreatedEras, setAllUserEraCustomizations]);

  const isEraObjectiveCompleted = useCallback((objectiveId: string, eraIdToCheck?: string): boolean => {
    return false;
  }, []);


  const completeCurrentEra = useCallback(async () => {
    if (!authUser || !currentEraId || !currentEra) return;

    const userDocRef = doc(db, "users", authUser.uid);
    const batch = writeBatch(db);
    const todayISO = new Date().toISOString();

    let newXp = userXP;
    currentEra.recompensas.forEach(reward => {
      if (reward.type === 'xp' && typeof reward.value === 'number') {
        newXp += reward.value;
      }
    });

    const newCompletedIds = [...completedEraIds, currentEraId];
    const nextEraIdToStart = null;

    const userUpdates: Record<string, any> = {
      currentEraId: nextEraIdToStart,
      completedEraIds: newCompletedIds,
      xp: newXp,
      updatedAt: serverTimestamp(),
    };

    if (currentEra.isUserCreated) {
        const userEraDocRef = doc(db, "users", authUser.uid, "userCreatedEras", currentEraId);
        batch.update(userEraDocRef, { fechaFin: todayISO, updatedAt: serverTimestamp() });
        setUserCreatedEras(prev => prev.map(e => e.id === currentEraId ? { ...e, fechaFin: todayISO } : e));
    } else {
        const updatedCustoms: UserEraCustomizations = { ...(allUserEraCustomizations[currentEraId] || {}), fechaFin: todayISO };
        const newAllCustomizations = { ...allUserEraCustomizations, [currentEraId]: updatedCustoms };
        userUpdates.allUserEraCustomizations = newAllCustomizations;
        setAllUserEraCustomizations(newAllCustomizations);
    }

    batch.update(userDocRef, userUpdates);

    try {
      await batch.commit();
      setCompletedEraIds(newCompletedIds);
      setCurrentEraId(nextEraIdToStart);
      setUserXP(newXp);
      // localStorage.setItem('userXP', String(newXp));
      console.log(`DataContext: User ${authUser.uid} completed Era: ${currentEraId}. New XP: ${newXp}`);
    } catch (error) {
      console.error(`DataContext: Error completing Era ${currentEraId} for ${authUser.uid}:`, error);
       if (currentEra.isUserCreated) {
          setUserCreatedEras(prev => prev.map(e => e.id === currentEraId ? { ...e, fechaFin: currentEra.fechaFin } : e));
      } else {
          setAllUserEraCustomizations(allUserEraCustomizations);
      }
      setCurrentEraId(currentEraId);
      setUserXP(userXP);
      // localStorage.setItem('userXP', String(userXP));
    }
  }, [authUser, currentEraId, currentEra, completedEraIds, userXP, allUserEraCustomizations, userCreatedEras, setCurrentEraId, setCompletedEraIds, setUserXP, setUserCreatedEras, setAllUserEraCustomizations]);

  const updateEraCustomizations = useCallback(async (eraId: string, details: Partial<Era>) => {
    if (!authUser) return;

    const eraIsUserCreated = userCreatedEras.some(e => e.id === eraId);
    const userDocRef = doc(db, "users", authUser.uid);

    if (eraIsUserCreated) {
        const eraDocRef = doc(db, "users", authUser.uid, "userCreatedEras", eraId);
        const updatePayload: Partial<Era> & { updatedAt: any } = { updatedAt: serverTimestamp() };

        if (details.nombre !== undefined) updatePayload.nombre = details.nombre;
        if (details.descripcion !== undefined) updatePayload.descripcion = details.descripcion;
        if (details.condiciones_completado_desc !== undefined) updatePayload.condiciones_completado_desc = details.condiciones_completado_desc;
        if (details.mecanicas_especiales_desc !== undefined) updatePayload.mecanicas_especiales_desc = details.mecanicas_especiales_desc;
        if (details.xpRequeridoParaIniciar !== undefined) updatePayload.xpRequeridoParaIniciar = details.xpRequeridoParaIniciar;
        if (details.tema_visual !== undefined) updatePayload.tema_visual = details.tema_visual;
        
        if (details.objetivos) {
            updatePayload.objetivos = details.objetivos.map(obj => ({ id: obj.id || `obj_${Date.now()}_${Math.random().toString(36).substring(2,7)}`, description: (obj.description || "").trim() }));
        }
        if (details.recompensas) {
            updatePayload.recompensas = details.recompensas.map(rew => ({ type: rew.type, description: (rew.description || "").trim(), value: rew.value, attributeName: rew.attributeName || null }));
        }

        try {
            await updateDoc(eraDocRef, updatePayload);
            setUserCreatedEras(prevEras => prevEras.map(e => e.id === eraId ? { ...e, ...updatePayload, updatedAt: new Date().toISOString() } : e));
            console.log(`DataContext: Updated user-created Era ${eraId} directly for user ${authUser.uid}.`);
        } catch (error) {
            console.error(`DataContext: Error updating user-created Era ${eraId} for ${authUser.uid}:`, error);
        }
    } else {
        const customizationDetails: UserEraCustomizations = {};
        if (details.nombre !== undefined) customizationDetails.nombre = details.nombre;
        if (details.descripcion !== undefined) customizationDetails.descripcion = details.descripcion;
        if (details.condiciones_completado_desc !== undefined) customizationDetails.condiciones_completado_desc = details.condiciones_completado_desc;
        if (details.mecanicas_especiales_desc !== undefined) customizationDetails.mecanicas_especiales_desc = details.mecanicas_especiales_desc;
        if (details.xpRequeridoParaIniciar !== undefined) customizationDetails.xpRequeridoParaIniciar = details.xpRequeridoParaIniciar;
        if (details.tema_visual !== undefined) customizationDetails.tema_visual = details.tema_visual;

        const newCustomizationsForEra = { ...(allUserEraCustomizations[eraId] || {}), ...customizationDetails };
        Object.keys(newCustomizationsForEra).forEach(key => {
            const K = key as keyof UserEraCustomizations;
            if (newCustomizationsForEra[K] === undefined || (typeof newCustomizationsForEra[K] === 'string' && (newCustomizationsForEra[K] as string).trim() === "")) {
                delete newCustomizationsForEra[K];
            }
        });

        const updatedAllCustomizations = { ...allUserEraCustomizations };
        if (Object.keys(newCustomizationsForEra).length > 0) {
            updatedAllCustomizations[eraId] = newCustomizationsForEra;
        } else {
            delete updatedAllCustomizations[eraId];
        }

        try {
            await updateDoc(userDocRef, {
                allUserEraCustomizations: updatedAllCustomizations,
                updatedAt: serverTimestamp(),
            });
            setAllUserEraCustomizations(updatedAllCustomizations);
            console.log(`DataContext: Updated customizations for predefined Era ${eraId} for user ${authUser.uid}.`);
        } catch (error) {
            console.error(`DataContext: Error updating customizations for predefined Era ${eraId} for ${authUser.uid}:`, error);
        }
    }
  }, [authUser, userCreatedEras, allUserEraCustomizations, setUserCreatedEras, setAllUserEraCustomizations]);

 const createUserEra = useCallback(async (baseDetails: { nombre: string; descripcion: string }) => {
    if (!authUser) return;

    const generatedId = `user_era_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newEraFirestoreData = {
        nombre: baseDetails.nombre,
        descripcion: baseDetails.descripcion,
        descripcionCompletada: "Has completado tu era personalizada: " + baseDetails.nombre,
        objetivos: [] as EraObjective[],
        condiciones_completado_desc: "Completa los objetivos que te propongas para esta era.",
        mecanicas_especiales_desc: "Define tus propias mecánicas especiales si lo deseas.",
        recompensas: [{ type: 'xp' as const, description: "XP por completar esta era personalizada.", value: 100, attributeName: null }] as EraReward[],
        tema_visual: { colorPrincipal: 'text-gray-400', icono: "Milestone" } as EraVisualTheme,
        siguienteEraId: null,
        xpRequeridoParaIniciar: 0,
        isUserCreated: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        fechaInicio: null,
        fechaFin: null,
    };

    try {
        const userErasColRef = collection(db, "users", authUser.uid, "userCreatedEras");
        const newEraDocRef = doc(userErasColRef, generatedId);
        await setDoc(newEraDocRef, newEraFirestoreData);

        const newEraForState: Era = {
            id: generatedId,
            nombre: newEraFirestoreData.nombre,
            descripcion: newEraFirestoreData.descripcion,
            descripcionCompletada: newEraFirestoreData.descripcionCompletada,
            objetivos: newEraFirestoreData.objetivos.map(o => ({...o})),
            condiciones_completado_desc: newEraFirestoreData.condiciones_completado_desc,
            mecanicas_especiales_desc: newEraFirestoreData.mecanicas_especiales_desc,
            recompensas: newEraFirestoreData.recompensas.map(r => ({...r})),
            tema_visual: {...newEraFirestoreData.tema_visual},
            siguienteEraId: newEraFirestoreData.siguienteEraId,
            xpRequeridoParaIniciar: newEraFirestoreData.xpRequeridoParaIniciar,
            isUserCreated: newEraFirestoreData.isUserCreated,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fechaInicio: null,
            fechaFin: null,
        };
        setUserCreatedEras(prevEras => [...prevEras, newEraForState].sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()));
        console.log(`DataContext: User ${authUser.uid} created new Era: ${generatedId}`);
    } catch (error) {
        console.error(`DataContext: Error creating new Era for ${authUser.uid}:`, error);
    }
  }, [authUser, setUserCreatedEras]);


  const deleteUserEra = useCallback(async (eraId: string) => {
    if (!authUser) return;

    const eraToDelete = userCreatedEras.find(e => e.id === eraId);
    if (!eraToDelete || !eraToDelete.isUserCreated) {
        console.warn(`DataContext: Attempted to delete non-user-created or non-existent Era: ${eraId}`);
        return;
    }

    const originalUserCreatedEras = [...userCreatedEras];
    const originalAllUserEraCustomizations = { ...allUserEraCustomizations };
    const originalCurrentEraId = currentEraId;

    setUserCreatedEras(prevEras => prevEras.filter(e => e.id !== eraId));
    if (allUserEraCustomizations[eraId]) {
        const newCustomizations = { ...allUserEraCustomizations };
        delete newCustomizations[eraId];
        setAllUserEraCustomizations(newCustomizations);
    }
    if (currentEraId === eraId) {
        setCurrentEraId(null);
    }

    const batch = writeBatch(db);
    const eraDocRef = doc(db, "users", authUser.uid, "userCreatedEras", eraId);
    batch.delete(eraDocRef);

    const userDocRef = doc(db, "users", authUser.uid);
    const userDocUpdates: Record<string, any> = { updatedAt: serverTimestamp() };
    if (currentEraId === eraId) {
        userDocUpdates.currentEraId = null;
    }
    if (allUserEraCustomizations[eraId]) { // This case should ideally not happen if deleting a user-created era
       const tempCustomizations = { ...allUserEraCustomizations };
       delete tempCustomizations[eraId];
       userDocUpdates.allUserEraCustomizations = tempCustomizations;
    }
    batch.update(userDocRef, userDocUpdates);

    try {
        await batch.commit();
        console.log(`DataContext: Successfully deleted user-created Era: ${eraId} for user ${authUser.uid}`);
    } catch (error) {
        console.error(`DataContext: Error deleting user-created Era ${eraId} for ${authUser.uid}:`, error);
        setUserCreatedEras(originalUserCreatedEras);
        setAllUserEraCustomizations(originalAllUserEraCustomizations);
        setCurrentEraId(originalCurrentEraId);
    }
  }, [authUser, userCreatedEras, currentEraId, allUserEraCustomizations, setUserCreatedEras, setAllUserEraCustomizations, setCurrentEraId]);


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
                const totalPotentialGoalsXP = goals.reduce((sum, g) => sum + g.xp, 0);
                let goalContribution = totalPotentialGoalsXP > 0 ? (completedGoalsXP / totalPotentialGoalsXP) * 70 : 0;
                if (goals.length === 0) goalContribution = 0;

                let xpContributionRank = 0;
                 if (userXP > 0) {
                  const maxPossibleUserXP = RANKS_DATA[RANKS_DATA.length -1]?.xpRequired;
                  const effectiveMaxXP = (maxPossibleUserXP && maxPossibleUserXP > 0) ? maxPossibleUserXP : (userXP + 1000); // Avoid division by zero if maxXP is 0
                  xpContributionRank = (userXP / effectiveMaxXP) * 30;
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
                    rawValue = 0; // Default energy if no sleep logs
                }
                break;
            case "Disciplina":
                const totalHabitCompletions = habits.filter(h => h.completed).length;
                const totalHabitCount = habits.length;
                const averageStreak = totalHabitCount > 0 ? habits.reduce((sum, h) => sum + (h.streak || 0), 0) / totalHabitCount : 0;
                let habitCompletionRatio = totalHabitCount > 0 ? (totalHabitCompletions / totalHabitCount) * 80 : 0;
                let streakContribution = Math.min(20, (averageStreak / 7) * 20); // Max 20 points for streak
                rawValue = habitCompletionRatio + streakContribution;
                break;
            default: // For other attributes, base it on general XP progression
                if (userXP === 0) {
                    rawValue = 0;
                } else if (RANKS_DATA.length > 0) {
                    const maxSystemXP = RANKS_DATA[RANKS_DATA.length - 1].xpRequired;
                    if (maxSystemXP > 0) {
                        rawValue = (userXP / maxSystemXP) * 100;
                    } else { // Handles case where max rank XP is 0 or only one rank exists
                        rawValue = (userXP > 0) ? 100 : 0;
                    }
                } else { // No ranks defined
                    rawValue = 0;
                }
                break;
        }
        const finalValue = Math.min(100, Math.max(0, Math.round(rawValue))); // Ensure value is between 0 and 100
        return {
            ...attr,
            value: finalValue,
            currentLevel: `${finalValue}/100`, // Example, can be more sophisticated
            xpInArea: `${finalValue}/100` // Example
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

  const isLoadingCombined = authLoading || dataLoading;

  return (
    <DataContext.Provider value={{
      authUser, authLoading,
      userName, userEmail, userXP, userAvatar,
      habits, attributes, goals, sleepLogs,
      currentRank, nextRank, xpTowardsNextRank, totalXPForNextRankLevel, rankProgressPercent,
      totalHabits, completedHabits, activeGoalsCount, averageSleepLast7Days,
      predefinedEras, userCreatedEras, allUserEraCustomizations,
      getEraDetails, currentEra, currentEraId, completedEras,
      canStartEra, startEra, completeCurrentEra, isEraObjectiveCompleted,
      updateEraCustomizations, createUserEra, deleteUserEra,
      addHabit, toggleHabit, deleteHabit,
      addGoal, toggleGoalCompletion, deleteGoal,
      addSleepLog, deleteSleepLog,
      updateUserProfile, updateUserAvatar,
      isLoading: isLoadingCombined, dataLoadingError
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

export const EraIconMapper: React.FC<{ iconName?: string; className?: string }> = ({ iconName, className }) => {
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className={className} />;
};

    