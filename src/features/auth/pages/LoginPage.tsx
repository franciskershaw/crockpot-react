import { Link } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { ContinueWithGoogleButton } from "../components/ContinueWithGoogleButton";
import { LoginForm } from "../components/LoginForm";
import { OrDivider } from "../components/OrDivider";
import { AUTH_LINK } from "../utils/styles";

export function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back — pick up your menu where you left it."
    >
      <LoginForm />
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
