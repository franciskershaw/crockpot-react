export interface Step {
  step: string;
  accent: string;
  title: string;
  body: string;
}

export function StepCard({ step, accent, title, body }: Step) {
  return (
    <div className="h-full rounded-lg border border-border bg-card p-6">
      <div className={`mb-5 h-1 rounded-full ${accent}`} />
      <p className="text-sm text-muted-foreground">{step}</p>
      <h3 className="mt-1 font-display text-2xl">{title}</h3>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}
