import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { goToGoogleLogin } from "@/features/auth/googleLogin";
import { Link } from "react-router-dom";

// Logged-out marketing header; the authenticated nav lands with the app shell.
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Crockpot home">
          <Logo />
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 text-muted-foreground md:flex">
            <Link to="/recipes" className="hover:text-foreground">
              Recipes
            </Link>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
          </nav>

          <Button
            variant="outline"
            className="rounded-full border-foreground"
            onClick={goToGoogleLogin}
          >
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}
