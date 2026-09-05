import { createContext, useContext, type ReactNode } from "react";
import { ApiError, refreshAccessToken } from "@/lib/http/client";
import { setAccessToken } from "@/lib/http/tokenStore";
import { useQuery } from "@tanstack/react-query";

import { fetchMe } from "../api";
import type { User } from "../types";

export async function fetchSession(): Promise<User | null> {
  try {
    await refreshAccessToken();
    return await fetchMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      setAccessToken(null);
      return null;
    }
    throw e;
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchSession,
    retry: 1,
    staleTime: Infinity,
  });

  const value: AuthContextValue = {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
