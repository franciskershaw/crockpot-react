import { Button } from "../../components/ui/button";

export function SignInPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>Crockpot</h1>
      <Button
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
        }}
      >
        Continue with Google
      </Button>
    </div>
  );
}
