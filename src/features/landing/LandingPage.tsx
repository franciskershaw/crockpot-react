import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { SiteHeader } from "@/components/nav/SiteHeader";

import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { LandingFooter } from "./LandingFooter";
import { PlannerTease } from "./PlannerTease";
import { Pricing } from "./Pricing";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <SiteHeader />

      <main className="flex-1 pb-16 md:pb-24">
        <Hero />
        <HowItWorks />
        <PlannerTease />
        <Pricing />
      </main>

      <LandingFooter />
      <MobileTabBar />
    </div>
  );
}
