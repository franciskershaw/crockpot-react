import { Component, type ReactNode } from "react";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <StatePanel
          icon={AlertTriangle}
          heading="Something went wrong"
          description="An unexpected error occurred. Reloading the page usually fixes it."
          actions={
            <Button onClick={() => window.location.reload()}>Reload</Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
