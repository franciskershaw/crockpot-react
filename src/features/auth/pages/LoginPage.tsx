import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { AuthField } from "../components/AuthField";
import { ContinueWithGoogleButton } from "../components/ContinueWithGoogleButton";
import { OrDivider } from "../components/OrDivider";
import { AUTH_LINK, AUTH_PRIMARY_BUTTON } from "../utils/styles";

export function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back — pick up your menu where you left it."
    >
      <form
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-5"
      >
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          action={
            <Link
              to="/forgot-password"
              className={cn(AUTH_LINK, "text-[13px] font-normal")}
            >
              <span className="md:hidden">Forgot?</span>
              <span className="max-md:hidden">Forgot password?</span>
            </Link>
          }
        />
        <Button type="submit" className={cn(AUTH_PRIMARY_BUTTON, "mt-1")}>
          Sign in
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
