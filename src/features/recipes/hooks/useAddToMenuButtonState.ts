import { useCallback, useState } from "react";
import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";

import type { RecipeCard as RecipeCardData } from "../data/types";
import { stopEvent } from "../utils/stopEvent";
import { useBoundedServes } from "./useBoundedServes";

export function useAddToMenuButtonState(
  recipe: RecipeCardData,
  { onRemove }: { onRemove?: () => void } = {},
) {
  const [isEditing, setIsEditing] = useState(false);
  // Optimistic writes flip isInMenu mid-edit; the open editor keeps the state it opened with.
  const [editingInMenu, setEditingInMenu] = useState(false);
  const {
    isInMenu,
    serves: menuServes,
    isPending: menuPending,
  } = useMenuEntry(recipe.id);

  const {
    serves: servingAmount,
    adjust,
    reset: resetServes,
    canDecrease,
    canIncrease,
  } = useBoundedServes(menuServes ?? recipe.serves);

  const addToMenu = useAddToMenu();
  const updateServes = useUpdateMenuEntryServes();
  const removeFromMenu = useRemoveFromMenu();

  const handleCartClick = useCallback(
    (event: React.MouseEvent) => {
      stopEvent(event);
      setEditingInMenu(isInMenu);
      setIsEditing(true);
    },
    [isInMenu],
  );

  const handleCancel = useCallback(
    (event: React.MouseEvent) => {
      stopEvent(event);
      setIsEditing(false);
      resetServes();
    },
    [resetServes],
  );

  const handleConfirm = useCallback(
    (event: React.MouseEvent) => {
      stopEvent(event);
      setIsEditing(false);
      if (isInMenu) {
        updateServes.mutate({ recipeId: recipe.id, serves: servingAmount });
      } else {
        addToMenu.mutate({ recipe, serves: servingAmount });
      }
    },
    [isInMenu, recipe, servingAmount, addToMenu, updateServes],
  );

  const handleRemove = useCallback(
    (event: React.MouseEvent) => {
      stopEvent(event);
      setIsEditing(false);
      if (onRemove) {
        onRemove();
        return;
      }
      removeFromMenu.mutate({ recipeId: recipe.id });
    },
    [recipe.id, removeFromMenu, onRemove],
  );

  const adjustAmount = useCallback(
    (event: React.MouseEvent, delta: number) => {
      stopEvent(event);
      adjust(delta);
    },
    [adjust],
  );

  const isMutating =
    addToMenu.isPending || updateServes.isPending || removeFromMenu.isPending;

  return {
    isEditing,
    isInMenu,
    editingInMenu,
    menuServes,
    menuPending,
    servingAmount,
    canDecrease,
    canIncrease,
    isMutating,
    isRemoving: removeFromMenu.isPending,
    handleCartClick,
    handleCancel,
    handleConfirm,
    handleRemove,
    adjustAmount,
  };
}
