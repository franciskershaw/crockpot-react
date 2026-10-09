import { Logo } from "@/components/brand/Logo";
import { CONTACT_EMAIL } from "@/lib/contact";
import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between md:gap-0">
        <Logo />

        <nav className="flex items-center gap-6 text-background/70">
          <Link to="/recipes" className="hover:text-background">
            Recipes
          </Link>
          <Link to="/privacy" className="hover:text-background">
            Privacy
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-background">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
