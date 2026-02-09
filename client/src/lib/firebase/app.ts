import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseConfigured } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase is not configured. Add VITE_FIREBASE_* env vars (see .env.example)."
      );
    }
    app = getApps().length ? getApps()[0] as FirebaseApp : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === "true") {
      try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      } catch (_) {}
    }
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === "true") {
      try {
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
      } catch (_) {}
    }
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === "true") {
      try {
        connectStorageEmulator(storage, "127.0.0.1", 9199);
      } catch (_) {}
    }
  }
  return storage;
}
