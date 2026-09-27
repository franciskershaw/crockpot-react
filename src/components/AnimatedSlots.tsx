import type { ReactNode } from "react";
import type { UndoSlot } from "@/lib/undoSlots";
import { AnimatePresence, motion } from "motion/react";

const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

export function AnimatedSlots<T>({
  slots,
  renderItem,
  renderUndo,
}: {
  slots: UndoSlot<T>[];
  renderItem: (slot: UndoSlot<T>) => ReactNode;
  renderUndo: (slot: UndoSlot<T>) => ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {slots.map((slot) => (
        <motion.div
          key={slot.key}
          layout="position"
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ layout: { duration: 0.35, ease: EASE_OUT } }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!slot.undo ? (
              <motion.div
                key="entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  transition: { duration: 0.2 },
                }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="h-full *:h-full"
              >
                {renderItem(slot)}
              </motion.div>
            ) : (
              <motion.div
                key="undo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25 }}
                className="relative h-full"
              >
                {/* Keeps the removed item's exact footprint under the tile. */}
                <div aria-hidden inert className="invisible h-full *:h-full">
                  {renderItem(slot)}
                </div>
                <div className="absolute inset-0 *:h-full">
                  {renderUndo(slot)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
