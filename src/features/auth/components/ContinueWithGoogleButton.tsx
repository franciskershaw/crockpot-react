import { Button } from "@/components/ui/button";

import { goToGoogleLogin } from "../utils/googleLogin";
import { GoogleIcon } from "./GoogleIcon";

export function ContinueWithGoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={goToGoogleLogin}
      className="h-13 w-full rounded-lg border-[1.5px] border-foreground bg-card text-base font-semibold shadow-none hover:bg-background [&_svg]:size-5"
    >
      <GoogleIcon />
      Continue with Google
    </Button>
  );
}
