import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function QuantityControl({
  itemName,
  quantity,
  unitAbbreviation,
  obtained,
  onCommit,
}: {
  itemName: string;
  quantity: number;
  unitAbbreviation: string | null;
  obtained: boolean;
  onCommit: (quantity: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const parsed = Number(draft);
  const isValid = draft.trim() !== "" && Number.isFinite(parsed) && parsed > 0;

  const focusAtEnd = useCallback((input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  const open = () => {
    setDraft(String(quantity));
    setIsEditing(true);
  };
  const cancel = () => setIsEditing(false);
  const confirm = () => {
    if (!isValid) return;
    setIsEditing(false);
    if (parsed !== quantity) onCommit(parsed);
  };

  return (
    <div className="flex shrink-0 items-center gap-1.75">
      <div
        className={cn(
          "flex h-7 items-center rounded-full border",
          obtained
            ? "border-slider-track"
            : "border-border bg-card shadow-[0_1px_1px_rgba(60,48,30,0.06)]",
        )}
      >
        <div className="flex h-7 min-w-7.5 items-center justify-center">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.button
                key="cancel"
                type="button"
                aria-label="Cancel"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={cancel}
                className="flex size-6.5 cursor-pointer items-center justify-center rounded-full text-ink-subtle"
              >
                <X size={13} strokeWidth={2.4} />
              </motion.button>
            ) : (
              <motion.button
                key="trigger"
                type="button"
                aria-label={`Edit quantity of ${itemName}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={open}
                className={cn(
                  "flex h-6.5 min-w-7.5 cursor-pointer items-center justify-center rounded-full px-2.25 text-sm tabular-nums",
                  obtained ? "text-ink-done" : "font-semibold",
                )}
              >
                {quantity}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                width: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2, delay: 0.1 },
              }}
              className="flex items-center overflow-hidden"
            >
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="h-3.5 w-px bg-border"
              />
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex items-center"
              >
                <input
                  ref={focusAtEnd}
                  aria-label="Quantity"
                  inputMode="decimal"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirm();
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      cancel();
                    }
                  }}
                  className="w-10 bg-transparent text-center text-sm font-semibold tabular-nums caret-green outline-none"
                />
              </motion.div>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="h-3.5 w-px bg-border"
              />
              <motion.button
                type="button"
                aria-label="Confirm quantity"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: 30,
                  opacity: 0,
                  transition: { duration: 0.1 },
                }}
                transition={{ duration: 0.2, delay: 0.15 }}
                onClick={confirm}
                disabled={!isValid}
                className="flex size-6.5 cursor-pointer items-center justify-center rounded-full text-green disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check size={14} strokeWidth={2.6} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {unitAbbreviation && (
        <motion.span
          animate={{ opacity: isEditing ? 0 : 1 }}
          transition={
            isEditing ? { duration: 0.1 } : { duration: 0.15, delay: 0.25 }
          }
          className="text-xs text-muted-foreground"
        >
          {unitAbbreviation}
        </motion.span>
      )}
    </div>
  );
}
