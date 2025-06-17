// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getFirestore, // Keep for fallback
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace this with your actual Firebase project configuration
// You can get this from the Firebase Console:
// Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "AIzaSyC5AgDKX5xDhUaCb-4covFzhNTOhF8IlLQ",
  authDomain: "exile-g5epm.firebaseapp.com",
  databaseURL: "https://exile-g5epm-default-rtdb.firebaseio.com",
  projectId: "exile-g5epm",
  storageBucket: "exile-g5epm.firebasestorage.app",
  messagingSenderId: "760117097307",
  appId: "1:760117097307:web:d7aa97617d0fb99cd9e07e"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let db;

try {
  // Initialize Firestore with multi-tab persistent cache.
  // This aligns with the recommendation to use FirestoreSettings.cache.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  // console.log("Firestore initialized with persistent cache (multi-tab)."); // Optional: for debugging
} catch (error: any) {
  console.warn("Firestore initialization with persistent cache failed:", error.code, error.message);
  if (error.code === 'failed-precondition') {
    console.warn(
      "This usually means another tab has already initialized persistence. " +
      "Firestore will work in this tab, but offline capabilities might be limited to this tab or use in-memory cache if persistent cache is locked."
    );
  } else if (error.code === 'unimplemented') {
     console.warn(
        "The browser does not support all features required for persistent cache. Firestore will use in-memory cache."
     );
  }
  // Fallback to default Firestore initialization.
  // This might still enable single-tab persistence or use memory cache depending on the browser and SDK defaults.
  console.log("Falling back to default Firestore initialization (getFirestore).");
  db = getFirestore(app);
}

const auth = getAuth(app);

export { app, db, auth };
