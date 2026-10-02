import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { AppShell } from "@/components/nav/AppShell";
import { useAuth } from "@/features/auth/components/AuthContext";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { YourCrockpotLayout } from "@/features/your-crockpot/pages/YourCrockpotLayout";
import { Navigate, Route, Routes } from "react-router-dom";

import { DEFAULT_AUTHENTICATED_ROUTE } from "./routes";

// LandingPage stays eager as the anonymous first view; everything else is lazy so it never carries motion/zod/cmdk. YourCrockpotLayout stays eager and suspends its own tab body, keeping the header up.
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
const CreateRecipePage = lazyNamed(
  () => import("@/features/recipes-form/pages/CreateRecipePage"),
  "CreateRecipePage",
);
const EditRecipeRoute = lazyNamed(
  () => import("@/features/recipes-form/pages/EditRecipePage"),
  "EditRecipeRoute",
);
const MenuPage = lazyNamed(
  () => import("@/features/menu/pages/MenuPage"),
  "MenuPage",
);
const FavouritesPage = lazyNamed(
  () => import("@/features/your-crockpot/pages/FavouritesPage"),
  "FavouritesPage",
);
const MyRecipesPage = lazyNamed(
  () => import("@/features/your-crockpot/pages/MyRecipesPage"),
  "MyRecipesPage",
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
          path="/recipes/new"
          element={
            <RequireAuth>
              <CreateRecipePage />
            </RequireAuth>
          }
        />
        <Route path="/recipes/:id" element={<RecipeDetailRoute />} />
        <Route
          path="/recipes/:id/edit"
          element={
            <RequireAuth>
              <EditRecipeRoute />
            </RequireAuth>
          }
        />
        <Route
          element={
            <RequireAuth>
              <YourCrockpotLayout />
            </RequireAuth>
          }
        >
          <Route path="/menu" element={<MenuPage />} />
          <Route
            path="/library"
            element={<Navigate to="/library/favourites" replace />}
          />
          <Route path="/library/favourites" element={<FavouritesPage />} />
          <Route path="/library/my-recipes" element={<MyRecipesPage />} />
        </Route>
        <Route
          path="/favourites"
          element={<Navigate to="/library/favourites" replace />}
        />
        <Route
          path="/my-recipes"
          element={<Navigate to="/library/my-recipes" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
