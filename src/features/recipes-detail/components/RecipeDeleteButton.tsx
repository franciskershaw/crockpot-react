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
import { useDeleteRecipe } from "@/features/recipes/hooks/useDeleteRecipe";
import { ICON_BUTTON_CLASSES } from "@/features/recipes/utils/styles";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
          className={cn(ICON_BUTTON_CLASSES, className)}
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
