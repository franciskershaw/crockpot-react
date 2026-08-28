import { GoogleIcon } from "@/components/GoogleIcon";
import { Button } from "@/components/ui/button";
import { goToGoogleLogin } from "@/features/auth/googleLogin";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { RecipeCardPlaceholder } from "./RecipeCardPlaceholder";
import { HARD_SHADOW } from "./styles";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="space-y-6">
        <p className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            189 recipes · free forever tier · no card
          </span>
          <span className="sm:hidden">189 recipes · free forever</span>
        </p>

        <h1 className="font-display text-[33px] font-medium leading-[1.1] sm:text-[74px] sm:leading-[1.05]">
          Never write a shopping list again.
        </h1>

        <p className="max-w-md text-[15px] text-muted-foreground sm:text-xl">
          Pick the meals you fancy this week. Crockpot adds up every ingredient
          across them and hands you one tidy list, sorted by aisle.
        </p>

        <div className="space-y-4">
          <Button
            asChild
            className={`h-12 w-full text-base font-semibold [&_svg]:size-5 ${HARD_SHADOW}`}
          >
            <Link to="/recipes">
              Browse recipes
              <ArrowRight />
            </Link>
          </Button>

          <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or save your menu
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            onClick={goToGoogleLogin}
            className="h-12 w-full border-2 border-foreground text-base [&_svg]:size-5"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>
      </div>

      <div className="lg:relative lg:h-[420px]">
        <div className="hidden lg:block">
          <RecipeCardPlaceholder
            meta="30 mins · serves 4"
            className="absolute left-0 top-0 -rotate-3"
          />
          <RecipeCardPlaceholder
            meta="40 mins · serves 2"
            className="absolute right-0 top-10 rotate-3"
          />
          <RecipeCardPlaceholder
            meta="320 mins · serves 12"
            className="absolute bottom-0 left-1/4 -rotate-2"
          />
        </div>
        <RecipeCardPlaceholder
          meta="320 mins · serves 12"
          className="mx-auto w-full max-w-sm lg:hidden"
        />
      </div>
    </section>
  );
}
