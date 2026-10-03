import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";

import { useLogin } from "../hooks/useLogin";
import { authErrorDisplay } from "../utils/authErrors";
import { loginSchema } from "../utils/authSchemas";
import { AUTH_LINK, AUTH_PRIMARY_BUTTON } from "../utils/styles";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { AuthField } from "./AuthField";
import { FormBanner } from "./FormBanner";

export function LoginForm({
  defaultEmail = "",
  notice,
  onUnconfirmed,
  children,
}: {
  defaultEmail?: string;
  notice?: string;
  onUnconfirmed?: (
    credentials: { email: string; password: string },
    resendCooldownSeconds: number,
  ) => void;
  children?: (email: string) => ReactNode;
}) {
  const login = useLogin();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: "" },
  });
  const email = useWatch({ control, name: "email" });
  const display = login.error ? authErrorDisplay(login.error) : null;

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit((credentials) =>
          login.mutate(credentials, {
            onSuccess: (outcome) => {
              if (outcome.kind === "unconfirmed") {
                onUnconfirmed?.(credentials, outcome.resendCooldownSeconds);
              }
            },
          }),
        )}
        className="flex flex-col gap-5"
      >
        {notice && <FormBanner tone="success">{notice}</FormBanner>}
        {display?.target === "banner" && <AuthErrorBanner display={display} />}
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          action={
            <Link
              to="/forgot-password"
              state={{ email }}
              className={cn(AUTH_LINK, "text-[13px] font-normal")}
            >
              <span className="md:hidden">Forgot?</span>
              <span className="max-md:hidden">Forgot password?</span>
            </Link>
          }
          {...register("password")}
        />
        <Button
          type="submit"
          disabled={login.isPending}
          className={cn(AUTH_PRIMARY_BUTTON, "mt-1")}
        >
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      {children?.(email)}
    </>
  );
}
