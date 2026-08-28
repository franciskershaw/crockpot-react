import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between md:gap-0">
        <Logo />

        <nav className="flex items-center gap-6 text-background/70">
          <Link to="/recipes" className="hover:text-background">
            Recipes
          </Link>
          <a href="#pricing" className="hover:text-background">
            Pricing
          </a>
          <span>Privacy</span>
          <span className="hidden md:inline">Contact</span>
        </nav>
      </div>
    </footer>
  );
}
