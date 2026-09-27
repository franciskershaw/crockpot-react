import { REFERENCE_DATA_STALE_TIME } from "@/lib/constants";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { listItems } from "../data/api";
import { catalogKeys } from "../data/queryKeys";

export function useItems() {
  return useApiQuery({
    queryKey: catalogKeys.items,
    queryFn: listItems,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
