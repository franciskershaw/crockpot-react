import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { User } from "@/features/auth/data/types";
import { isAdmin } from "@/features/auth/utils/isAdmin";
import { Trash2Icon } from "lucide-react";

import { AccountCard } from "./AccountCard";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

export function DeleteAccountCard({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const userIsAdmin = isAdmin(user);

  return (
    <AccountCard
      title="Delete account"
      icon={<Trash2Icon className="size-4" aria-hidden />}
      tone="danger"
    >
      <p className="text-[13.5px] md:text-[14.5px]">
        Permanently delete your account and your data.
      </p>
      {userIsAdmin && (
        <p className="mt-2 text-[13px] font-semibold text-ink-subtle">
          Admin accounts can&apos;t be deleted here.
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={userIsAdmin}
          onClick={() => {
            setAttempt((n) => n + 1);
            setOpen(true);
          }}
          className="h-11 w-full rounded-lg border-[1.5px] border-danger-outline bg-card px-6 text-[15px] font-bold text-rust-text hover:bg-card hover:text-rust-text disabled:pointer-events-auto disabled:cursor-not-allowed disabled:border-input disabled:bg-readonly-bg disabled:text-disabled-ink disabled:opacity-100 md:h-11.5 md:w-auto"
        >
          Delete account…
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DeleteAccountDialog
          key={attempt}
          user={user}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </AccountCard>
  );
}
