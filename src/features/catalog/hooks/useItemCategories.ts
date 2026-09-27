import { REFERENCE_DATA_STALE_TIME } from "@/lib/constants";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { listItemCategories } from "../data/api";
import { catalogKeys } from "../data/queryKeys";

export function useItemCategories() {
  return useApiQuery({
    queryKey: catalogKeys.itemCategories,
    queryFn: listItemCategories,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
