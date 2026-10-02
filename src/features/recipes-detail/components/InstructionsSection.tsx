import { InstructionSteps } from "@/features/recipes/components/InstructionSteps";

export function InstructionsSection({
  instructions,
}: {
  instructions: string[];
}) {
  return (
    <div className="pt-3 md:rounded-lg md:border md:border-border md:bg-card md:p-6 md:shadow-[0_2px_0_var(--color-card-shadow)]">
      <h2 className="mb-5 hidden font-display text-2xl text-foreground md:block">
        Instructions
      </h2>
      <InstructionSteps steps={instructions} />
    </div>
  );
}
