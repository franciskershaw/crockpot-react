import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { SiteHeader } from "@/components/nav/SiteHeader";

import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — step 4 */}
        {/* How it works — step 5 */}
        {/* Planner tease — step 5 */}
        {/* Pricing — step 6 */}
      </main>

      <LandingFooter />
      <MobileTabBar />
    </div>
  );
}
