export function byId<T extends { id: string }>(
  list: readonly T[] | undefined,
): Map<string, T> {
  return new Map(list?.map((entry) => [entry.id, entry]));
}
