import { useScrollToHash } from "@/lib/useScrollToHash";

import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { LandingFooter } from "./LandingFooter";
import { PlannerTease } from "./PlannerTease";
import { Pricing } from "./Pricing";

export function LandingPage() {
  useScrollToHash();

  return (
    <>
      <div className="pb-16 md:pb-24">
        <Hero />
        <HowItWorks />
        <PlannerTease />
        <Pricing />
      </div>

      <LandingFooter />
    </>
  );
}
