import type { AddedRow } from "../data/types";
import { useAddShoppingListItem } from "../hooks/useAddShoppingListItem";
import { AddItemRow } from "./AddItemRow";

export function AddExtraItem({
  onAdded,
}: {
  onAdded: (added: AddedRow) => void;
}) {
  const add = useAddShoppingListItem();

  return (
    <AddItemRow
      isPending={add.isPending}
      isError={add.isError}
      onReset={add.reset}
      onConfirm={(item, quantity, unitId, close) =>
        add.mutate(
          { itemId: item.id, quantity, unitId },
          {
            onSuccess: () => {
              onAdded({ itemId: item.id, unitId });
              close();
            },
          },
        )
      }
    />
  );
}
