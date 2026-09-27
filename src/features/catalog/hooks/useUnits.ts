import { REFERENCE_DATA_STALE_TIME } from "@/lib/constants";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { listUnits } from "../data/api";
import { catalogKeys } from "../data/queryKeys";

export function useUnits() {
  return useApiQuery({
    queryKey: catalogKeys.units,
    queryFn: listUnits,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
