import { Button } from "../../components/ui/button";
import { useAuth } from "../auth/components/AuthContext";
import { useLogout } from "../auth/hooks/useLogout";

export function MenuScreen() {
  const { user } = useAuth();
  const logout = useLogout();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <p>{user?.name ?? "—"}</p>
      <p>{user?.email}</p>
      <p>{user?.role}</p>
      <Button onClick={() => logout.mutate()} disabled={logout.isPending}>
        Log out
      </Button>
    </div>
  );
}
