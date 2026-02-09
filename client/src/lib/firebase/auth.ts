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

/** Super Admin UID – always gets owner_admin access and admin panel, even if Firestore profile is missing. */
export const SUPER_ADMIN_UID = "nOtjfkijQOfz3qg3ObRdtrDFqwE3";

/** Test Manager UID – vendor management (vendor_manager role). */
export const TEST_MANAGER_UID = "X5Vf2GRrRnQK60kR5cFdtQbuvaI3";

/** Test Vendor UID – product management (vendor role). */
export const TEST_VENDOR_UID = "qoiW5CqK4IM4wxz0rCwJd3H8AYZ2";

function firestoreUserToAuthUser(u: FirestoreUser): AuthUser {
  const isSuperAdmin = u.id === SUPER_ADMIN_UID;
  const isTestManager = u.id === TEST_MANAGER_UID;
  const isTestVendor = u.id === TEST_VENDOR_UID;
  const role = isSuperAdmin ? "owner_admin" : isTestManager ? "vendor_manager" : isTestVendor ? "vendor" : u.role;
  const active = isSuperAdmin || isTestManager || isTestVendor ? true : u.isActive;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role,
    isActive: active,
  };
}

/** Synthetic Super Admin profile when Firestore doc is missing (e.g. first-time setup). */
function superAdminAuthUser(uid: string): AuthUser {
  return {
    id: uid,
    username: "admin@buildmart.ai",
    email: "admin@buildmart.ai",
    role: "owner_admin",
    isActive: true,
  };
}

/** Synthetic test Manager profile when Firestore doc is missing. */
function testManagerAuthUser(uid: string, email?: string | null): AuthUser {
  const e = email || "manager@buildmart.ai";
  return { id: uid, username: e, email: e, role: "vendor_manager", isActive: true };
}

/** Synthetic test Vendor profile when Firestore doc is missing. */
function testVendorAuthUser(uid: string, email?: string | null): AuthUser {
  const e = email || "vendor1@buildmart.ai";
  return { id: uid, username: e, email: e, role: "vendor", isActive: true };
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

/** Map Firebase Auth error codes to user-friendly messages. */
function getAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  const message = (err as { message?: string })?.message;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Try again later or reset your password.";
    default:
      return message && typeof message === "string" ? message : "Login failed. Check your email and password.";
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
  const uid = auth.currentUser?.uid;
  const fbEmail = auth.currentUser?.email ?? undefined;
  if (!uid) throw new Error("Login succeeded but no user");
  const profile = await getUserProfile(uid);
  if (!profile) {
    if (uid === SUPER_ADMIN_UID) return superAdminAuthUser(uid);
    if (uid === TEST_MANAGER_UID) return testManagerAuthUser(uid, fbEmail);
    if (uid === TEST_VENDOR_UID) return testVendorAuthUser(uid, fbEmail);
    throw new Error("User profile not found. If you just signed up, try logging in again.");
  }
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
  if (!profile) {
    if (fbUser.uid === SUPER_ADMIN_UID) return superAdminAuthUser(fbUser.uid);
    if (fbUser.uid === TEST_MANAGER_UID) return testManagerAuthUser(fbUser.uid, fbUser.email);
    if (fbUser.uid === TEST_VENDOR_UID) return testVendorAuthUser(fbUser.uid, fbUser.email);
    return null;
  }
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
    if (profile) {
      callback(firestoreUserToAuthUser(profile));
    } else if (fbUser.uid === SUPER_ADMIN_UID) {
      callback(superAdminAuthUser(fbUser.uid));
    } else if (fbUser.uid === TEST_MANAGER_UID) {
      callback(testManagerAuthUser(fbUser.uid, fbUser.email));
    } else if (fbUser.uid === TEST_VENDOR_UID) {
      callback(testVendorAuthUser(fbUser.uid, fbUser.email));
    } else {
      callback(null);
    }
  });
  return unsub;
}
