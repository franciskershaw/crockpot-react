import { X } from "lucide-react";

import type { CategoryMode, Item, RecipeCategory } from "../types";

type PillKind = "time" | "category" | "ingredient";

interface Pill {
  key: string;
  kind: PillKind;
  label: string;
  onRemove: () => void;
}

const PILL_KIND_CLASSES: Record<PillKind, string> = {
  time: "bg-time-chip-bg border-time-chip-border text-time-chip-text",
  category:
    "bg-category-chip-bg border-category-chip-border text-category-chip-text",
  ingredient:
    "bg-ingredient-chip-bg border-ingredient-chip-border text-ingredient-chip-text",
};

export function FilterPills({
  categoryIds,
  categoryMode,
  categories,
  ingredientIds,
  ingredients,
  minTime,
  maxTime,
  onRemoveCategory,
  onRemoveIngredient,
  onRemoveTimeRange,
}: {
  categoryIds: string[];
  categoryMode: CategoryMode;
  categories: RecipeCategory[];
  ingredientIds: string[];
  ingredients: Item[];
  minTime: number | undefined;
  maxTime: number | undefined;
  onRemoveCategory: (id: string) => void;
  onRemoveIngredient: (id: string) => void;
  onRemoveTimeRange: () => void;
}) {
  const pills: Pill[] = [];

  if (minTime !== undefined || maxTime !== undefined) {
    pills.push({
      key: "time",
      kind: "time",
      label: `Time: ${minTime ?? "0"}-${maxTime ?? "∞"} min`,
      onRemove: onRemoveTimeRange,
    });
  }

  for (const id of categoryIds) {
    const category = categories.find((c) => c.id === id);
    if (!category) continue;
    pills.push({
      key: `category-${id}`,
      kind: "category",
      label:
        categoryMode === "exclude" ? `Not ${category.name}` : category.name,
      onRemove: () => onRemoveCategory(id),
    });
  }

  for (const id of ingredientIds) {
    const item = ingredients.find((i) => i.id === id);
    if (!item) continue;
    pills.push({
      key: `ingredient-${id}`,
      kind: "ingredient",
      label: item.name,
      onRemove: () => onRemoveIngredient(id),
    });
  }

  if (pills.length === 0) return null;

  return (
    <>
      {pills.map((pill) => (
        <button
          key={pill.key}
          type="button"
          onClick={pill.onRemove}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border py-[7px] pr-2 pl-3.5 text-[13px] leading-none font-semibold ${PILL_KIND_CLASSES[pill.kind]}`}
        >
          {pill.label}
          <X strokeWidth={2.4} className="size-3 shrink-0" />
        </button>
      ))}
    </>
  );
}
