import type { ComponentProps, ReactNode } from "react";
import type { UndoSlot } from "@/lib/undoSlots";

import { RECIPE_GRID_CLASSES, RECIPE_LIST_CLASSES } from "../utils/styles";
import { AnimatedSlots } from "./AnimatedSlots";
import { MobileRecipeRow } from "./MobileRecipeRow";
import { RecipeCard } from "./RecipeCard";

export function RecipeListGrid<T>({
  slots,
  itemProps,
  renderUndo = () => null,
  testId,
}: {
  slots: UndoSlot<T>[];
  itemProps: (slot: UndoSlot<T>) => ComponentProps<typeof MobileRecipeRow>;
  renderUndo?: (slot: UndoSlot<T>) => ReactNode;
  testId?: string;
}) {
  return (
    <div className="@container">
      <div
        data-testid={testId && `${testId}-list`}
        className={RECIPE_LIST_CLASSES}
      >
        <AnimatedSlots
          slots={slots}
          renderUndo={renderUndo}
          renderItem={(slot) => <MobileRecipeRow {...itemProps(slot)} />}
        />
      </div>
      <div
        data-testid={testId && `${testId}-grid`}
        className={RECIPE_GRID_CLASSES}
      >
        <AnimatedSlots
          slots={slots}
          renderUndo={renderUndo}
          renderItem={(slot) => <RecipeCard {...itemProps(slot)} />}
        />
      </div>
    </div>
  );
}
