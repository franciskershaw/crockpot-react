import { useUndoQueue } from "./useUndoQueue";

export function useUndoableRemoval<T>({
  keyOf,
  remove,
  restore,
}: {
  keyOf: (item: T) => string;
  // Pass mutateAsync: per-call callbacks on mutate only fire for the latest call.
  remove: (item: T) => Promise<unknown>;
  restore: (item: T, index: number) => void;
}) {
  const { start, settle, forget, claimUndo, ...queue } = useUndoQueue<T>();

  const removeItem = (item: T, anchorKey: string | null, index: number) => {
    const key = keyOf(item);
    start({ key, item, anchorKey, index });
    return remove(item).then(
      () => settle(key),
      () => forget(key),
    );
  };

  const undo = (key: string, index: number) => {
    const removal = claimUndo(key);
    if (!removal) return;
    restore(removal.item, index);
  };

  return { ...queue, remove: removeItem, undo };
}
