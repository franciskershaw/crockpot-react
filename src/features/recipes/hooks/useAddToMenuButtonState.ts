import { useCallback, useEffect, useState } from "react";
import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";

import type { RecipeCard as RecipeCardData } from "../types";

const MIN_SERVES = 1;
const MAX_SERVES = 50;

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

  const defaultServes = menuServes ?? recipe.serves;
  const [servingAmount, setServingAmount] = useState(defaultServes);

  useEffect(() => {
    if (menuServes !== undefined) {
      setServingAmount(menuServes);
    }
  }, [menuServes]);

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
      setServingAmount(defaultServes);
    },
    [defaultServes],
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

  const adjustAmount = useCallback((event: React.MouseEvent, delta: number) => {
    stopEvent(event);
    setServingAmount((amount) =>
      Math.max(MIN_SERVES, Math.min(MAX_SERVES, amount + delta)),
    );
  }, []);

  const isMutating =
    addToMenu.isPending || updateServes.isPending || removeFromMenu.isPending;

  return {
    isEditing,
    isInMenu,
    menuServes,
    menuPending,
    servingAmount,
    canDecrease: servingAmount > MIN_SERVES,
    canIncrease: servingAmount < MAX_SERVES,
    isMutating,
    isRemoving: removeFromMenu.isPending,
    handleCartClick,
    handleCancel,
    handleConfirm,
    handleRemove,
    adjustAmount,
  };
}
