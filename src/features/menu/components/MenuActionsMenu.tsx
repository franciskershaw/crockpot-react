import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";

import { ClearMenuDialog } from "./ClearMenuDialog";

export function MenuActionsMenu() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More menu actions"
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-chip data-[state=open]:bg-chip"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-47.5 rounded-[10px] border-border bg-card p-1"
        >
          <DropdownMenuItem
            onSelect={() => setIsConfirmOpen(true)}
            className="cursor-pointer gap-2.5 px-3 py-2.5 text-sm font-semibold text-rust-text focus:bg-accent-rust/10 focus:text-rust-text"
          >
            <Trash2 size={16} strokeWidth={2} className="text-rust-text" />
            Clear menu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ClearMenuDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen} />
    </>
  );
}
