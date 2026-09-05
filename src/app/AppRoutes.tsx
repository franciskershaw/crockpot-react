import { AppShell } from "@/components/nav/AppShell";
import { useAuth } from "@/features/auth/components/AuthContext";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { AuthCallback } from "@/features/auth/pages/AuthCallback";
import { LandingPage } from "@/features/landing/LandingPage";
import { MenuScreen } from "@/features/menu/MenuScreen";
import { BrowseRecipesPage } from "@/features/recipes/pages/BrowseRecipesPage";
import { Navigate, Route, Routes } from "react-router-dom";

import { DEFAULT_AUTHENTICATED_ROUTE } from "./routes";

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            isLoading ? null : isAuthenticated ? (
              <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/recipes" element={<BrowseRecipesPage />} />
        <Route
          path="/menu"
          element={
            <RequireAuth>
              <MenuScreen />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
