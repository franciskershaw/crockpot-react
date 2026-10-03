import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { ConfirmCodeStep } from "../components/ConfirmCodeStep";
import { ContinueWithGoogleButton } from "../components/ContinueWithGoogleButton";
import { LoginForm } from "../components/LoginForm";
import { OrDivider } from "../components/OrDivider";
import { useCarriedEmail } from "../hooks/useCarriedEmail";
import { AUTH_LINK } from "../utils/styles";

// React state only: the password must never reach the URL, history state or storage.
type View =
  | { step: "form"; email: string }
  | { step: "code"; email: string; password: string; cooldownSeconds: number };

// Keyed on the location so a link back to /login (e.g. from the code step's banner) starts over at the form.
export function LoginPage() {
  return <LoginFlow key={useLocation().key} />;
}

function LoginFlow() {
  const carriedEmail = useCarriedEmail();
  const [view, setView] = useState<View>({ step: "form", email: carriedEmail });

  if (view.step === "code") {
    return (
      <AuthCard>
        <ConfirmCodeStep
          email={view.email}
          password={view.password}
          initialCooldownSeconds={view.cooldownSeconds}
          onUseDifferentEmail={() =>
            setView({ step: "form", email: view.email })
          }
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back — pick up your menu where you left it."
    >
      <LoginForm
        defaultEmail={view.email}
        onUnconfirmed={({ email, password }, cooldownSeconds) =>
          setView({ step: "code", email, password, cooldownSeconds })
        }
      >
        {(email) => (
          <>
            <OrDivider />
            <ContinueWithGoogleButton />
            <p className="mt-6 text-center text-[15px] text-ink-body">
              Don't have an account?{" "}
              <Link to="/register" state={{ email }} className={AUTH_LINK}>
                Create one
              </Link>
            </p>
          </>
        )}
      </LoginForm>
    </AuthCard>
  );
}
