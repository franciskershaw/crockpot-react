import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const LABEL_CLASSES =
  "mb-2 block text-sm font-semibold text-ink-secondary";

export const TEXTAREA_CLASSES = cn(
  FIELD_CLASSES,
  "block w-full resize-y px-4 py-3.5 text-[15px] leading-7 outline-none placeholder:text-placeholder",
);
