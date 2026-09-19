import { useCallback, useState } from "react";
import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";

import type { RecipeCard as RecipeCardData } from "../data/types";
import { useBoundedServes } from "./useBoundedServes";

export function stopEvent(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function useAddToMenuButtonState(recipe: RecipeCardData) {
  const [isEditing, setIsEditing] = useState(false);
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

  const handleCartClick = useCallback((event: React.MouseEvent) => {
    stopEvent(event);
    setIsEditing(true);
  }, []);

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
      const onSuccess = () => setIsEditing(false);
      if (isInMenu) {
        updateServes.mutate(
          { recipeId: recipe.id, serves: servingAmount },
          { onSuccess },
        );
      } else {
        addToMenu.mutate({ recipe, serves: servingAmount }, { onSuccess });
      }
    },
    [isInMenu, recipe, servingAmount, addToMenu, updateServes],
  );

  const handleRemove = useCallback(
    (event: React.MouseEvent) => {
      stopEvent(event);
      removeFromMenu.mutate(
        { recipeId: recipe.id },
        { onSuccess: () => setIsEditing(false) },
      );
    },
    [recipe.id, removeFromMenu],
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
