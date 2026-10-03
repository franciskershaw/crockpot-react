import { useApiMutation } from "@/lib/tanstack/useApiMutation";

import { authErrorDisplay, isShownOnAuthForm } from "../utils/authErrors";
import { useResendCountdown } from "./useResendCountdown";

// The server's per-email cooldown. Every caller has just sent something when it mounts.
const COOLDOWN_SECONDS = 60;

export function useResendWithCooldown(send: () => Promise<unknown>) {
  const countdown = useResendCountdown(COOLDOWN_SECONDS);
  const mutation = useApiMutation({
    mutationFn: send,
    isHandledError: isShownOnAuthForm,
    onSuccess: () => countdown.start(COOLDOWN_SECONDS),
    onError: (error) => {
      if (error.status === 429) {
        countdown.start(error.retryAfterSeconds ?? COOLDOWN_SECONDS);
      }
    },
  });
  // A 429 is already told by the countdown.
  const display =
    mutation.error && mutation.error.status !== 429
      ? authErrorDisplay(mutation.error)
      : null;

  return {
    secondsLeft: countdown.secondsLeft,
    label: countdown.label,
    isPending: mutation.isPending,
    resend: () => mutation.mutate(),
    errorBanner: display?.target === "banner" ? display : null,
  };
}

export type ResendWithCooldown = ReturnType<typeof useResendWithCooldown>;
