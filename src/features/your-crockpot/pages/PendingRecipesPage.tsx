import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { useAuth } from "@/features/auth/components/AuthContext";
import { isAdmin } from "@/features/auth/utils/isAdmin";
import { ClipboardCheck } from "lucide-react";
import { Navigate } from "react-router-dom";

import { LibraryRecipeList } from "../components/LibraryRecipeList";
import { usePendingRecipes } from "../hooks/usePendingRecipes";

export function PendingRecipesPage() {
  const { user } = useAuth();
  const query = usePendingRecipes();

  if (!isAdmin(user)) {
    return <Navigate to="/library/favourites" replace />;
  }

  return (
    <LibraryRecipeList
      query={query}
      what="pending recipes"
      loadingLabel="Loading pending recipes…"
      from="/library/pending"
      empty={
        <EmptyTabPanel
          icon={ClipboardCheck}
          heading="Nothing waiting for approval"
          description="New recipes from other cooks land here for you to check before everyone can see them."
        />
      }
    />
  );
}
