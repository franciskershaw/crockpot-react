import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { DEFAULT_AUTHENTICATED_ROUTE } from "../../app/routes";
import { useAuth } from "./AuthContext";
import { getAuthErrorMessage } from "./types";

export function AuthCallback() {
  const [params] = useSearchParams();
  const error = params.get("error");
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (error) {
      toast.error(getAuthErrorMessage(error), { id: "auth-callback-error" });
    }
  }, [error]);

  if (error) return <Navigate to="/" replace />;
  if (isLoading) return null;
  return (
    <Navigate
      to={isAuthenticated ? DEFAULT_AUTHENTICATED_ROUTE : "/"}
      replace
    />
  );
}
