import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { Link } from "react-router-dom";

import { useClearMenu } from "../hooks/useClearMenu";

export function MenuFooterPill({ recipeCount }: { recipeCount: number }) {
  const clearMenu = useClearMenu();

  return (
    <div className="sticky bottom-7 mt-6 flex w-fit lg:absolute lg:left-0 lg:mt-0 items-center gap-1 rounded-full border border-pill-border bg-card p-1.5 shadow-[0_12px_30px_rgba(35,32,27,0.2)]">
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
          <ConfirmActionDialog
            trigger={
              <button
                type="button"
                className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold text-rust-text transition-colors hover:bg-chip"
              >
                Clear menu
              </button>
            }
            title="Clear your menu?"
            description="This removes every recipe from your menu and rebuilds your shopping list. Items you've added by hand stay."
            confirmLabel="Clear menu"
            pendingLabel="Clearing…"
            destructive
            onConfirm={(close) => {
              clearMenu.mutate();
              close();
            }}
          />
        </>
      )}
    </div>
  );
}
