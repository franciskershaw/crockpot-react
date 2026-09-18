import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { cn } from "@/lib/utils";

import {
  ACTION_BAND_PADDING_TOP_PX,
  ACTION_ROW_HEIGHT_PX,
  HEADER_HEIGHT_PX,
  NATURAL_ROW_TO_TABS_GAP_PX,
} from "../hooks/useStickyHeroTrigger";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { NotesSection } from "./NotesSection";

type TabValue = "ingredients" | "instructions";

// py-3 above the tab pills in the fixed bar, mirroring the action bar's own top padding.
const TAB_BAND_PADDING_TOP_PX = 12;
// Where the fixed tab bar must sit so its pills land exactly where the natural tab bar would be at the trigger instant — worked back from the action bar's real geometry (buttons' bottom edge + the natural gap), not guessed.
const TAB_BAND_TOP_PX =
  HEADER_HEIGHT_PX +
  ACTION_BAND_PADDING_TOP_PX +
  ACTION_ROW_HEIGHT_PX +
  NATURAL_ROW_TO_TABS_GAP_PX -
  TAB_BAND_PADDING_TOP_PX;

export function RecipeContent({
  recipe,
  isStuck,
}: {
  recipe: RecipeDetail;
  isStuck: boolean;
}) {
  // Shared with the fixed duplicate tab bar (decision 5) so both stay in sync.
  const [activeTab, setActiveTab] = useState<TabValue>("ingredients");

  return (
    <div className="mx-auto max-w-7xl px-6 py-5">
      <div className="md:hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
        >
          <TabsList
            className={cn(
              "grid w-full grid-cols-2 transition-opacity duration-150",
              isStuck && "pointer-events-none opacity-0",
            )}
            {...(isStuck && { inert: true })}
          >
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

      {/* Always mounted; opacity/inert toggle visibility so the handoff never doubles or pops. */}
      <div
        className={cn(
          "fixed inset-x-0 z-20 bg-background/95 py-3 backdrop-blur-sm transition-opacity duration-150 md:hidden",
          isStuck ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ top: `${TAB_BAND_TOP_PX}px` }}
        {...(!isStuck && { inert: true })}
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="mx-auto max-w-7xl px-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">
              Ingredients ({recipe.ingredients.length})
            </TabsTrigger>
            <TabsTrigger value="instructions">
              Instructions ({recipe.instructions.length})
            </TabsTrigger>
          </TabsList>
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
