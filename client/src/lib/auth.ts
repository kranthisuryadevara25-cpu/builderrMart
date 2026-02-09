import {
  isFirebaseConfigured,
  registerWithEmail,
  loginWithEmail,
  signOut,
  getCurrentUserProfile,
  type AuthUser,
} from "@/lib/firebase";

export type { AuthUser };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser }> {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Add VITE_FIREBASE_* env vars.");
    const user = await loginWithEmail(credentials.email, credentials.password);
    return { user };
  },

  async register(data: RegisterData): Promise<{ user: AuthUser }> {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Add VITE_FIREBASE_* env vars.");
    const user = await registerWithEmail(
      data.email,
      data.password,
      data.username,
      (data.role as "owner_admin" | "vendor_manager" | "vendor" | "user") ?? "user"
    );
    return { user };
  },

  async logout(): Promise<void> {
    if (!isFirebaseConfigured) return;
    await signOut();
  },

  async getCurrentUser(): Promise<{ user: AuthUser } | { user: null }> {
    if (!isFirebaseConfigured) return { user: null };
    const user = await getCurrentUserProfile();
    return { user: user ?? null } as { user: AuthUser } | { user: null };
  },
};
