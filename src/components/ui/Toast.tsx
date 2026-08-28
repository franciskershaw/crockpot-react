import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import * as RadixToast from "@radix-ui/react-toast";
import { X } from "lucide-react";

type ToastVariant = "error" | "success";

interface ToastEntry {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  error: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "error") => {
      setToasts((current) => [
        ...current,
        { id: crypto.randomUUID(), message, variant },
      ]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider>
        {children}

        {toasts.map(({ id, message, variant }) => (
          <RadixToast.Root
            key={id}
            data-testid="toast"
            onOpenChange={(open) => !open && dismiss(id)}
            className={cn(
              "pointer-events-auto relative flex items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg",
              "data-[state=open]:animate-[toastIn_.2s_ease-out]",
              "data-[state=closed]:animate-[toastOut_.15s_ease-in]",
              "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
              "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200",
              "data-[swipe=end]:animate-[toastOut_.15s_ease-in]",
              VARIANT_CLASSES[variant],
            )}
          >
            <RadixToast.Description className="flex-1">
              {message}
            </RadixToast.Description>
            <RadixToast.Close
              aria-label="Dismiss"
              className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="size-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}

        <RadixToast.Viewport className="pointer-events-none fixed inset-x-3 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-96" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
