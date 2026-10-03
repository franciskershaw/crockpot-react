import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { AuthErrorBanner } from "../components/AuthErrorBanner";
import { AuthField } from "../components/AuthField";
import { ContinueWithGoogleButton } from "../components/ContinueWithGoogleButton";
import { OrDivider } from "../components/OrDivider";
import { useLogin } from "../hooks/useLogin";
import { authErrorDisplay } from "../utils/authErrors";
import { loginSchema } from "../utils/authSchemas";
import { AUTH_LINK, AUTH_PRIMARY_BUTTON } from "../utils/styles";

export function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const display = login.error ? authErrorDisplay(login.error) : null;

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back — pick up your menu where you left it."
    >
      <form
        noValidate
        onSubmit={handleSubmit((credentials) => login.mutate(credentials))}
        className="flex flex-col gap-5"
      >
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
      <OrDivider />
      <ContinueWithGoogleButton />
      <p className="mt-6 text-center text-[15px] text-ink-body">
        Don't have an account?{" "}
        <Link to="/register" className={AUTH_LINK}>
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
