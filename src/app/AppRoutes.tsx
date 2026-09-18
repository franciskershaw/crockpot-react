import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { AppShell } from "@/components/nav/AppShell";
import { useAuth } from "@/features/auth/components/AuthContext";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { MenuPage } from "@/features/menu/pages/MenuPage";
import { Navigate, Route, Routes } from "react-router-dom";

import { DEFAULT_AUTHENTICATED_ROUTE } from "./routes";

// Only BrowseRecipesPage/AuthCallback/RecipeDetailRoute are lazy; LandingPage/MenuPage are most visitors' first view and gain nothing from a chunk round trip.
function lazyNamed<
  M extends Record<K, ComponentType>,
  K extends keyof M & string,
>(factory: () => Promise<M>, name: K): LazyExoticComponent<M[K]> {
  return lazy(() => factory().then((m) => ({ default: m[name] })));
}

const AuthCallback = lazyNamed(
  () => import("@/features/auth/pages/AuthCallback"),
  "AuthCallback",
);
const BrowseRecipesPage = lazyNamed(
  () => import("@/features/recipes-browse/pages/BrowseRecipesPage"),
  "BrowseRecipesPage",
);
const RecipeDetailRoute = lazyNamed(
  () => import("@/features/recipes-detail/pages/RecipeDetailPage"),
  "RecipeDetailRoute",
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
        <Route path="/recipes/:id" element={<RecipeDetailRoute />} />
        <Route
          path="/menu"
          element={
            <RequireAuth>
              <MenuPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
