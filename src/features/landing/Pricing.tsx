import { Button } from "@/components/ui/button";
import { goToGoogleLogin } from "@/features/auth/googleLogin";

import { PricingCard, type Plan } from "./PricingCard";
import { RecipeCardPlaceholder } from "./RecipeCardPlaceholder";
import { HARD_SHADOW, SECTION_GAP } from "./styles";

const FREE: Plan = {
  name: "Free",
  price: "£0",
  period: "forever",
  featured: true,
  features: [
    "Browse and search every recipe",
    "Favourites and a weekly menu",
    "Automatic shopping list, sorted by aisle",
    "Up to 5 of your own recipes",
  ],
};

const PREMIUM: Plan = {
  name: "Premium",
  price: "£4.99",
  period: "a month",
  features: [
    "Everything in Free",
    "Unlimited recipes of your own",
    "Weekly meal planner",
    "Import any recipe from a link",
  ],
};

export function Pricing() {
  return (
    <section id="pricing" className={`mx-auto max-w-7xl px-6 ${SECTION_GAP}`}>
      <div className="flex items-center gap-6">
        <h2 className="font-display text-3xl sm:text-4xl">Pick a plan</h2>
        <span className="hidden h-px flex-1 bg-border sm:block" />
      </div>
      <p className="mt-3 text-muted-foreground">
        Free does the whole job. Premium is for people who cook a lot and plan
        the week ahead.
      </p>

      <div className="mt-10 lg:grid lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-12">
        <div className="hidden lg:relative lg:block lg:h-[440px]">
          <RecipeCardPlaceholder
            meta="25 mins · serves 4"
            className="absolute left-0 top-0 -rotate-3"
          />
          <RecipeCardPlaceholder
            meta="45 mins · serves 6"
            className="absolute bottom-0 right-4 rotate-2"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <PricingCard plan={FREE}>
            <Button
              onClick={goToGoogleLogin}
              className={`h-11 w-full font-semibold ${HARD_SHADOW}`}
            >
              Get started free
            </Button>
          </PricingCard>

          <PricingCard plan={PREMIUM}>
            <Button
              variant="outline"
              disabled
              className="h-11 w-full border-2 border-foreground"
            >
              Coming soon
            </Button>
          </PricingCard>
        </div>
      </div>
    </section>
  );
}
