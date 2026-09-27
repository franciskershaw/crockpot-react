import { useAuth } from "@/features/auth/components/AuthContext";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { getShoppingList } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";

export function useShoppingList() {
  const { isAuthenticated } = useAuth();

  return useApiQuery({
    queryKey: shoppingListKeys.list(),
    queryFn: getShoppingList,
    enabled: isAuthenticated,
  });
}
