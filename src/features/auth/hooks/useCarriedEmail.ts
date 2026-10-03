import { useLocation } from "react-router-dom";

// The email typed on the auth page the user just came from, passed in link state rather than the URL.
export function useCarriedEmail(): string {
  const { state } = useLocation();
  const email = (state as { email?: unknown } | null)?.email;
  return typeof email === "string" ? email : "";
}
