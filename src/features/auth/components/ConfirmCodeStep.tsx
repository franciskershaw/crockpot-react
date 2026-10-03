import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Mail } from "lucide-react";

import {
  AUTH_LINK,
  AUTH_PRIMARY_BUTTON,
  AUTH_QUIET_LINK,
} from "../utils/styles";

const SLOT_CLASSES =
  "h-12 w-10.5 rounded-lg border-[1.5px] border-input bg-card text-xl font-bold text-foreground shadow-none first:rounded-l-lg first:border-l-[1.5px] last:rounded-r-lg md:h-13 md:w-12 md:text-[22px]";

export function ConfirmCodeStep({
  email,
  onUseDifferentEmail,
}: {
  email: string;
  onUseDifferentEmail: () => void;
}) {
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
      <form
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className="mt-7 flex w-full flex-col items-center"
      >
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="6-digit code"
        >
          <InputOTPGroup className="gap-1.75 md:gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={SLOT_CLASSES}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit" className={cn(AUTH_PRIMARY_BUTTON, "mt-6")}>
          Confirm
        </Button>
      </form>
      <p className="mt-5 text-[15px] text-ink-body">
        Didn't get it?{" "}
        <button type="button" className={cn(AUTH_LINK, "cursor-pointer")}>
          Resend code
        </button>
      </p>
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
