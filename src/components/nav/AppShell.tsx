import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { Outlet } from "react-router-dom";

// Mounted once for every route; SiteHeader/MobileTabBar branch on auth state
// internally so there's one nav, not a separate one per auth state.
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <MobileTabBar />
    </div>
  );
}
