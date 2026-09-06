import { lazy } from "react";
import { AppShell } from "@/components/nav/AppShell";
import { useAuth } from "@/features/auth/components/AuthContext";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { Navigate, Route, Routes } from "react-router-dom";

import { DEFAULT_AUTHENTICATED_ROUTE } from "./routes";

const AuthCallback = lazy(() =>
  import("@/features/auth/pages/AuthCallback").then((m) => ({
    default: m.AuthCallback,
  })),
);
const LandingPage = lazy(() =>
  import("@/features/landing/LandingPage").then((m) => ({
    default: m.LandingPage,
  })),
);
const MenuScreen = lazy(() =>
  import("@/features/menu/MenuScreen").then((m) => ({
    default: m.MenuScreen,
  })),
);
const BrowseRecipesPage = lazy(() =>
  import("@/features/recipes/pages/BrowseRecipesPage").then((m) => ({
    default: m.BrowseRecipesPage,
  })),
);

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
