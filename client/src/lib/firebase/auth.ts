import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./app";
import type { FirestoreUser, UserRole } from "./types";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

const USERS_COLLECTION = "users";

function firestoreUserToAuthUser(u: FirestoreUser): AuthUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
  };
}

/** Create Firestore user profile (call after createUserWithEmailAndPassword). */
export async function createUserProfile(
  uid: string,
  data: {
    username: string;
    email: string;
    role?: UserRole;
  }
): Promise<FirestoreUser> {
  const db = getFirebaseDb();
  const now = new Date().toISOString();
  const profile: Omit<FirestoreUser, "id"> = {
    username: data.username,
    email: data.email,
    role: data.role ?? "user",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const ref = doc(db, USERS_COLLECTION, uid);
  await setDoc(ref, { ...profile, id: uid });
  return { id: uid, ...profile } as FirestoreUser;
}

/** Get user profile from Firestore by uid. */
export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const db = getFirebaseDb();
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreUser;
}

export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
  role?: UserRole
): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const profile = await createUserProfile(cred.user.uid, {
    username,
    email,
    role: role ?? "user",
  });
  return firestoreUserToAuthUser(profile);
}

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  await signInWithEmailAndPassword(auth, email, password);
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Login succeeded but no user");
  const profile = await getUserProfile(uid);
  if (!profile) throw new Error("User profile not found");
  return firestoreUserToAuthUser(profile);
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

export async function getCurrentUserProfile(): Promise<AuthUser | null> {
  const auth = getFirebaseAuth();
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  const profile = await getUserProfile(fbUser.uid);
  if (!profile) return null;
  return firestoreUserToAuthUser(profile);
}

/** Subscribe to auth state; callback receives AuthUser | null (null when logged out or profile missing). */
export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    const profile = await getUserProfile(fbUser.uid);
    callback(profile ? firestoreUserToAuthUser(profile) : null);
  });
  return unsub;
}
