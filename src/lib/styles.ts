export const FIELD_CLASSES =
  "rounded-[7px] border-[1.5px] border-border bg-card transition-[border-color,box-shadow] focus-within:border-green focus-within:ring-[3px] focus-within:ring-green/14";

export const PILL_CTA_CLASSES =
  "rounded-full bg-foreground px-4.5 py-2.5 text-sm font-bold text-on-dark";

// Invisible for the first 200ms so a fast load never shows it, then fades in.
export const DELAYED_FADE_IN_CLASSES =
  "animate-in fade-in delay-200 duration-150 fill-mode-backwards";

// Bottom padding stays with each page: it clears that page's own footer.
export const SCROLL_PANE_CLASSES =
  "lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1";
