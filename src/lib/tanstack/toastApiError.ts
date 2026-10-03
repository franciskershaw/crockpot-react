import { toast } from "sonner";

import { apiErrorMessage, SessionExpiredError } from "../http/client";

// An expired session gets one toast from AuthProvider, not one per failed request.
export function toastApiError(error: unknown) {
  if (error instanceof SessionExpiredError) return;
  toast.error(apiErrorMessage(error));
}
