import { useAuth } from "@/features/auth/components/AuthContext";

import { LIBRARY_PAGE_SIZE } from "../utils/libraryPageSize";
import { useLibraryRecipes } from "./useLibraryRecipes";

const PARAMS = { approved: false, limit: LIBRARY_PAGE_SIZE } as const;

export function usePendingRecipes() {
  const { user } = useAuth();
  return useLibraryRecipes(PARAMS, user?.role === "ADMIN");
}
