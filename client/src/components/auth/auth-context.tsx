import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured, subscribeToAuth } from "@/lib/firebase";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (username: string, email: string, password: string, role?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true);
      return;
    }
    const unsub = subscribeToAuth((authUser: AuthUser | null) => {
      setUser(authUser);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login({ email, password }),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, email, password, role }: { username: string; email: string; password: string; role?: string }) =>
      authApi.register({ username, email, password, role }),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data);
      toast({
        title: "Registration successful",
        description: "Welcome to BuildMart AI!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "See you later!",
      });
    },
  });

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    return result.user;
  };

  const register = async (username: string, email: string, password: string, role?: string) => {
    const result = await registerMutation.mutateAsync({ username, email, password, role });
    return result.user;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAdmin = user?.role === "owner_admin" || user?.role === "vendor_manager";
  const isVendor = user?.role === "vendor";

  const isLoading = !authReady;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
