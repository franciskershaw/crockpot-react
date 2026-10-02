export function InstructionSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-5">
      {steps.map((step, index) => (
        <li key={index} className="flex items-baseline gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green text-sm font-bold text-background">
            {index + 1}
          </span>
          <p className="text-[17px] leading-relaxed text-foreground">{step}</p>
        </li>
      ))}
    </ol>
  );
}
