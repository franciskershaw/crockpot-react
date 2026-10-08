import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { getInitials } from "./getInitials";

export function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  const initials = getInitials(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user.name ?? user.email}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">
            <SettingsIcon />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
