import { useState } from "react";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { AuthErrorBanner } from "../components/AuthErrorBanner";
import { ConfirmCodeStep } from "../components/ConfirmCodeStep";
import { ContinueWithGoogleButton } from "../components/ContinueWithGoogleButton";
import { OrDivider } from "../components/OrDivider";
import { useCarriedEmail } from "../hooks/useCarriedEmail";
import { useRegister } from "../hooks/useRegister";
import { authErrorDisplay } from "../utils/authErrors";
import { registerSchema } from "../utils/authSchemas";
import { AUTH_LINK, AUTH_PRIMARY_BUTTON } from "../utils/styles";

export function RegisterPage() {
  const registration = useRegister();
  // React state only: the password must never reach the URL, history state or storage.
  const [registered, setRegistered] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const carriedEmail = useCarriedEmail();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: carriedEmail,
      password: "",
      confirmPassword: "",
    },
  });
  const email = useWatch({ control, name: "email" });
  const display = registration.error
    ? authErrorDisplay(registration.error)
    : null;

  if (registered) {
    return (
      <AuthCard>
        <ConfirmCodeStep
          email={registered.email}
          password={registered.password}
          onUseDifferentEmail={() => {
            registration.reset();
            setRegistered(null);
          }}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free forever. Takes about a minute."
    >
      <form
        noValidate
        onSubmit={handleSubmit(({ name, email, password }) =>
          registration.mutate(
            { name, email, password },
            { onSuccess: () => setRegistered({ email, password }) },
          ),
        )}
        className="flex flex-col gap-5"
      >
        {display?.target === "banner" && (
          <AuthErrorBanner display={display} email={email} />
        )}
        <FormField
          id="register-name"
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={
            errors.password?.message ??
            (display?.target === "password" ? display.message : undefined)
          }
          {...register("password")}
        />
        <FormField
          id="register-confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button
          type="submit"
          disabled={registration.isPending}
          className={cn(AUTH_PRIMARY_BUTTON, "mt-1")}
        >
          {registration.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <OrDivider />
      <ContinueWithGoogleButton />
      <p className="mt-6 text-center text-[15px] text-ink-body">
        Already have an account?{" "}
        <Link to="/login" state={{ email }} className={AUTH_LINK}>
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
