import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Every --shadow-* token in index.css, so cn() lets a later shadow class override one.
const SHADOW_TOKENS = [
  "popover",
  "floating",
  "fab",
  "dialog",
  "panel",
  "control",
  "tab",
  "quantity",
];

const twMerge = extendTailwindMerge({
  extend: { theme: { shadow: SHADOW_TOKENS } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
