import { Check } from "lucide-react";
import { motion, type TargetAndTransition } from "motion/react";

interface ConfirmMotion {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
}

// x: slides in from the right (compact button, growing pill). y: drops from the top (CTA, fixed-width pill).
const CONFIRM_MOTION: Record<"x" | "y", ConfirmMotion> = {
  x: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.2, delay: 0.15 } },
    exit: { x: 30, opacity: 0, transition: { duration: 0.1, delay: 0 } },
  },
  y: {
    initial: { y: -16, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.15, duration: 0.2 },
    },
    exit: { y: -16, opacity: 0, transition: { duration: 0.1 } },
  },
};

export function AddToMenuConfirmButton({
  axis,
  isMutating,
  onConfirm,
}: {
  axis: "x" | "y";
  isMutating: boolean;
  onConfirm: (event: React.MouseEvent) => void;
}) {
  const m = CONFIRM_MOTION[axis];

  return (
    <motion.button
      type="button"
      initial={m.initial}
      animate={m.animate}
      exit={m.exit}
      onClick={onConfirm}
      disabled={isMutating}
      aria-label="Confirm amount"
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-success transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Check className="size-4" />
    </motion.button>
  );
}
