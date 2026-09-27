import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface Slot<T> {
  key: string;
  item: T | null;
  index: number;
}

const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

export function AnimatedSlots<T>({
  slots,
  renderItem,
  undoTile,
}: {
  slots: Slot<T>[];
  renderItem: (item: T, index: number) => ReactNode;
  undoTile: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {slots.map(({ key, item, index }) => (
        <motion.div
          key={key}
          layout="position"
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ layout: { duration: 0.35, ease: EASE_OUT } }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {item ? (
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
                {renderItem(item, index)}
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
