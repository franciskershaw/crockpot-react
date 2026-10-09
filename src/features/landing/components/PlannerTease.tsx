import { SUBSECTION_GAP } from "../utils/styles";

export function PlannerTease() {
  return (
    <section className={`mx-auto max-w-7xl px-6 ${SUBSECTION_GAP}`}>
      <div className="rounded-xl border border-dashed border-foreground/30 p-6 md:p-8">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl sm:text-2xl">
              <span className="hidden md:inline">
                And if you want to plan the week
              </span>
              <span className="md:hidden">Want to plan the week?</span>
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              Coming soon
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            <span className="hidden md:inline">
              Soon you'll be able to drop your menu recipes into breakfast,
              lunch and dinner slots across seven days. Leave it off and
              Crockpot stays a menu and a list.
            </span>
            <span className="md:hidden">
              Soon you'll be able to drop your menu into breakfast, lunch and
              dinner slots across the week.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
