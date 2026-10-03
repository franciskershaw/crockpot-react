export const ICON_BUTTON_CLASSES =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent";

export const RECIPE_LIST_CLASSES = "flex flex-col gap-2.5 md:hidden";

// Columns follow the grid's own width (needs an @container ancestor), so a
// grid sharing its row with the shopping list gets fewer.
export const RECIPE_GRID_CLASSES =
  "hidden grid-cols-2 gap-4 md:grid @min-[52rem]:grid-cols-3 @min-[72rem]:grid-cols-4";
