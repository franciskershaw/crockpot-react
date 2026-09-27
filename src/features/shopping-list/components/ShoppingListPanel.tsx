import { useState } from "react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { useMenu } from "@/features/menu/hooks/useMenu";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

import { useClearShoppingList } from "../hooks/useClearShoppingList";
import { useShoppingList } from "../hooks/useShoppingList";
import { groupShoppingList } from "../utils/groupShoppingList";
import { AddExtraItem, type RecentlyAdded } from "./AddExtraItem";
import { RegenerateShoppingListButton } from "./RegenerateShoppingListButton";
import { ShoppingListCategory } from "./ShoppingListCategory";

export function ShoppingListPanel({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const { data } = useShoppingList();
  const { data: menu } = useMenu();
  const clear = useClearShoppingList();
  const [recentlyAdded, setRecentlyAdded] = useState<RecentlyAdded | null>(
    null,
  );

  const recipeCount = menu?.entries.length ?? 0;
  const grouped = data ? groupShoppingList(data.items) : null;

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-panel lg:max-h-full",
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-3 bg-foreground py-3.25 pr-4 pl-5 text-on-dark">
        <h2 className="flex-1 font-display text-[23px] font-normal">
          Shopping list
        </h2>
        {grouped && (
          <span className="text-[13px] text-on-dark-muted tabular-nums">
            {grouped.obtainedCount} / {grouped.totalCount}
          </span>
        )}
        <RegenerateShoppingListButton disabled={recipeCount === 0} />
        {onClose && (
          <button
            type="button"
            aria-label="Close shopping list"
            onClick={onClose}
            className="-my-2 -mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-dark-muted transition-colors hover:text-on-dark"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        )}
      </header>

      <AddExtraItem onAdded={setRecentlyAdded} />

      <div className="-mb-px min-h-0 overflow-y-auto">
        {grouped &&
          (grouped.groups.length > 0 ? (
            grouped.groups.map((group) => (
              <ShoppingListCategory
                key={group.categoryId}
                group={group}
                recentlyAdded={recentlyAdded}
              />
            ))
          ) : (
            <p
              className={cn(
                "border-b border-card-shadow px-4.5 py-6 text-sm text-ink-subtle",
                recipeCount === 0 && "text-center leading-relaxed",
              )}
            >
              {recipeCount > 0 ? (
                "Your list is empty — Regenerate to rebuild it from your menu."
              ) : (
                <>
                  Your list is empty.
                  <br /> Add a recipe, or add an item by hand above.
                </>
              )}
            </p>
          ))}
      </div>

      <footer className="flex shrink-0 items-center border-t border-card-shadow justify-between px-4.5 py-3.5">
        <span className="text-[13px] text-ink-subtle">
          Built from {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"} on
          your menu
        </span>
        {grouped && grouped.totalCount > 0 && (
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
            destructive
            onConfirm={(close) => {
              clear.mutate();
              close();
            }}
          />
        )}
      </footer>
    </section>
  );
}
