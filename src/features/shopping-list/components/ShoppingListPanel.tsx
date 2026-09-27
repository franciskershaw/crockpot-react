import { useMenu } from "@/features/menu/hooks/useMenu";

import { useClearShoppingList } from "../hooks/useClearShoppingList";
import { useShoppingList } from "../hooks/useShoppingList";
import { groupShoppingList } from "../utils/groupShoppingList";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { RegenerateShoppingListButton } from "./RegenerateShoppingListButton";
import { ShoppingListCategory } from "./ShoppingListCategory";

export function ShoppingListPanel() {
  const { data } = useShoppingList();
  const { data: menu } = useMenu();
  const clear = useClearShoppingList();

  const recipeCount = menu?.entries.length ?? 0;
  const grouped = data ? groupShoppingList(data.items) : null;

  return (
    <section className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_6px_20px_rgba(60,48,30,0.07)]">
      <header className="flex items-center gap-3 bg-foreground py-3.25 pr-4 pl-5 text-on-dark">
        <h2 className="flex-1 font-display text-[23px] font-normal">
          Shopping list
        </h2>
        {grouped && (
          <span className="text-[13px] text-on-dark-muted tabular-nums">
            {grouped.obtainedCount} / {grouped.totalCount}
          </span>
        )}
        <RegenerateShoppingListButton disabled={recipeCount === 0} />
      </header>

      {grouped &&
        (grouped.groups.length > 0 ? (
          grouped.groups.map((group) => (
            <ShoppingListCategory key={group.categoryId} group={group} />
          ))
        ) : (
          <p className="border-b border-card-shadow px-4.5 py-6 text-sm text-ink-subtle">
            {recipeCount > 0
              ? "Your list is empty — Regenerate to rebuild it from your menu."
              : "Add recipes to your menu to build a shopping list."}
          </p>
        ))}

      <footer className="flex items-center justify-between px-4.5 py-3.5">
        <span className="text-[13px] text-ink-subtle">
          Built from {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"} on
          your menu
        </span>
        <ConfirmActionDialog
          trigger={
            <button
              type="button"
              className="cursor-pointer text-sm font-semibold text-rust-text"
            >
              Clear list
            </button>
          }
          title="Clear shopping list?"
          description="This removes every item, including ones you've added yourself."
          confirmLabel="Clear list"
          pendingLabel="Clearing…"
          destructive
          onConfirm={(close) => {
            clear.mutate();
            close();
          }}
        />
      </footer>
    </section>
  );
}
