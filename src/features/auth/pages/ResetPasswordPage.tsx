import { FormField } from "@/components/form/FormField";
import { PageTitle } from "@/components/meta/PageTitle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { AuthErrorBanner } from "../components/AuthErrorBanner";
import { InvalidResetLink } from "../components/InvalidResetLink";
import { useResetPassword } from "../hooks/useResetPassword";
import { authErrorDisplay } from "../utils/authErrors";
import { resetPasswordSchema } from "../utils/authSchemas";
import { AUTH_PRIMARY_BUTTON } from "../utils/styles";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const display = reset.error ? authErrorDisplay(reset.error) : null;

  if (!token || display?.target === "invalidLink") {
    return (
      <AuthCard>
        <PageTitle>Set a new password</PageTitle>
        <InvalidResetLink />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a new password for your account."
    >
      <PageTitle>Set a new password</PageTitle>
      <form
        noValidate
        onSubmit={handleSubmit(({ password }) =>
          reset.mutate({ token, newPassword: password }),
        )}
        className="flex flex-col gap-5"
      >
        {display?.target === "banner" && <AuthErrorBanner display={display} />}
        <FormField
          id="reset-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={
            errors.password?.message ??
            (display?.target === "password" ? display.message : undefined)
          }
          {...register("password")}
        />
        <FormField
          id="reset-confirm-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button
          type="submit"
          disabled={reset.isPending}
          className={cn(AUTH_PRIMARY_BUTTON, "mt-1")}
        >
          {reset.isPending ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  );
}
