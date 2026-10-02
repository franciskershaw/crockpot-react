import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  ApiError,
  onSessionExpired,
  refreshAccessToken,
} from "@/lib/http/client";
import { setAccessToken } from "@/lib/http/tokenStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchMe } from "../data/api";
import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import type { User } from "../data/types";
import { endSession } from "../utils/endSession";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      onSessionExpired(() => {
        if (endSession(queryClient)) {
          toast.info("Your session has ended. Please sign in again.", {
            id: "session-expired",
          });
        }
      }),
    [queryClient],
  );

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
