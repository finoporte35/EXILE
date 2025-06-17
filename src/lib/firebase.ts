
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"; // Added enableIndexedDbPersistence
import { getAuth } from "firebase/auth"; // We'll use auth later

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

const db = getFirestore(app);
const auth = getAuth(app); // We will use this later for user authentication

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      // This is a common scenario in development, so a warning is appropriate.
      console.warn("Firestore persistence failed: Multiple tabs open or other precondition error. Offline data might not be available in this tab.");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn("Firestore persistence failed: Browser does not support required features for offline data.");
    } else {
      console.error("Firestore persistence error:", err);
    }
  });

export { app, db, auth };

