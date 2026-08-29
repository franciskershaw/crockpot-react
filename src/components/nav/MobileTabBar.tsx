import { goToGoogleLogin } from "@/features/auth/googleLogin";
import { LogIn, Search } from "lucide-react";
import { Link } from "react-router-dom";

// Logged-out state only; the authenticated tabs land with the app shell.
export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
      <div className="mx-auto flex max-w-sm items-stretch justify-around">
        <Link
          to="/recipes"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-muted-foreground"
        >
          <Search className="size-5" />
          Browse Recipes
        </Link>
        <button
          type="button"
          onClick={goToGoogleLogin}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-muted-foreground"
        >
          <LogIn className="size-5" />
          Login
        </button>
      </div>
    </nav>
  );
}
