import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useDeleteRecipe } from "../hooks/useDeleteRecipe";

export function RecipeDeleteButton({
  recipeId,
  recipeName,
  to,
  className,
}: {
  recipeId: string;
  recipeName: string;
  to: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const deleteRecipe = useDeleteRecipe();

  const handleDelete = () => {
    deleteRecipe.mutate(recipeId, { onSuccess: () => navigate(to) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Delete recipe"
          className={cn(
            "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent",
            className,
          )}
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete recipe</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{recipeName}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteRecipe.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRecipe.isPending}
          >
            {deleteRecipe.isPending ? "Deleting…" : "Delete recipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
