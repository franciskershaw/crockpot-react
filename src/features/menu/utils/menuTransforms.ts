import type { RecipeCard } from "@/features/recipes/data/types";

import type { Menu, MenuEntry } from "../data/types";

export interface AddEntryVariables {
  recipe: RecipeCard;
  serves: number;
  index?: number;
}

export interface RemoveEntryVariables {
  recipeId: string;
}

export interface SetServesVariables {
  recipeId: string;
  serves: number;
}

export interface MenuTransform<TVariables, TBefore> {
  capture: (data: Menu | undefined, variables: TVariables) => TBefore;
  apply: (data: Menu | undefined, variables: TVariables) => Menu | undefined;
  revert: (
    data: Menu | undefined,
    variables: TVariables,
    before: TBefore,
  ) => Menu | undefined;
}

function findEntry(data: Menu | undefined, recipeId: string) {
  return data?.entries.find((e) => e.recipeId === recipeId);
}

function withEntries(entries: MenuEntry[]): Menu {
  return { entries };
}

function replaceEntry(data: Menu, next: MenuEntry): Menu {
  return withEntries(
    data.entries.map((e) => (e.recipeId === next.recipeId ? next : e)),
  );
}

function insertAt(entries: MenuEntry[], entry: MenuEntry, index: number) {
  const next = [...entries];
  next.splice(Math.min(index, next.length), 0, entry);
  return next;
}

// Each revert undoes only its own change, and does nothing if another change has since touched the same entry.

export const addEntry: MenuTransform<AddEntryVariables, MenuEntry | undefined> =
  {
    capture: (data, { recipe }) => findEntry(data, recipe.id),
    apply: (data, { recipe, serves, index }) => {
      const next = { recipeId: recipe.id, serves, recipe };
      if (data && findEntry(data, recipe.id)) return replaceEntry(data, next);
      return withEntries(insertAt(data?.entries ?? [], next, index ?? 0));
    },
    revert: (data, { recipe, serves }, previous) => {
      const current = findEntry(data, recipe.id);
      if (!data || !current || current.serves !== serves) return data;
      if (previous) return replaceEntry(data, previous);
      return withEntries(data.entries.filter((e) => e !== current));
    },
  };

export const removeEntry: MenuTransform<
  RemoveEntryVariables,
  { entry: MenuEntry; index: number } | undefined
> = {
  capture: (data, { recipeId }) => {
    const index = data?.entries.findIndex((e) => e.recipeId === recipeId) ?? -1;
    return index === -1 ? undefined : { entry: data!.entries[index], index };
  },
  apply: (data, { recipeId }) =>
    data && withEntries(data.entries.filter((e) => e.recipeId !== recipeId)),
  revert: (data, { recipeId }, removed) => {
    if (!data || !removed || findEntry(data, recipeId)) return data;
    return withEntries(insertAt(data.entries, removed.entry, removed.index));
  },
};

export const setServes: MenuTransform<SetServesVariables, number | undefined> =
  {
    capture: (data, { recipeId }) => findEntry(data, recipeId)?.serves,
    apply: (data, { recipeId, serves }) => {
      const current = findEntry(data, recipeId);
      return data && current
        ? replaceEntry(data, { ...current, serves })
        : data;
    },
    revert: (data, { recipeId, serves }, previousServes) => {
      const current = findEntry(data, recipeId);
      if (!data || !current || current.serves !== serves) return data;
      if (previousServes === undefined) return data;
      return replaceEntry(data, { ...current, serves: previousServes });
    },
  };

export const clearEntries: MenuTransform<void, MenuEntry[]> = {
  capture: (data) => data?.entries ?? [],
  apply: () => withEntries([]),
  revert: (data, _variables, cleared) => {
    const present = new Set(data?.entries.map((e) => e.recipeId));
    return withEntries([
      ...(data?.entries ?? []),
      ...cleared.filter((e) => !present.has(e.recipeId)),
    ]);
  },
};
