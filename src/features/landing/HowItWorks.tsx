import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { StepCard, type Step } from "./StepCard";
import { SECTION_GAP } from "./styles";

const STEPS: Step[] = [
  {
    step: "01",
    accent: "bg-accent-rust",
    title: "Add meals to your menu",
    body: "Browse 189 recipes and tap the basket on anything you fancy. No calendar, no set-up — the menu is just what you're cooking soon.",
  },
  {
    step: "02",
    accent: "bg-primary",
    title: "The list writes itself",
    body: "Every ingredient across every recipe on the menu, added up into one list and grouped by aisle. Edit it, add extras, clear it.",
  },
  {
    step: "03",
    accent: "bg-accent-gold",
    title: "Shop from your phone",
    body: "Open the list in the shop, tick things into the trolley, watch it shrink. That's the whole job done.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`mx-auto max-w-7xl px-6 ${SECTION_GAP}`}
    >
      <div className="flex items-center gap-6">
        <h2 className="font-display text-3xl sm:text-4xl">
          Three steps, one list
        </h2>
        <span className="hidden h-px flex-1 bg-border sm:block" />
      </div>

      <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
        {STEPS.map((s) => (
          <StepCard key={s.step} {...s} />
        ))}
      </div>

      <StepsCarousel className="mt-8 md:hidden" />
    </section>
  );
}

function StepsCarousel({ className }: { className?: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className={className}>
      <Carousel setApi={setApi} opts={{ align: "start" }}>
        <CarouselContent>
          {STEPS.map((s) => (
            <CarouselItem key={s.step} className="basis-[85%]">
              <StepCard {...s} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.step}
            type="button"
            aria-label={`Show step ${i + 1}`}
            aria-current={i === selected ? "step" : undefined}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === selected ? "bg-foreground" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
