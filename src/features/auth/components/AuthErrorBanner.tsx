import { Link } from "react-router-dom";

import type { AuthErrorDisplay } from "../utils/authErrors";
import { goToGoogleLogin } from "../utils/googleLogin";
import { FormBanner } from "./FormBanner";

const ACTION_CLASSES =
  "cursor-pointer font-bold underline underline-offset-3 hover:no-underline";

export function AuthErrorBanner({
  display,
  email,
}: {
  display: Extract<AuthErrorDisplay, { target: "banner" }>;
  email?: string;
}) {
  const { message, action } = display;
  return (
    <FormBanner tone="error">
      {message}
      {action && " "}
      {action?.to === "signIn" && (
        <Link to="/login" state={{ email }} className={ACTION_CLASSES}>
          {action.label}
        </Link>
      )}
      {action?.to === "google" && (
        <button
          type="button"
          onClick={goToGoogleLogin}
          className={ACTION_CLASSES}
        >
          {action.label}
        </button>
      )}
    </FormBanner>
  );
}
