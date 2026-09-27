import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { MenuEntry } from "../data/types";

export interface MenuSlot {
  key: string;
  entry: MenuEntry | null;
  index: number;
}

const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

export function AnimatedMenuSlots({
  slots,
  renderEntry,
  undoTile,
}: {
  slots: MenuSlot[];
  renderEntry: (entry: MenuEntry, index: number) => ReactNode;
  undoTile: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {slots.map(({ key, entry, index }) => (
        <motion.div
          key={key}
          layout="position"
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ layout: { duration: 0.35, ease: EASE_OUT } }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {entry ? (
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
                {renderEntry(entry, index)}
              </motion.div>
            ) : (
              <motion.div
                key="undo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25 }}
                className="h-full *:h-full"
              >
                {undoTile}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
