import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { SiteHeader } from "@/components/nav/SiteHeader";

import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { LandingFooter } from "./LandingFooter";
import { PlannerTease } from "./PlannerTease";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <SiteHeader />

      <main className="flex-1 pb-16 md:pb-24">
        <Hero />
        <HowItWorks />
        <PlannerTease />
        {/* Pricing — step 6 */}
      </main>

      <LandingFooter />
      <MobileTabBar />
    </div>
  );
}
