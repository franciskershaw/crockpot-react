import { Link } from "react-router-dom";

import { ClearMenuDialog } from "./ClearMenuDialog";

export function MenuFooterPill({ recipeCount }: { recipeCount: number }) {
  return (
    <div className="sticky bottom-7 mt-6 hidden w-fit md:flex lg:absolute lg:left-0 lg:mt-0 items-center gap-1 rounded-full border border-pill-border bg-card p-1.5 shadow-[0_12px_30px_rgba(35,32,27,0.2)]">
      {recipeCount === 0 ? (
        <>
          <span className="px-3 text-sm">Menu is empty</span>
          <Link
            to="/recipes"
            className="rounded-full bg-foreground px-4.5 py-2.5 text-sm font-bold text-on-dark"
          >
            Browse recipes
          </Link>
        </>
      ) : (
        <>
          <span className="px-3 text-sm">
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"} on your
            menu
          </span>
          <ClearMenuDialog
            trigger={
              <button
                type="button"
                className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold text-rust-text transition-colors hover:bg-chip"
              >
                Clear menu
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
