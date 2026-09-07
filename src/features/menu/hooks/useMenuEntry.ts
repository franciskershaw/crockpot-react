import { useMenu } from "./useMenu";

export interface MenuEntryState {
  isInMenu: boolean;
  serves: number | undefined;
  isPending: boolean;
}

// isPending lets callers show a neutral state instead of a false "not in menu" default while the menu is still loading.
export function useMenuEntry(recipeId: string): MenuEntryState {
  const { data, isPending } = useMenu();
  const entry = data?.entries.find((e) => e.recipeId === recipeId);

  return {
    isInMenu: !!entry,
    serves: entry?.serves,
    isPending,
  };
}
