export interface Removal<T> {
  key: string;
  item: T;
  // The slot this item sat after when removed; null when it was first.
  anchorKey: string | null;
  // Live items before it when removed, for when its anchor has gone.
  index: number;
  settled: boolean;
  undone: boolean;
}

export interface UndoSlot<T> {
  key: string;
  item: T;
  undo: boolean;
  // Live items before this slot: where an undone item goes back in the list.
  index: number;
  anchorKey: string | null;
}

export function buildUndoSlots<T>(
  items: T[],
  keyOf: (item: T) => string,
  removals: Removal<T>[],
): UndoSlot<T>[] {
  const liveKeys = new Set(items.map(keyOf));
  const slots = items.map((item) => ({ key: keyOf(item), item, undo: false }));

  for (const removal of removals) {
    if (liveKeys.has(removal.key)) continue;
    slots.splice(tilePosition(slots, removal), 0, {
      key: removal.key,
      item: removal.item,
      undo: true,
    });
  }

  let live = 0;
  return slots.map((slot, position) => {
    const annotated = {
      ...slot,
      index: live,
      anchorKey: position === 0 ? null : slots[position - 1].key,
    };
    if (!slot.undo) live += 1;
    return annotated;
  });
}

function tilePosition<T>(
  slots: { key: string; undo: boolean }[],
  { anchorKey, index }: Removal<T>,
): number {
  if (anchorKey === null) return 0;
  const anchor = slots.findIndex((slot) => slot.key === anchorKey);
  if (anchor !== -1) return anchor + 1;

  let live = 0;
  for (const [position, slot] of slots.entries()) {
    if (!slot.undo && live === index) return position;
    if (!slot.undo) live += 1;
  }
  return slots.length;
}
