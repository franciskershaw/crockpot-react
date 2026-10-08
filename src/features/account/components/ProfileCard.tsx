import { Button } from "@/components/ui/button";
import { AuthField } from "@/features/auth/components/AuthField";
import type { User } from "@/features/auth/data/types";
import { cn } from "@/lib/utils";

import { ACCOUNT_INPUT, ACCOUNT_PRIMARY_BUTTON } from "../utils/styles";
import { AccountCard } from "./AccountCard";

export function ProfileCard({ user }: { user: User }) {
  return (
    <AccountCard title="Profile">
      <form
        className="flex flex-col gap-3.5 md:gap-4.5"
        onSubmit={(e) => e.preventDefault()}
      >
        <AuthField
          id="account-name"
          label="Name"
          autoComplete="name"
          defaultValue={user.name ?? ""}
          inputClassName={ACCOUNT_INPUT}
        />
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink-secondary">Email</p>
          <p
            className={cn(
              "flex items-center truncate rounded-lg border border-readonly-border bg-readonly-bg px-3.5 text-base text-readonly-text",
              ACCOUNT_INPUT,
            )}
          >
            {user.email}
          </p>
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" className={ACCOUNT_PRIMARY_BUTTON}>
            Save
          </Button>
        </div>
      </form>
    </AccountCard>
  );
}
