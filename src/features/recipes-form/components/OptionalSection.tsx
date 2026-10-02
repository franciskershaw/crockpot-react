import { useCallback, useRef, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import { FormSection } from "./FormSection";

export function OptionalSection({
  addLabel,
  title,
  removeLabel,
  initiallyOpen,
  onRemove,
  children,
}: {
  addLabel: string;
  title: string;
  removeLabel: string;
  initiallyOpen: boolean;
  onRemove: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const focusWhenShown = useRef(false);
  // Focuses only when opened by the button, not when it starts open.
  const containerRef = useCallback((container: HTMLDivElement | null) => {
    if (container && focusWhenShown.current) {
      focusWhenShown.current = false;
      container.querySelector("textarea")?.focus();
    }
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          focusWhenShown.current = true;
          setOpen(true);
        }}
        className="flex h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-[1.5px] border-foreground bg-card px-4 text-[15px] font-bold"
      >
        <Plus size={16} strokeWidth={2.2} />
        {addLabel}
      </button>
    );
  }

  return (
    <div ref={containerRef}>
      <FormSection
        title={title}
        action={
          <button
            type="button"
            aria-label={removeLabel}
            onClick={() => {
              onRemove();
              setOpen(false);
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-icon-muted hover:text-ink-body"
          >
            <Trash2 size={17} strokeWidth={2} />
          </button>
        }
      >
        {children}
      </FormSection>
    </div>
  );
}
