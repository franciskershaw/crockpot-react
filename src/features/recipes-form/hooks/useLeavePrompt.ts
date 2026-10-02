import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export function useLeavePrompt(hasUnsavedChanges: boolean) {
  const leaving = useRef(false);
  const blocker = useBlocker(() => hasUnsavedChanges && !leaving.current);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (leaving.current) return;
      event.preventDefault();
      // Older Safari only prompts when returnValue is set.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  return {
    blocker,
    // Call before navigating away after a save, which leaves the form dirty.
    allowLeaving: () => {
      leaving.current = true;
    },
  };
}
