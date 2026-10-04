import { useAuth } from "@/features/auth/components/AuthContext";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { getRegulars } from "../data/api";
import { regularsKeys } from "../data/queryKeys";

export function useRegulars() {
  const { isAuthenticated } = useAuth();

  return useApiQuery({
    queryKey: regularsKeys.list(),
    queryFn: getRegulars,
    enabled: isAuthenticated,
  });
}
