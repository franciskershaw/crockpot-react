import type { Regular } from "../data/types";

export interface RegularsCategoryGroup {
  categoryId: string;
  categoryName: string;
  regulars: Regular[];
}

export function groupRegulars(regulars: Regular[]): RegularsCategoryGroup[] {
  const groups = new Map<string, RegularsCategoryGroup>();
  for (const regular of regulars) {
    let group = groups.get(regular.categoryId);
    if (!group) {
      group = {
        categoryId: regular.categoryId,
        categoryName: regular.categoryName,
        regulars: [],
      };
      groups.set(regular.categoryId, group);
    }
    group.regulars.push(regular);
  }
  return [...groups.values()];
}
