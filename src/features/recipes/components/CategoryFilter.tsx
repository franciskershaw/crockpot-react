import type { CategoryMode, RecipeCategory } from "../types";
import { FilterOptionList } from "./FilterOptionList";

export function CategoryFilter({
  categories,
  selectedIds,
  mode,
  onToggle,
  onModeChange,
}: {
  categories: RecipeCategory[];
  selectedIds: string[];
  mode: CategoryMode;
  onToggle: (id: string) => void;
  onModeChange: (mode: CategoryMode) => void;
}) {
  return (
    <FilterOptionList
      label="Categories"
      options={categories}
      selectedIds={selectedIds}
      onToggle={onToggle}
    >
      <div className="flex gap-2">
        {(["include", "exclude"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
            className={
              mode === option
                ? "flex-1 cursor-pointer rounded-full bg-green py-[7px] text-center text-[13px] leading-none font-bold text-background"
                : "flex-1 cursor-pointer rounded-full border border-border py-[7px] text-center text-[13px] leading-none font-semibold text-muted-foreground"
            }
          >
            {option === "include" ? "Include" : "Exclude"}
          </button>
        ))}
      </div>
    </FilterOptionList>
  );
}
