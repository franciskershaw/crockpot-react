import type { ReactNode } from "react";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/app/routes";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext";

export function RequireSignedOut({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    return <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace />;
  }
  return children;
}
