import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { useAuth } from "@/features/auth/components/AuthContext";
import { goToGoogleLogin } from "@/features/auth/googleLogin";
import { LogIn, Plus, Search, UtensilsCrossed } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-3 text-sm ${
    isActive ? "text-foreground" : "text-muted-foreground"
  }`;

export function MobileTabBar() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
      <div className="mx-auto flex max-w-sm items-stretch justify-around">
        <NavLink to="/recipes" className={tabLinkClassName}>
          <Search className="size-5" />
          Browse Recipes
        </NavLink>

        {!isLoading && isAuthenticated && (
          <>
            <NavLink to="/menu" className={tabLinkClassName}>
              <UtensilsCrossed className="size-5" />
              Your Crockpot
            </NavLink>
            <AddRecipeLink className="flex flex-1 flex-col items-center gap-1 py-3 text-sm">
              <Plus className="size-5" />
              Add Recipe
            </AddRecipeLink>
          </>
        )}
        {!isLoading && !isAuthenticated && (
          <button
            type="button"
            onClick={goToGoogleLogin}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-muted-foreground"
          >
            <LogIn className="size-5" />
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
