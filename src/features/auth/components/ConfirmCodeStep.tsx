import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { resendConfirmation } from "../data/api";
import { useConfirmAndSignIn } from "../hooks/useConfirmAndSignIn";
import { useResendWithCooldown } from "../hooks/useResendWithCooldown";
import { authErrorDisplay } from "../utils/authErrors";
import { confirmCodeSchema } from "../utils/authSchemas";
import { AUTH_PRIMARY_BUTTON, AUTH_QUIET_LINK } from "../utils/styles";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { LoginForm } from "./LoginForm";
import { ResendLine } from "./ResendLine";

const SLOT_CLASSES =
  "h-12 w-10.5 rounded-lg border-[1.5px] border-input bg-card text-xl font-bold text-foreground shadow-none first:rounded-l-lg first:border-l-[1.5px] last:rounded-r-lg md:h-13 md:w-12 md:text-[22px]";

export function ConfirmCodeStep({
  email,
  password,
  initialCooldownSeconds,
  onUseDifferentEmail,
}: {
  email: string;
  password?: string;
  initialCooldownSeconds?: number;
  onUseDifferentEmail: () => void;
}) {
  const confirm = useConfirmAndSignIn(email, password);
  const resend = useResendWithCooldown(
    () => resendConfirmation({ email }),
    initialCooldownSeconds,
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(confirmCodeSchema),
    defaultValues: { code: "" },
  });

  if (confirm.isSuccess && !confirm.data) {
    return (
      <LoginForm
        defaultEmail={email}
        notice="Email confirmed — please sign in."
      />
    );
  }

  const confirmDisplay = confirm.error ? authErrorDisplay(confirm.error) : null;
  const banner =
    (confirmDisplay?.target === "banner" ? confirmDisplay : null) ??
    resend.errorBanner;
  const codeMessage =
    errors.code?.message ??
    (confirmDisplay?.target === "code" ? confirmDisplay.message : undefined);

  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-chip text-green md:size-13">
        <Mail
          aria-hidden="true"
          className="size-5.5 md:size-6"
          strokeWidth={2}
        />
      </span>
      <h1 className="mt-4 font-display text-[26px] leading-tight font-medium md:text-[30px]">
        Check your email
      </h1>
      <p className="mt-1.5 text-[15px] text-ink-body">
        We sent a 6-digit code to
        <br />
        <strong className="font-bold text-foreground">{email}</strong>
      </p>
      {banner && (
        <div className="mt-5 w-full text-left">
          <AuthErrorBanner display={banner} />
        </div>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(({ code }) => confirm.mutate(code))}
        className="mt-7 flex w-full flex-col items-center"
      >
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <InputOTP
              {...field}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="6-digit code"
              aria-invalid={codeMessage ? true : undefined}
              aria-describedby={codeMessage ? "confirm-code-error" : undefined}
            >
              <InputOTPGroup className="gap-1.75 md:gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={cn(
                      SLOT_CLASSES,
                      codeMessage && "border-field-error",
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {codeMessage && (
          <p
            id="confirm-code-error"
            className="mt-2 text-[13px] font-semibold text-field-error"
          >
            {codeMessage}
          </p>
        )}
        <Button
          type="submit"
          disabled={confirm.isPending}
          className={cn(AUTH_PRIMARY_BUTTON, "mt-6")}
        >
          {confirm.isPending ? "Confirming…" : "Confirm"}
        </Button>
      </form>
      <ResendLine noun="code" resend={resend} />
      <button
        type="button"
        onClick={onUseDifferentEmail}
        className={cn(AUTH_QUIET_LINK, "mt-2")}
      >
        Use a different email
      </button>
    </div>
  );
}
