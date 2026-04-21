"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api, AuthResponse, AUTH_TOKEN_KEY, AUTH_USER_KEY, WORKSPACE_TOKEN_KEY, WORKSPACE_USER_KEY } from "@/lib/api";

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
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!token) return;
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

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(WORKSPACE_TOKEN_KEY);
      localStorage.removeItem(WORKSPACE_USER_KEY);
      setUser(null);
    }
  }, []);

  // Hydrate and validate existing auth state on mount
  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      if (!isMounted) return;
      await fetchUser();
      if (isMounted) setLoading(false);
    }

    hydrateAuth();
    return () => {
      isMounted = false;
    };
  }, [fetchUser]);

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
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(WORKSPACE_TOKEN_KEY);
    localStorage.removeItem(WORKSPACE_USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
