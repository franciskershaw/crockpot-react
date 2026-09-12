export function InstructionsSection({
  instructions,
}: {
  instructions: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-[0_2px_0_var(--color-card-shadow)]">
      <h2 className="mb-5 font-display text-2xl text-foreground">
        Instructions
      </h2>
      <div className="space-y-5">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green text-sm font-bold text-background">
              {index + 1}
            </span>
            <p className="pt-1 text-base leading-relaxed text-foreground">
              {instruction}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
