import { useAuth } from "@/features/auth/components/AuthContext";
import { useApiQuery } from "@/lib/Tanstack/useApiQuery";

import { getMenu } from "../api";
import { menuKeys } from "../queryKeys";

export function useMenu() {
  const { isAuthenticated } = useAuth();

  return useApiQuery({
    queryKey: menuKeys.menu(),
    queryFn: getMenu,
    enabled: isAuthenticated,
  });
}
