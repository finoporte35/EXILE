
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
