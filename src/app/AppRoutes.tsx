import { AuthCallback } from "@/features/auth/AuthCallback";
import { useAuth } from "@/features/auth/AuthContext";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { SignInPlaceholder } from "@/features/auth/SignInPlaceholder";
import { MenuScreen } from "@/features/menu/MenuScreen";
import { RecipesComingSoon } from "@/features/recipes/RecipesComingSoon";
import { Navigate, Route, Routes } from "react-router-dom";

import { DEFAULT_AUTHENTICATED_ROUTE } from "./routes";

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoading ? null : isAuthenticated ? (
            <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace />
          ) : (
            <SignInPlaceholder />
          )
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/recipes" element={<RecipesComingSoon />} />
      <Route
        path="/menu"
        element={
          <RequireAuth>
            <MenuScreen />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
