"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api, AuthResponse, ApiError } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  role: string;
  emailVerified?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (data: { name: string; email: string; password: string; college?: string; year?: string }) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate and validate existing auth state on mount
  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      const token = localStorage.getItem("sb_token");
      const stored = localStorage.getItem("sb_user");

      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        const storedUser = stored ? JSON.parse(stored) : null;
        const userData: User = {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          emailVerified: me.emailVerified,
          college: me.college ?? storedUser?.college,
          year: me.year ?? storedUser?.year,
        };

        localStorage.setItem("sb_user", JSON.stringify(userData));
        if (isMounted) setUser(userData);
      } catch {
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_user");
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    hydrateAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveAuth = useCallback((data: AuthResponse) => {
    const userData: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      college: data.college,
      year: data.year,
      role: data.role,
      emailVerified: data.emailVerified,
    };
    localStorage.setItem("sb_token", data.token);
    localStorage.setItem("sb_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    saveAuth(data);
    return data;
  }, [saveAuth]);

  const signup = useCallback(async (body: { name: string; email: string; password: string; college?: string; year?: string }) => {
    const data = await api.signup(body);
    saveAuth(data);
    return data;
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
