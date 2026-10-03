import { cn } from "@/lib/utils";

import type { ResendWithCooldown } from "../hooks/useResendWithCooldown";
import { AUTH_LINK } from "../utils/styles";

export function ResendLine({
  noun,
  resend,
}: {
  noun: "code" | "link";
  resend: ResendWithCooldown;
}) {
  if (resend.secondsLeft > 0) {
    return (
      <p className="mt-5 text-[15px] text-placeholder">
        Didn't get it? Resend {noun} in{" "}
        <strong className="font-bold text-ink-body">{resend.label}</strong>
      </p>
    );
  }
  return (
    <p className="mt-5 text-[15px] text-ink-body">
      Didn't get it?{" "}
      <button
        type="button"
        disabled={resend.isPending}
        onClick={resend.resend}
        className={cn(AUTH_LINK, "cursor-pointer")}
      >
        Resend {noun}
      </button>
    </p>
  );
}
