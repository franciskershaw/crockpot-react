import { ApiError } from "@/lib/http/client";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { login, resendConfirmation } from "../data/api";
import { isShownOnAuthForm } from "../utils/authErrors";
import { startSession } from "../utils/startSession";
import { RESEND_COOLDOWN_SECONDS } from "./useResendWithCooldown";

export type LoginOutcome =
  { kind: "signedIn" } | { kind: "unconfirmed"; resendCooldownSeconds: number };

const isUnconfirmed = (error: unknown) =>
  error instanceof ApiError &&
  error.status === 403 &&
  error.message === "email_not_confirmed";

// The original code may have expired, so send another; a too-soon 429 means one is already on its way.
async function sendFreshCode(email: string): Promise<number> {
  try {
    await resendConfirmation({ email });
    return RESEND_COOLDOWN_SECONDS;
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return error.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS;
    }
    return 0;
  }
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: async (credentials: {
      email: string;
      password: string;
    }): Promise<LoginOutcome> => {
      const session = await login(credentials).catch((error: unknown) => {
        if (isUnconfirmed(error)) return null;
        throw error;
      });
      if (!session) {
        return {
          kind: "unconfirmed",
          resendCooldownSeconds: await sendFreshCode(credentials.email),
        };
      }
      await startSession(queryClient, session.accessToken);
      return { kind: "signedIn" };
    },
    isHandledError: isShownOnAuthForm,
  });
}
