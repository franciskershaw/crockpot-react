import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../data/api";
import { useResendWithCooldown } from "../hooks/useResendWithCooldown";
import { AUTH_QUIET_LINK } from "../utils/styles";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { ResendLine } from "./ResendLine";
import { StatusHeader } from "./StatusHeader";

export function ResetLinkSent({ email }: { email: string }) {
  const resend = useResendWithCooldown(() => forgotPassword({ email }));

  return (
    <div className="flex flex-col items-center text-center">
      <StatusHeader icon={Mail} title="Check your email">
        We've sent a reset link to{" "}
        <strong className="font-bold text-foreground">{email}</strong>. It
        expires in 1 hour.
      </StatusHeader>
      {resend.errorBanner && (
        <div className="mt-5 w-full text-left">
          <AuthErrorBanner display={resend.errorBanner} />
        </div>
      )}
      <ResendLine noun="link" resend={resend} />
      <Link to="/login" className={cn(AUTH_QUIET_LINK, "mt-2")}>
        Back to sign in
      </Link>
    </div>
  );
}
