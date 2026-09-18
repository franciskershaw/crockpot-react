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
      <div className="space-y-5">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex items-baseline gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green text-sm font-bold text-background">
              {index + 1}
            </span>
            <p className="text-[17px] leading-relaxed text-foreground">
              {instruction}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
