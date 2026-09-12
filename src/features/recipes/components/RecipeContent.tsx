import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { RecipeDetail } from "../types";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { NotesSection } from "./NotesSection";

export function RecipeContent({ recipe }: { recipe: RecipeDetail }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-5">
      <div className="md:hidden">
        <Tabs defaultValue="ingredients">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">
              Ingredients ({recipe.ingredients.length})
            </TabsTrigger>
            <TabsTrigger value="instructions">
              Instructions ({recipe.instructions.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients">
            <IngredientsSection recipe={recipe} />
          </TabsContent>
          <TabsContent value="instructions" className="space-y-6">
            <InstructionsSection instructions={recipe.instructions} />
            <NotesSection notes={recipe.notes} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <IngredientsSection recipe={recipe} />
        </div>
        <div className="space-y-6 md:col-span-8">
          <InstructionsSection instructions={recipe.instructions} />
          <NotesSection notes={recipe.notes} />
        </div>
      </div>
    </div>
  );
}
