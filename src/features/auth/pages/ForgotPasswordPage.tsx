import { useState } from "react";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { AuthErrorBanner } from "../components/AuthErrorBanner";
import { ResetLinkSent } from "../components/ResetLinkSent";
import { useCarriedEmail } from "../hooks/useCarriedEmail";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { authErrorDisplay } from "../utils/authErrors";
import { forgotPasswordSchema } from "../utils/authSchemas";
import { AUTH_LINK, AUTH_PRIMARY_BUTTON } from "../utils/styles";

export function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const carriedEmail = useCarriedEmail();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: carriedEmail },
  });
  const email = useWatch({ control, name: "email" });
  const display = forgot.error ? authErrorDisplay(forgot.error) : null;

  if (sentTo) {
    return (
      <AuthCard>
        <ResetLinkSent email={sentTo} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a link to reset your password."
    >
      <form
        noValidate
        onSubmit={handleSubmit(({ email }) =>
          forgot.mutate({ email }, { onSuccess: () => setSentTo(email) }),
        )}
        className="flex flex-col gap-5"
      >
        {display?.target === "banner" && <AuthErrorBanner display={display} />}
        <FormField
          id="forgot-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button
          type="submit"
          disabled={forgot.isPending}
          className={cn(AUTH_PRIMARY_BUTTON, "mt-1")}
        >
          {forgot.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-[15px]">
        <Link to="/login" state={{ email }} className={AUTH_LINK}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
