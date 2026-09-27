import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { ShoppingListCategoryGroup } from "../utils/groupShoppingList";
import type { RecentlyAdded } from "./AddExtraItem";
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

  const addedItemId = group.items.find(
    (item) =>
      recentlyAdded !== null &&
      item.itemId === recentlyAdded.itemId &&
      item.unitId === recentlyAdded.unitId,
  )?.id;
  if (recentlyAdded && addedItemId && openedForKey !== recentlyAdded.key) {
    setOpenedForKey(recentlyAdded.key);
    setIsExpanded(true);
  }

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
            className="overflow-hidden"
          >
            <div className="border-b border-card-shadow bg-search-secondary px-4.5 pt-0.5 pb-2.5">
              {group.items.map((item) => (
                <ShoppingListRow
                  key={item.id}
                  item={item}
                  flashKey={
                    item.id === addedItemId ? recentlyAdded?.key : undefined
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
