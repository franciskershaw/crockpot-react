import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { Button } from "@/components/ui/button";
import { goToGoogleLogin } from "@/features/auth/utils/googleLogin";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { type ShowcaseRecipe } from "../utils/showcaseRecipes";
import { HARD_SHADOW } from "../utils/styles";
import { ShowcaseRecipeCard } from "./ShowcaseRecipeCard";

export function Hero({ recipes }: { recipes: ShowcaseRecipe[] }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-8 md:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
      <div className="space-y-6">
        <h1 className="font-display text-[33px] font-medium leading-[1.1] text-balance sm:text-[74px] sm:leading-[1.05]">
          Never write a shopping list again.
        </h1>

        <p className="max-w-md text-[15px] text-muted-foreground sm:text-xl">
          Pick the meals you fancy this week. Crockpot adds up every ingredient
          across them and hands you one tidy list, sorted by aisle.
        </p>

        <div className="max-w-md space-y-4">
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

          <Link
            to="/register"
            className="block text-center text-[13px] text-placeholder underline underline-offset-3 hover:text-foreground"
          >
            continue with email instead
          </Link>
        </div>
      </div>

      <div className="hidden lg:relative lg:block lg:h-125">
        <ShowcaseRecipeCard
          recipe={recipes[0]}
          className="absolute left-0 top-0 -rotate-3"
        />
        <ShowcaseRecipeCard
          recipe={recipes[1]}
          className="absolute right-0 top-12 rotate-3"
        />
        <ShowcaseRecipeCard
          recipe={recipes[2]}
          className="absolute bottom-0 left-16 -rotate-2"
        />
      </div>
    </section>
  );
}
