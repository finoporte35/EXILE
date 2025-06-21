
"use client";

import type { Rank } from '@/components/ranks/RankItem';
import { RANKS_DATA, INITIAL_ATTRIBUTES, DEFAULT_USERNAME, INITIAL_XP, HABIT_CATEGORY_XP_MAP, DEFAULT_HABIT_XP, PASSIVE_SKILLS_DATA } from '@/lib/app-config';
import type { Habit, Attribute, Goal, SleepLog, SleepQuality, Era, EraObjective, EraReward, UserEraCustomizations, EraVisualTheme, PassiveSkill, AppTheme, SimpleThemeColors, UserStatus } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { isValid, parseISO as dateFnsParseISO } from 'date-fns';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser, updateProfile } from 'firebase/auth';
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
import { getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { APP_THEMES, DEFAULT_THEME_ID, getThemeById } from '@/lib/themes';
import { ALL_PREDEFINED_ERAS_DATA } from '@/lib/eras-config';


// Helper to get Lucide icon component from string name
const getIconComponent = (iconName?: string): LucideIcon => {
  if (iconName && LucideIcons[iconName as keyof typeof LucideIcons]) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  }
  return LucideIcons.Milestone; // Default icon for eras
};


interface DataContextState {
  authUser: FirebaseUser | null;
  authLoading: boolean;

  userName: string;
  userEmail: string;
  userXP: number;
  userAvatar: string | null;
  userStatus: UserStatus;
  isPremium: boolean;
  isLifetime: boolean;
  isAdmin: boolean;

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
  updateUserAvatar: (avatarInput: string | null) => Promise<void>;
  
  passiveSkills: PassiveSkill[];
  unlockedSkillIds: string[];
  unlockSkill: (skillId: string) => Promise<void>;

  activeThemeId: string;
  setAppTheme: (themeId: string) => void;
  availableThemes: AppTheme[];

  isLoading: boolean;
  dataLoadingError: Error | null;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [dataLoadingError, setDataLoadingError] = useState<Error | null>(null);

  const [userName, setUserName] = useState<string>(DEFAULT_USERNAME);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userXP, setUserXP] = useState<number>(INITIAL_XP);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('free');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  const predefinedEras = useMemo(() => ALL_PREDEFINED_ERAS_DATA, []);
  const [userCreatedEras, setUserCreatedEras] = useState<Era[]>([]);
  const [allUserEraCustomizations, setAllUserEraCustomizations] = useState<Record<string, UserEraCustomizations>>({});
  const [currentEraId, setCurrentEraId] = useState<string | null>(null);
  const [completedEraIds, setCompletedEraIds] = useState<string[]>([]);
  
  const passiveSkills = useMemo(() => PASSIVE_SKILLS_DATA, []);
  const [unlockedSkillIds, setUnlockedSkillIds] = useState<string[]>([]);
  
  const [activeThemeId, setActiveThemeId] = useState<string>(DEFAULT_THEME_ID);
  const availableThemes = useMemo(() => APP_THEMES, []);

  const isAdmin = useMemo(() => authUser?.displayName === 'emptystreet', [authUser]);
  const isLifetime = useMemo(() => userStatus === 'lifetime', [userStatus]);
  const isPremium = useMemo(() => isLifetime || userStatus === 'premium' || isAdmin, [isLifetime, userStatus, isAdmin]);

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
        break; 
      }
    }

    let xpTowardsNext = 0;
    let totalXPForLevel = 100; 
    const currentRankXpRequirement = currentRankCalculated.xpRequired;

    if (nextRankCalculated) {
      const nextRankXpRequirement = nextRankCalculated.xpRequired;
      xpTowardsNext = Math.max(0, userXP - currentRankXpRequirement);
      totalXPForLevel = Math.max(1, nextRankXpRequirement - currentRankXpRequirement);
    } else { 
        if (RANKS_DATA.length === 1) { 
            totalXPForLevel = Math.max(1, currentRankXpRequirement); 
            xpTowardsNext = userXP;
        } else { 
            const currentRankIndex = RANKS_DATA.findIndex(r => r.name === currentRankCalculated.name);
            if (currentRankIndex > 0) {
                const previousRankXp = RANKS_DATA[currentRankIndex -1].xpRequired;
                totalXPForLevel = Math.max(1, currentRankXpRequirement - previousRankXp);
                xpTowardsNext = Math.max(0, userXP - previousRankXp);
            } else { 
                totalXPForLevel = Math.max(1, currentRankXpRequirement);
                xpTowardsNext = userXP;
            }
        }
    }
    
    let progressPercent = (totalXPForLevel > 0) ? (xpTowardsNext / totalXPForLevel) * 100 : 0;
    if (!nextRankCalculated && userXP >= currentRankXpRequirement) { 
        progressPercent = 100;
        xpTowardsNext = totalXPForLevel; 
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

  const previousXpRef = useRef<number | undefined>(undefined);
  const previousRankRef = useRef<Rank | undefined>(undefined);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (!user) {
        setUserName(DEFAULT_USERNAME);
        setUserEmail("");
        setUserXP(INITIAL_XP);
        setUserAvatar(null);
        setUserStatus('free');
        setHabits([]);
        setAttributes(INITIAL_ATTRIBUTES);
        setGoals([]);
        setSleepLogs([]);
        setCurrentEraId(null);
        setCompletedEraIds([]);
        setAllUserEraCustomizations({});
        setUserCreatedEras([]);
        setUnlockedSkillIds([]);
        setActiveThemeId(DEFAULT_THEME_ID);
        previousXpRef.current = undefined; 
        previousRankRef.current = undefined;
        setDataLoading(false);
        setInitialLoadComplete(true); 
      }
    });
    return () => unsubscribe();
  }, []);


  const getEraDetails = useCallback((eraId: string): Era | null => {
    if (!eraId) return null;
    let baseEra: Era | undefined = userCreatedEras.find(e => e.id === eraId);
    
    if (!baseEra) {
      baseEra = predefinedEras.find(e => e.id === eraId);
    }

    if (!baseEra) return null;

    if (baseEra.isUserCreated) {
      return {
        ...baseEra,
        descripcionCompletada: baseEra.descripcionCompletada ?? `Has completado ${baseEra.nombre}.`,
        siguienteEraId: baseEra.siguienteEraId ?? null,
        xpRequeridoParaIniciar: baseEra.xpRequeridoParaIniciar ?? 0,
        createdAt: baseEra.createdAt ?? new Date().toISOString(),
        updatedAt: baseEra.updatedAt ?? new Date().toISOString(),
        fechaInicio: baseEra.fechaInicio ?? null,
        fechaFin: baseEra.fechaFin ?? null,
      };
    }

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
      objetivos: baseEra.objetivos.map(o => ({...o})),
      recompensas: baseEra.recompensas.map(r => ({...r})),
      fechaInicio: customizations.fechaInicio !== undefined ? customizations.fechaInicio : baseEra.fechaInicio,
      fechaFin: customizations.fechaFin !== undefined ? customizations.fechaFin : baseEra.fechaFin,
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
        setInitialLoadComplete(true); 
        return;
      }
      
      setDataLoading(true);
      setInitialLoadComplete(false); 
      setDataLoadingError(null);

      try {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let initialCurrentEraId = null;
        let initialCompletedEraIds: string[] = [];
        let initialAllUserEraCustomizations: Record<string, UserEraCustomizations> = {};
        let loadedUserXP = INITIAL_XP;
        let loadedUnlockedSkillIds: string[] = [];
        let loadedActiveThemeId = DEFAULT_THEME_ID;
        let loadedUsername = DEFAULT_USERNAME;
        let loadedEmail = "";
        let loadedAvatarUrl = null;
        let loadedStatus: UserStatus = 'premium'; // Default to premium as per request


        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          loadedUsername = userData.username || DEFAULT_USERNAME;
          loadedEmail = userData.email || authUser.email || "";
          loadedUserXP = userData.xp || INITIAL_XP;
          loadedAvatarUrl = userData.avatarUrl || authUser.photoURL || null;
          loadedStatus = userData.status || 'premium'; // Default existing users to premium for now

          initialCurrentEraId = userData.currentEraId === undefined ? null : userData.currentEraId;
          initialCompletedEraIds = userData.completedEraIds || [];
          initialAllUserEraCustomizations = userData.allUserEraCustomizations || {};
          loadedUnlockedSkillIds = userData.unlockedSkillIds || [];
          loadedActiveThemeId = userData.activeThemeId || DEFAULT_THEME_ID;

        } else {
          loadedUsername = authUser.displayName || DEFAULT_USERNAME;
          loadedEmail = authUser.email || "";
          loadedUserXP = INITIAL_XP;
          loadedAvatarUrl = authUser.photoURL || null;
          loadedActiveThemeId = DEFAULT_THEME_ID;
          loadedStatus = 'premium'; // New users are premium
          const newUserData = {
            username: loadedUsername,
            email: loadedEmail,
            xp: loadedUserXP,
            avatarUrl: loadedAvatarUrl,
            status: loadedStatus,
            currentEraId: null,
            completedEraIds: [],
            allUserEraCustomizations: {},
            unlockedSkillIds: [],
            activeThemeId: loadedActiveThemeId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDocRef, newUserData);
        }
        
        setUserName(loadedUsername);
        setUserEmail(loadedEmail);
        setUserAvatar(loadedAvatarUrl);
        setUserStatus(loadedStatus);
        
        previousXpRef.current = loadedUserXP;
        let loadedRank: Rank = RANKS_DATA[0];
        for (let i = 0; i < RANKS_DATA.length; i++) {
            if (loadedUserXP >= RANKS_DATA[i].xpRequired) {
                loadedRank = RANKS_DATA[i];
            } else {
                if (i === 0) loadedRank = RANKS_DATA[0]; 
                break;
            }
        }
        previousRankRef.current = loadedRank;
        
        setUserXP(loadedUserXP); 

        setCurrentEraId(initialCurrentEraId);
        setCompletedEraIds(initialCompletedEraIds);
        setAllUserEraCustomizations(initialAllUserEraCustomizations);
        setUnlockedSkillIds(loadedUnlockedSkillIds);
        setActiveThemeId(loadedActiveThemeId); 
        
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
                objetivos: Array.isArray(data.objetivos) ? data.objetivos.map((obj: any) => ({ id: obj.id || `obj_${Date.now()}_${Math.random().toString(36).substring(2,7)}`, description: obj.description || "" })) : [],
                recompensas: Array.isArray(data.recompensas) ? data.recompensas.map((rew: any) => ({ id: rew.id || `rew_${Date.now()}_${Math.random().toString(36).substring(2,7)}`, type: rew.type || 'xp', description: rew.description || "", value: rew.value, attributeName: rew.attributeName || null })) : [],
                tema_visual: data.tema_visual || { icono: 'Milestone', colorPrincipal: 'text-gray-400' },
                fechaInicio: data.fechaInicio instanceof Timestamp ? data.fechaInicio.toDate().toISOString() : (data.fechaInicio || null),
                fechaFin: data.fechaFin instanceof Timestamp ? data.fechaFin.toDate().toISOString() : (data.fechaFin || null),
            } as Era;
        });
        setUserCreatedEras(loadedUserCreatedEras);

        // --- Habit Reset Logic ---
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
        
        const todayString = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const habitResetBatch = writeBatch(db);
        let needsBatchCommit = false;

        const processedHabits = loadedHabits.map(habit => {
            const habitCopy = { ...habit };
            let updated = false;

            // Reset completion if last completion was not today
            if (habitCopy.completed && habitCopy.lastCompletedDate !== todayString) {
                habitCopy.completed = false;
                updated = true;
            }

            // Reset streak if last completion was not yesterday
            if (habitCopy.lastCompletedDate && habitCopy.lastCompletedDate !== todayString && habitCopy.lastCompletedDate !== yesterdayString) {
                 if (habitCopy.streak > 0) {
                    habitCopy.streak = 0;
                    updated = true;
                 }
            }

            if (updated) {
                const habitDocRef = doc(db, "users", authUser.uid, "habits", habit.id);
                habitResetBatch.update(habitDocRef, { completed: habitCopy.completed, streak: habitCopy.streak });
                needsBatchCommit = true;
            }
            return habitCopy;
        });

        if (needsBatchCommit) {
            habitResetBatch.update(userDocRef, { updatedAt: serverTimestamp() });
            await habitResetBatch.commit();
        }

        setHabits(processedHabits);
        // --- End of Habit Reset Logic ---


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

      } catch (error: any) {
        console.error("DataContext: Error loading data from Firestore for", authUser.uid, error);
        setDataLoadingError(error);
        setUserName(DEFAULT_USERNAME);
        setUserEmail(authUser.email || "");
        setUserXP(INITIAL_XP);
        setUserAvatar(authUser.photoURL || null);
        setUserStatus('free');
        setHabits([]);
        setGoals([]);
        setSleepLogs([]);
        setCurrentEraId(null);
        setCompletedEraIds([]);
        setAllUserEraCustomizations({});
        setUserCreatedEras([]);
        setUnlockedSkillIds([]);
        setActiveThemeId(DEFAULT_THEME_ID);
        previousXpRef.current = undefined; 
        previousRankRef.current = undefined;
      } finally {
        setDataLoading(false);
        setInitialLoadComplete(true); 
      }
    };

    if (authUser) {
        loadData();
    } else {
        setDataLoading(false);
        setInitialLoadComplete(true);
    }
  }, [authUser]);

  useEffect(() => {
    const theme = getThemeById(activeThemeId);
    if (theme && typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      });
      root.style.setProperty('--sidebar-primary', theme.colors.sidebarPrimary);
      root.style.setProperty('--sidebar-accent', theme.colors.sidebarAccent);
    }
  }, [activeThemeId]);

  const setAppTheme = useCallback(async (themeId: string) => {
    const themeToSet = getThemeById(themeId);
    if (!themeToSet) {
      console.warn(`Theme with ID "${themeId}" not found. Reverting to default.`);
      setActiveThemeId(DEFAULT_THEME_ID); 
      if (authUser) {
         const userDocRef = doc(db, "users", authUser.uid);
         await updateDoc(userDocRef, { activeThemeId: DEFAULT_THEME_ID, updatedAt: serverTimestamp() });
      }
      return;
    }

    setActiveThemeId(themeId);
    if (authUser) {
      const userDocRef = doc(db, "users", authUser.uid);
      try {
        await updateDoc(userDocRef, { activeThemeId: themeId, updatedAt: serverTimestamp() });
      } catch (error) {
        console.error("DataContext: Error saving theme preference to Firestore:", error);
      }
    }
  }, [authUser]);


  const updateUserProfile = useCallback(async (newUsername: string, newEmail: string): Promise<{success: boolean, message: string}> => {
    if (!authUser) {
        return { success: false, message: "Usuario no autenticado."};
    }
    const userDocRef = doc(db, "users", authUser.uid);
    try {
        // Check username uniqueness only if it has changed
        if (newUsername.trim() && newUsername !== userName) {
            const usersRef = collection(db, "users");
            const qUsername = query(usersRef, where("username", "==", newUsername));
            const usernameSnapshot = await getDocs(qUsername);
            for (const userDoc of usernameSnapshot.docs) {
                if (userDoc.id !== authUser.uid) { // Make sure it's not the current user's document
                    return { success: false, message: "Este nombre de usuario ya está en uso." };
                }
            }
        }
        // Email is read-only in the UI for now, so no uniqueness check or Auth update for email here.

        // Update Firebase Auth display name if current user exists and name changed
        if (auth.currentUser && newUsername.trim() && newUsername !== auth.currentUser.displayName) {
            await updateProfile(auth.currentUser, { displayName: newUsername });
        }

        // Update Firestore (only username, as email is read-only in UI and not being changed here)
        await updateDoc(userDocRef, {
            username: newUsername,
            // email: newEmail, // Email is read-only, so not updating it in Firestore via this function
            updatedAt: serverTimestamp()
        });
        setUserName(newUsername);
        // setUserEmail remains unchanged as it's read-only in UI
        return { success: true, message: "Nombre de usuario actualizado con éxito." };
    } catch (error: any) {
        console.error("DataContext: Error updating user profile for", authUser.uid, error);
        let defaultMessage = "No se pudo actualizar el perfil.";
        if (error.code === 'auth/requires-recent-login' && error.message?.includes('updateProfile')) {
            defaultMessage = "Esta operación requiere que hayas iniciado sesión recientemente. Por favor, cierra sesión y vuelve a ingresar.";
        } else if (error.message) {
            defaultMessage = error.message;
        }
        return { success: false, message: defaultMessage };
    }
  }, [authUser, userName]); // Removed userEmail from dependencies as it's not being changed

  const updateUserAvatar = useCallback(async (avatarInput: string | null) => {
    if (!authUser || !auth.currentUser) {
        toast({ variant: "destructive", title: "Error", description: "Usuario no autenticado." });
        return;
    }

    let urlToPersist: string | null = null;
    let oldAvatarUrl: string | null = auth.currentUser.photoURL; // Get old URL for potential deletion

    if (avatarInput && avatarInput.startsWith('data:image')) {
        try {
            const storage = getStorage();
            const mimeType = avatarInput.substring(avatarInput.indexOf(':') + 1, avatarInput.indexOf(';'));
            const base64Data = avatarInput.substring(avatarInput.indexOf(',') + 1);
            const fileExtension = mimeType.split('/')[1] || 'png'; // default to png
            const imageFileName = `profile.${fileExtension}`; // Consistent file name
            const imageRef = storageRef(storage, `avatars/${authUser.uid}/${imageFileName}`);
            
            // If there was an old avatar (and it wasn't a placeholder), try to delete it
            // This check is simplified; a more robust check would involve parsing the URL
            // to ensure it's actually from Firebase Storage and belongs to this user.
            if (oldAvatarUrl && oldAvatarUrl.includes(authUser.uid) && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
                try {
                    const oldImageRef = storageRef(storage, oldAvatarUrl);
                    // Check if it's not the same path we are about to write to
                    if (oldImageRef.fullPath !== imageRef.fullPath) {
                        await deleteObject(oldImageRef);
                    }
                } catch (deleteError: any) {
                    // Log deletion error but don't block avatar update for it
                    if (deleteError.code !== 'storage/object-not-found') {
                        console.warn("DataContext: Could not delete old avatar:", deleteError);
                    }
                }
            }
            
            const snapshot = await uploadString(imageRef, base64Data, 'base64', { contentType: mimeType });
            urlToPersist = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
            console.error("DataContext: Error uploading new avatar to Firebase Storage:", uploadError);
            toast({ variant: "destructive", title: "Error al Subir Avatar", description: "No se pudo subir la nueva imagen de perfil." });
            return; 
        }
    } else if (avatarInput === null && oldAvatarUrl && oldAvatarUrl.includes(authUser.uid) && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
        // If avatarInput is null, it means remove avatar
        try {
            const storage = getStorage();
            const oldImageRef = storageRef(storage, oldAvatarUrl);
            await deleteObject(oldImageRef);
            urlToPersist = null;
        } catch (deleteError: any) {
            if (deleteError.code !== 'storage/object-not-found') {
                console.warn("DataContext: Could not delete avatar on removal:", deleteError);
                toast({ variant: "destructive", title: "Error al Eliminar Avatar", description: "No se pudo eliminar la imagen anterior." });
                return; // Exit if deletion fails when trying to remove
            }
            urlToPersist = null; // Still set to null if object not found (already deleted)
        }
    } else {
        urlToPersist = avatarInput; // It's already a URL or explicitly null and no old one to delete
    }

    const userDocRef = doc(db, "users", authUser.uid);
    try {
        await updateProfile(auth.currentUser, { photoURL: urlToPersist });
        await updateDoc(userDocRef, { avatarUrl: urlToPersist, updatedAt: serverTimestamp() });
        
        setUserAvatar(urlToPersist); 
        toast({ title: "Avatar Actualizado", description: "Tu foto de perfil ha sido guardada." });
    } catch (updateError) {
        console.error("DataContext: Error updating avatar in Auth/Firestore for", authUser.uid, updateError);
        toast({ variant: "destructive", title: "Error al Guardar Avatar", description: "No se pudo guardar la nueva imagen de perfil." });
    }
  }, [authUser, toast]);


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
        }
    }
    const updatedHabitClientData = {
        completed: newCompletedStatus,
        streak: newStreak,
        lastCompletedDate: newLastCompletedDateString,
    };
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updatedHabitClientData } : h));
    setUserXP(newTotalUserXP);

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
    if (habitToDelete.completed) {
      newTotalUserXP = Math.max(0, userXP - habitToDelete.xp);
    }
    setHabits(prev => prev.filter(h => h.id !== id));
    if (newTotalUserXP !== userXP) {
      setUserXP(newTotalUserXP);
    }
    const habitDocRef = doc(db, "users", authUser.uid, "habits", id);
    const userDocRef = doc(db, "users", authUser.uid);
    const batch = writeBatch(db);
    batch.delete(habitDocRef);
    if (newTotalUserXP !== userXP) {
      batch.update(userDocRef, { xp: newTotalUserXP, updatedAt: serverTimestamp() });
    } else {
      batch.update(userDocRef, { updatedAt: serverTimestamp() });
    }
    try {
      await batch.commit();
    } catch (error) {
      setHabits(originalHabits);
      if (newTotalUserXP !== userXP) {
        setUserXP(originalUserXP);
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
        console.error("DataContext: Error toggling goal completion/updating XP. Reverting. Goal ID:", id, error);
    }
  }, [authUser, userXP, goals]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!authUser) return;
    const originalGoals = [...goals];
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    const goalDocRef = doc(db, "users", authUser.uid, "goals", id);
    const userDocRef = doc(db, "users", authUser.uid);
    try {
      const batch = writeBatch(db);
      batch.delete(goalDocRef);
      batch.update(userDocRef, { updatedAt: serverTimestamp() });
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
    if (currentEraId) return false; // Strict one-era-at-a-time rule

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
    } catch (error) {
      console.error(`DataContext: Error starting Era ${eraId} for user ${authUser.uid}:`, error);
      if (eraToStart.isUserCreated) {
          setUserCreatedEras(prev => prev.map(e => e.id === eraId ? { ...e, fechaInicio: eraToStart.fechaInicio } : e));
      } else {
          setAllUserEraCustomizations(allUserEraCustomizations);
      }
       setCurrentEraId(currentEraId);
    }
  }, [authUser, canStartEra, getEraDetails, allUserEraCustomizations, userCreatedEras, currentEraId]);

  const isEraObjectiveCompleted = useCallback((objectiveId: string, eraIdToCheck?: string): boolean => {
    const eraInFocusId = eraIdToCheck || currentEraId;
    if (!eraInFocusId) return false;

    const era = getEraDetails(eraInFocusId);
    if (!era) return false;
    
    // For now, this is a placeholder. If an era is in completedEras, all its objectives are considered met.
    if (completedEras.some(e => e.id === eraInFocusId)) {
        return true;
    }
    
    // In the future, this would check against real progress data.
    // e.g., check if a specific goalId related to the objective is completed.
    return false;
  }, [currentEraId, completedEras, getEraDetails]);


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
    const nextEraIdToStart = null; // Enforces stopping before starting a new one

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
    } catch (error) {
      console.error(`DataContext: Error completing Era ${currentEraId} for ${authUser.uid}:`, error);
       if (currentEra.isUserCreated) {
          setUserCreatedEras(prev => prev.map(e => e.id === currentEraId ? { ...e, fechaFin: currentEra.fechaFin } : e));
      } else {
          setAllUserEraCustomizations(allUserEraCustomizations);
      }
      setCurrentEraId(currentEraId);
      setUserXP(userXP);
    }
  }, [authUser, currentEraId, currentEra, completedEraIds, userXP, allUserEraCustomizations, userCreatedEras]);

  const updateEraCustomizations = useCallback(async (eraId: string, details: Partial<Era>) => {
    if (!authUser) return;

    const eraToUpdate = userCreatedEras.find(e => e.id === eraId);
    const userDocRef = doc(db, "users", authUser.uid);

    if (eraToUpdate && eraToUpdate.isUserCreated) {
        const eraDocRef = doc(db, "users", authUser.uid, "userCreatedEras", eraId);
        const updatePayload: Partial<Era> & { updatedAt: any } = { 
          updatedAt: serverTimestamp() 
        };

        if (details.nombre !== undefined) updatePayload.nombre = details.nombre;
        if (details.descripcion !== undefined) updatePayload.descripcion = details.descripcion;
        if (details.condiciones_completado_desc !== undefined) updatePayload.condiciones_completado_desc = details.condiciones_completado_desc;
        if (details.mecanicas_especiales_desc !== undefined) updatePayload.mecanicas_especiales_desc = details.mecanicas_especiales_desc;
        if (details.xpRequeridoParaIniciar !== undefined) updatePayload.xpRequeridoParaIniciar = details.xpRequeridoParaIniciar;
        if (details.tema_visual !== undefined) updatePayload.tema_visual = details.tema_visual;
        
        if (details.objetivos) {
            updatePayload.objetivos = details.objetivos.map(obj => ({ 
                id: obj.id || `obj_${Date.now()}_${Math.random().toString(36).substring(2,7)}`, 
                description: (obj.description || "").trim() 
            }));
        }
        if (details.recompensas) {
            updatePayload.recompensas = details.recompensas.map(rew => ({ 
                id: rew.id || `rew_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
                type: rew.type || 'xp', 
                description: (rew.description || "").trim(), 
                value: rew.value, 
                attributeName: rew.attributeName || null 
            }));
        }
        
        try {
            await updateDoc(eraDocRef, updatePayload);
            setUserCreatedEras(prevEras => prevEras.map(e => e.id === eraId ? { ...e, ...updatePayload, updatedAt: new Date().toISOString() } : e));
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
        } catch (error) {
            console.error(`DataContext: Error updating customizations for predefined Era ${eraId} for ${authUser.uid}:`, error);
        }
    }
  }, [authUser, userCreatedEras, allUserEraCustomizations]);

  const createUserEra = useCallback(async (baseDetails: { nombre: string; descripcion: string }) => {
    if (!authUser) return;

    const rankForXpCalculation = RANKS_DATA.slice().reverse().find(r => userXP >= r.xpRequired) || RANKS_DATA[0];

    const isAdminCheck = authUser.displayName === 'emptystreet';
    const calculatedXp = isAdminCheck ? 500 : 100 + (rankForXpCalculation.level * 20);

    const generatedId = `user_era_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newEraFirestoreData = {
        nombre: baseDetails.nombre,
        descripcion: baseDetails.descripcion,
        descripcionCompletada: "Has completado tu era personalizada: " + baseDetails.nombre, 
        objetivos: [] as EraObjective[], 
        condiciones_completado_desc: "Completa los objetivos que te propongas para esta era.",
        mecanicas_especiales_desc: "Define tus propias mecánicas especiales si lo deseas.",
        recompensas: [{ type: 'xp' as const, id: `rew_default_${Date.now()}`, description: "XP por completar esta era personalizada.", value: calculatedXp, attributeName: null }] as EraReward[], 
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
            ...newEraFirestoreData, 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString(), 
            fechaInicio: null,
            fechaFin: null,
        };
        setUserCreatedEras(prevEras => [...prevEras, newEraForState].sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()));
    } catch (error) {
        console.error(`DataContext: Error creating new Era for ${authUser.uid}:`, error);
    }
  }, [authUser, userXP]);


  const deleteUserEra = useCallback(async (eraId: string) => {
    if (!authUser) return;

    const eraToDelete = userCreatedEras.find(e => e.id === eraId);
    if (!eraToDelete || !eraToDelete.isUserCreated) { 
        return;
    }

    const originalUserCreatedEras = [...userCreatedEras];
    const originalCurrentEraId = currentEraId;

    setUserCreatedEras(prevEras => prevEras.filter(e => e.id !== eraId));
    
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
    batch.update(userDocRef, userDocUpdates);

    try {
        await batch.commit();
    } catch (error) {
        console.error(`DataContext: Error deleting user-created Era ${eraId} for ${authUser.uid}:`, error);
        setUserCreatedEras(originalUserCreatedEras);
        setCurrentEraId(originalCurrentEraId);
    }
  }, [authUser, userCreatedEras, currentEraId]);

  const unlockSkill = useCallback(async (skillId: string) => {
    if (!authUser || unlockedSkillIds.includes(skillId)) return;

    const skillToUnlock = passiveSkills.find(s => s.id === skillId);
    if (!skillToUnlock) {
        toast({ variant: "destructive", title: "Error", description: "Habilidad no encontrada." });
        return;
    }

    if (userXP < skillToUnlock.cost) {
        toast({ variant: "destructive", title: "XP Insuficiente", description: `Necesitas ${skillToUnlock.cost} XP para desbloquear "${skillToUnlock.name}".` });
        return;
    }

    const newXP = userXP - skillToUnlock.cost;
    const newUnlockedSkillIds = [...unlockedSkillIds, skillId];

    setUserXP(newXP);
    setUnlockedSkillIds(newUnlockedSkillIds);

    const userDocRef = doc(db, "users", authUser.uid);
    try {
        await updateDoc(userDocRef, {
            xp: newXP,
            unlockedSkillIds: newUnlockedSkillIds,
            updatedAt: serverTimestamp()
        });
        toast({ title: "¡Habilidad Desbloqueada!", description: `Has desbloqueado "${skillToUnlock.name}".` });
    } catch (error) {
        setUserXP(userXP);
        setUnlockedSkillIds(unlockedSkillIds);
        console.error("DataContext: Error unlocking skill", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo desbloquear la habilidad." });
    }
  }, [authUser, userXP, unlockedSkillIds, passiveSkills, toast]);

  useEffect(() => {
    if (!initialLoadComplete || authLoading || dataLoading) {
      return; 
    }

    if (previousXpRef.current !== undefined && userXP !== previousXpRef.current) {
      const xpDifference = userXP - previousXpRef.current;
      if (xpDifference > 0) {
        toast({
          title: "¡Experiencia Ganada!",
          description: `+${xpDifference} XP`,
        });
      }
    }

    if (previousRankRef.current && currentRank.name !== previousRankRef.current.name) {
      if (currentRank.xpRequired > previousRankRef.current.xpRequired) {
        toast({
          title: "¡Has Subido de Rango!",
          description: `Nuevo rango: ${currentRank.name.split(" - ")[1] || currentRank.name}`,
        });
      }
    }

    previousXpRef.current = userXP;
    previousRankRef.current = currentRank;

  }, [userXP, currentRank, toast, authLoading, dataLoading, initialLoadComplete]);


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
                  const effectiveMaxXP = (maxPossibleUserXP && maxPossibleUserXP > 0) ? maxPossibleUserXP : (userXP + 1000); 
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
  }, [userXP, habits, goals, sleepLogs]); 

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
      userName, userEmail, userXP, userAvatar, userStatus, isPremium, isLifetime, isAdmin,
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
      passiveSkills, unlockedSkillIds, unlockSkill,
      activeThemeId, setAppTheme, availableThemes,
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

export { ALL_PREDEFINED_ERAS_DATA } from '@/lib/eras-config';
