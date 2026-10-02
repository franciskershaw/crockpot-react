import { Logo } from "@/components/Logo";
import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { UserMenu } from "@/components/nav/UserMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/AuthContext";
import { goToGoogleLogin } from "@/features/auth/utils/googleLogin";
import { isYourCrockpotPath } from "@/features/your-crockpot/utils/yourCrockpotTabs";
import { cn } from "@/lib/utils";
import { Link, NavLink, useLocation } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `hover:text-foreground ${isActive ? "text-foreground underline underline-offset-4" : ""}`;

export function SiteHeader({ className }: { className?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname } = useLocation();
  const inYourCrockpot = isYourCrockpotPath(pathname);
  const showAuthedNav = !isLoading && isAuthenticated;
  const showAnonNav = !isLoading && !isAuthenticated;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-background",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" aria-label="Crockpot home">
          <Logo />
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 text-muted-foreground md:flex">
            <NavLink to="/recipes" className={navLinkClassName}>
              Browse recipes
            </NavLink>
            {showAuthedNav && (
              <>
                <Link
                  to="/menu"
                  aria-current={inYourCrockpot ? "page" : undefined}
                  className={navLinkClassName({ isActive: inYourCrockpot })}
                >
                  Your Crockpot
                </Link>
                <AddRecipeLink className={navLinkClassName} />
              </>
            )}
            {showAnonNav && (
              <>
                <Link to="/#how-it-works" className="hover:text-foreground">
                  How it works
                </Link>
                <Link to="/#pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </>
            )}
          </nav>

          {showAuthedNav && <UserMenu />}
          {showAnonNav && (
            <Button
              variant="outline"
              className="rounded-full border-foreground"
              onClick={goToGoogleLogin}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
