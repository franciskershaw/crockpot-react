import { createElement } from "react";
import type { LucideProps } from "lucide-react";

import { getCategoryIcon } from "../utils/categoryIcons";

export function CategoryIcon({
  categoryName,
  ...props
}: { categoryName: string } & LucideProps) {
  return createElement(getCategoryIcon(categoryName), props);
}
