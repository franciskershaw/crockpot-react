import { Button } from "@/components/ui/button";

import { SUBSECTION_GAP } from "./styles";

export function PlannerTease() {
  return (
    <section className={`mx-auto max-w-7xl px-6 ${SUBSECTION_GAP}`}>
      <div className="rounded-xl border border-dashed border-foreground/30 p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl sm:text-2xl">
              <span className="hidden md:inline">
                And if you want to plan the week
              </span>
              <span className="md:hidden">Want to plan the week?</span>
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              Optional
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            <span className="hidden md:inline">
              Switch the Planner on and your menu recipes drop into breakfast,
              lunch and dinner slots across seven days. Switch it off and
              Crockpot stays a menu and a list.
            </span>
            <span className="md:hidden">
              Switch the Planner on and your menu drops into breakfast, lunch
              and dinner slots across the week.
            </span>
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="mt-4 w-full border-2 border-foreground md:mt-0 md:w-auto"
        >
          <a href="#pricing">See the planner</a>
        </Button>
      </div>
    </section>
  );
}
