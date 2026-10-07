import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/features/catalog/components/CategoryIcon";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { RecentlyAdded } from "../data/types";
import type { ShoppingListCategoryGroup } from "../utils/groupShoppingList";
import { ShoppingListRow } from "./ShoppingListRow";

const COLLAPSE_ON_COMPLETE_DELAY_MS = 400;

export function ShoppingListCategory({
  group,
  recentlyAdded = null,
}: {
  group: ShoppingListCategoryGroup;
  recentlyAdded?: RecentlyAdded | null;
}) {
  const isComplete = group.obtainedCount === group.totalCount;
  const [isExpanded, setIsExpanded] = useState(!isComplete);
  const wasComplete = useRef(isComplete);
  const [openedForKey, setOpenedForKey] = useState<number | null>(null);
  const [flashEndedForKey, setFlashEndedForKey] = useState<number | null>(null);
  const [scrollForKey, setScrollForKey] = useState<number | null>(null);
  const addedRowRef = useRef<HTMLDivElement>(null);

  const addedItemIds = new Set(
    group.items
      .filter((item) =>
        recentlyAdded?.rows.some(
          (row) => row.itemId === item.itemId && row.unitId === item.unitId,
        ),
      )
      .map((item) => item.id),
  );
  const firstAddedItemId = group.items.find((item) =>
    addedItemIds.has(item.id),
  )?.id;
  if (recentlyAdded && firstAddedItemId && openedForKey !== recentlyAdded.key) {
    setOpenedForKey(recentlyAdded.key);
    if (isExpanded) setScrollForKey(recentlyAdded.key);
    else setIsExpanded(true);
  }
  if (
    !isExpanded &&
    openedForKey !== null &&
    flashEndedForKey !== openedForKey
  ) {
    setFlashEndedForKey(openedForKey);
  }

  useEffect(() => {
    if (scrollForKey === null) return;
    addedRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [scrollForKey]);

  useEffect(() => {
    const justCompleted = isComplete && !wasComplete.current;
    wasComplete.current = isComplete;
    if (!justCompleted) return;
    const timer = setTimeout(
      () => setIsExpanded(false),
      COLLAPSE_ON_COMPLETE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [isComplete]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex w-full cursor-pointer items-center gap-3 border-b border-card-shadow px-4.5 py-3.75 text-left"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ingredient-chip-bg text-ingredient-chip-text">
          <CategoryIcon
            categoryName={group.categoryName}
            size={16}
            strokeWidth={2}
          />
        </span>
        <span className="flex-1 text-base font-semibold">
          {group.categoryName}
        </span>
        <span
          className={cn(
            "text-[13px] tabular-nums",
            isComplete ? "font-bold text-green-complete" : "text-icon-muted",
          )}
        >
          {group.obtainedCount} / {group.totalCount}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={cn(
            "transition-[rotate,color] duration-250",
            isExpanded ? "rotate-180 text-green" : "text-ink-subtle",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2 },
            }}
            onAnimationComplete={() => {
              if (isExpanded) setScrollForKey(openedForKey);
            }}
            className="overflow-hidden"
          >
            <div className="border-b border-card-shadow bg-search-secondary px-4.5 pt-0.5">
              {group.items.map((item) => (
                <ShoppingListRow
                  key={item.id}
                  item={item}
                  ref={item.id === firstAddedItemId ? addedRowRef : undefined}
                  flashKey={
                    addedItemIds.has(item.id) &&
                    recentlyAdded?.key !== flashEndedForKey
                      ? recentlyAdded?.key
                      : undefined
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
