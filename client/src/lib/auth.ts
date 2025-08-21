import { apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

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
    const res = await apiRequest("POST", "/api/auth/login", credentials);
    return res.json();
  },

  async register(data: RegisterData): Promise<{ user: AuthUser }> {
    const res = await apiRequest("POST", "/api/auth/register", data);
    return res.json();
  },

  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  },

  async getCurrentUser(): Promise<{ user: AuthUser }> {
    const res = await apiRequest("GET", "/api/auth/me");
    return res.json();
  },
};
