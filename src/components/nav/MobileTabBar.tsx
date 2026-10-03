import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { useAuth } from "@/features/auth/components/AuthContext";
import { isYourCrockpotPath } from "@/features/your-crockpot/utils/yourCrockpotTabs";
import { LogIn, Plus, Search, UtensilsCrossed } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

const tabLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-3 text-sm ${
    isActive ? "text-foreground" : "text-muted-foreground"
  }`;

export function MobileTabBar() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname } = useLocation();
  const inYourCrockpot = isYourCrockpotPath(pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
      <div className="mx-auto flex max-w-sm items-stretch justify-around">
        <NavLink to="/recipes" className={tabLinkClassName}>
          <Search className="size-5" />
          Browse Recipes
        </NavLink>

        {!isLoading && isAuthenticated && (
          <>
            <Link
              to="/menu"
              aria-current={inYourCrockpot ? "page" : undefined}
              className={tabLinkClassName({ isActive: inYourCrockpot })}
            >
              <UtensilsCrossed className="size-5" />
              Your Crockpot
            </Link>
            <AddRecipeLink className={tabLinkClassName}>
              <Plus className="size-5" />
              Add Recipe
            </AddRecipeLink>
          </>
        )}
        {!isLoading && !isAuthenticated && (
          <Link
            to="/login"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-muted-foreground"
          >
            <LogIn className="size-5" />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
