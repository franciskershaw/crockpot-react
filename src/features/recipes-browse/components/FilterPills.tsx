import type { Item } from "@/features/catalog/data/types";
import type {
  CategoryMode,
  RecipeCategory,
} from "@/features/recipes/data/types";
import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type PillKind = "time" | "category" | "ingredient";

type Pill =
  | {
      key: string;
      kind: PillKind;
      label: string;
      onRemove: () => void;
      placeholder?: false;
    }
  | { key: string; kind: PillKind; placeholder: true };

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
  categoriesPending,
  ingredientsPending,
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
  categoriesPending: boolean;
  ingredientsPending: boolean;
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
    if (categoriesPending) {
      pills.push({
        key: `category-${id}`,
        kind: "category",
        placeholder: true,
      });
      continue;
    }
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
    if (ingredientsPending) {
      pills.push({
        key: `ingredient-${id}`,
        kind: "ingredient",
        placeholder: true,
      });
      continue;
    }
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
      {pills.map((pill) =>
        pill.placeholder ? (
          <span
            key={pill.key}
            data-testid={`${pill.kind}-pill-placeholder`}
            aria-hidden="true"
            className={cn(
              "h-7.25 w-20 shrink-0 animate-pulse rounded-full bg-muted",
              DELAYED_FADE_IN_CLASSES,
            )}
          />
        ) : (
          <button
            key={pill.key}
            type="button"
            onClick={pill.onRemove}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border py-1.75 pr-2 pl-3.5 text-[13px] leading-none font-semibold ${PILL_KIND_CLASSES[pill.kind]}`}
          >
            {pill.label}
            <X strokeWidth={2.4} className="size-3 shrink-0" />
          </button>
        ),
      )}
      {categoriesPending && categoryIds.length > 0 && (
        <output className="sr-only">Loading category filters…</output>
      )}
      {ingredientsPending && ingredientIds.length > 0 && (
        <output className="sr-only">Loading ingredient filters…</output>
      )}
    </>
  );
}
