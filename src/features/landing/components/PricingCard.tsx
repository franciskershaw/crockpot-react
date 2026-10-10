import { type ReactNode } from "react";
import { Check } from "lucide-react";

import { HARD_SHADOW } from "../utils/styles";

export interface Plan {
  name: string;
  price?: string;
  period: string;
  features: string[];
  featured?: boolean;
}

export function PricingCard({
  plan,
  children,
}: {
  plan: Plan;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-xl bg-card p-6 md:p-8 ${
        plan.featured
          ? `border-2 border-foreground ${HARD_SHADOW}`
          : "border border-border"
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-6 rounded bg-primary px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
          Start here
        </span>
      )}

      <p className="font-display text-2xl">{plan.name}</p>
      {/* Sized by the price's type even without a price, so the cards' dividers line up. */}
      <p className="mt-1 font-display text-4xl">
        {plan.price}{" "}
        <span className="font-sans text-sm text-muted-foreground">
          {plan.period}
        </span>
      </p>

      <hr className="my-5 border-border" />

      <ul className="space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">{children}</div>
    </div>
  );
}
