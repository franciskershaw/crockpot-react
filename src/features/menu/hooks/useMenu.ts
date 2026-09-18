import { useAuth } from "@/features/auth/components/AuthContext";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { getMenu } from "../data/api";
import { menuKeys } from "../data/queryKeys";

export function useMenu() {
  const { isAuthenticated } = useAuth();

  return useApiQuery({
    queryKey: menuKeys.menu(),
    queryFn: getMenu,
    enabled: isAuthenticated,
  });
}
