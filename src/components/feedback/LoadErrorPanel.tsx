import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

import { StatePanel } from "./StatePanel";

export function LoadErrorPanel({
  what,
  onRetry,
}: {
  what: string;
  onRetry: () => void;
}) {
  return (
    <StatePanel
      icon={AlertTriangle}
      heading="Something went wrong"
      description={`We couldn't load ${what}. Check your connection and try again.`}
      actions={<Button onClick={onRetry}>Retry</Button>}
    />
  );
}
