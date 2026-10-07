import { useState } from "react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { useMenu } from "@/features/menu/hooks/useMenu";
import { cn } from "@/lib/utils";
import { ChevronLeft, Pencil, X } from "lucide-react";

import type { AddedRow, RecentlyAdded } from "../data/types";
import { useClearShoppingList } from "../hooks/useClearShoppingList";
import { useRegulars } from "../hooks/useRegulars";
import { useShoppingList } from "../hooks/useShoppingList";
import { groupShoppingList } from "../utils/groupShoppingList";
import { isRecentlyAdded } from "../utils/isRecentlyAdded";
import { AddExtraItem } from "./AddExtraItem";
import { LoadFailedLine } from "./LoadFailedLine";
import { RegenerateShoppingListButton } from "./RegenerateShoppingListButton";
import { RegularsEditView } from "./RegularsEditView";
import { RegularsEntryRow } from "./RegularsEntryRow";
import { RegularsView } from "./RegularsView";
import { ShoppingListCategory } from "./ShoppingListCategory";
import { ShoppingListSkeleton } from "./ShoppingListSkeleton";

export function ShoppingListPanel({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const { data, isError, refetch } = useShoppingList();
  const { data: menu } = useMenu();
  const { data: regulars } = useRegulars();
  const clear = useClearShoppingList();
  const [recentlyAdded, setRecentlyAdded] = useState<RecentlyAdded | null>(
    null,
  );
  const [view, setView] = useState<"list" | "regulars" | "edit">("list");
  const highlight = (rows: AddedRow[]) =>
    setRecentlyAdded((previous) => ({
      rows,
      key: (previous?.key ?? 0) + 1,
    }));

  const recipeCount = menu?.entries.length ?? 0;
  const grouped = data ? groupShoppingList(data.items) : null;
  const scrollGroupId = grouped?.groups.find((group) =>
    group.items.some((item) => isRecentlyAdded(item, recentlyAdded)),
  )?.categoryId;
  const regularsCount = regulars?.length ?? 0;
  const backFromEdit = regularsCount > 0 ? "regulars" : "list";

  if (view === "regulars" && regulars?.length === 0) setView("edit");

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-panel lg:max-h-full",
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-3 bg-foreground py-3.25 pr-4 pl-5 text-on-dark">
        {view !== "list" ? (
          <>
            <button
              type="button"
              aria-label={
                view === "edit" && backFromEdit === "regulars"
                  ? "Back to regulars"
                  : "Back to shopping list"
              }
              onClick={() => setView(view === "edit" ? backFromEdit : "list")}
              className="-my-2 -ml-3 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-dark-muted transition-colors hover:text-on-dark"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
            <h2 className="flex-1 font-display text-[23px] font-normal">
              {view === "edit" ? "Edit regulars" : "Regulars"}
            </h2>
            {view === "regulars" && regularsCount > 0 && (
              <button
                type="button"
                onClick={() => setView("edit")}
                className="flex h-8.5 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-on-dark-muted/50 px-3.5 text-sm font-semibold text-on-dark transition-colors hover:border-on-dark"
              >
                <Pencil size={13} strokeWidth={2.2} aria-hidden />
                Edit
              </button>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </header>

      {view === "edit" ? (
        <RegularsEditView />
      ) : view === "regulars" ? (
        <RegularsView
          onRestocked={(rows) => {
            highlight(rows);
            setView("list");
          }}
        />
      ) : (
        <>
          <AddExtraItem onAdded={(row) => highlight([row])} />
          <RegularsEntryRow
            count={regulars?.length}
            onOpen={() => {
              setRecentlyAdded(null);
              setView("regulars");
            }}
          />

          <div className="-mb-px min-h-0 overflow-y-auto">
            {!grouped ? (
              isError ? (
                <LoadFailedLine
                  what="shopping list"
                  onRetry={() => refetch()}
                  className="border-b border-card-shadow"
                />
              ) : (
                <ShoppingListSkeleton />
              )
            ) : grouped.groups.length > 0 ? (
              grouped.groups.map((group) => (
                <ShoppingListCategory
                  key={group.categoryId}
                  group={group}
                  recentlyAdded={recentlyAdded}
                  scrollToAdded={group.categoryId === scrollGroupId}
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
                    <br /> Add a recipe, or{" "}
                    {regularsCount > 0
                      ? "restock your regulars above."
                      : "add an item by hand above."}
                  </>
                )}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 items-center border-t border-card-shadow justify-between px-4.5 py-3.5">
            <span className="text-[13px] text-ink-subtle">
              Built from {recipeCount}{" "}
              {recipeCount === 1 ? "recipe" : "recipes"} on your menu
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
        </>
      )}
    </section>
  );
}
