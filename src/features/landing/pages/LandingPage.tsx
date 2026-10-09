import { useState } from "react";
import { useScrollToHash } from "@/lib/useScrollToHash";

import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { LandingFooter } from "../components/LandingFooter";
import { PlannerTease } from "../components/PlannerTease";
import { Pricing } from "../components/Pricing";
import { pickShowcaseRecipes } from "../utils/showcaseRecipes";

export function LandingPage() {
  useScrollToHash();
  const [showcase] = useState(pickShowcaseRecipes);

  return (
    <>
      <div className="pb-16 md:pb-24">
        <Hero recipes={showcase.slice(0, 3)} />
        <HowItWorks />
        <PlannerTease />
        <Pricing recipes={showcase.slice(3)} />
      </div>

      <LandingFooter />
    </>
  );
}
