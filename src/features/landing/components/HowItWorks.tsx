import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { SECTION_GAP } from "../utils/styles";
import { StepCard, type Step } from "./StepCard";

const STEPS: Step[] = [
  {
    step: "01",
    accent: "bg-accent-rust",
    title: "Add meals to your menu",
    body: "Browse the recipes and tap the basket on anything that catches your eye. Your menu is whatever you're cooking soon. There's no calendar to fill in.",
  },
  {
    step: "02",
    accent: "bg-primary",
    title: "Crockpot writes your list",
    body: "Every ingredient from the recipes on your menu, added up into one list grouped by aisle. You can edit it and add extras.",
  },
  {
    step: "03",
    accent: "bg-accent-gold",
    title: "Shop from your phone",
    body: "Open the list in the shop and tick things off as they go in the trolley.",
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
