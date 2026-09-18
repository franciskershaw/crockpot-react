import { useScrollToHash } from "@/lib/useScrollToHash";

import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { LandingFooter } from "../components/LandingFooter";
import { PlannerTease } from "../components/PlannerTease";
import { Pricing } from "../components/Pricing";

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
