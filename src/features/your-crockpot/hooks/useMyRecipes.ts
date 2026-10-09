import { useAuth } from "@/features/auth/components/AuthContext";

import { LIBRARY_PAGE_SIZE } from "../utils/libraryPageSize";
import { useLibraryRecipes } from "./useLibraryRecipes";

const PARAMS = { mine: true, limit: LIBRARY_PAGE_SIZE };

export function useMyRecipes() {
  const { isAuthenticated } = useAuth();
  return useLibraryRecipes(PARAMS, isAuthenticated);
}
