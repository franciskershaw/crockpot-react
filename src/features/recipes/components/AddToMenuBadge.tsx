import { AnimatePresence, motion } from "motion/react";

export function AddToMenuBadge({
  show,
  count,
}: {
  show: boolean;
  count: number;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center overflow-visible rounded-full border-2 border-background bg-success text-xs font-medium text-success-foreground shadow-lg"
        >
          {count}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
