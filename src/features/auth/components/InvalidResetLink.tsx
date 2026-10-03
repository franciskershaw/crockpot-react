import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleX } from "lucide-react";
import { Link } from "react-router-dom";

import { AUTH_PRIMARY_BUTTON } from "../utils/styles";
import { StatusHeader } from "./StatusHeader";

export function InvalidResetLink() {
  return (
    <div className="flex flex-col items-center text-center">
      <StatusHeader icon={CircleX} tone="error" title="This link isn't valid">
        It may have expired or already been used.
      </StatusHeader>
      <Button asChild className={cn(AUTH_PRIMARY_BUTTON, "mt-7")}>
        <Link to="/forgot-password">Request a new link</Link>
      </Button>
    </div>
  );
}
