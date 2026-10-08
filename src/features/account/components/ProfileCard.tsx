import { FormField } from "@/components/FormField";
import { GoogleIcon } from "@/components/GoogleIcon";
import { Button } from "@/components/ui/button";
import type { User } from "@/features/auth/data/types";
import { NAME_RULE } from "@/features/auth/utils/authSchemas";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useUpdateName } from "../hooks/useUpdateName";
import { isInvalidName } from "../utils/accountErrors";
import { profileNameSchema } from "../utils/accountSchemas";
import { ACCOUNT_INPUT, ACCOUNT_PRIMARY_BUTTON } from "../utils/styles";
import { AccountCard } from "./AccountCard";

export function ProfileCard({ user }: { user: User }) {
  const updateName = useUpdateName();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name: user.name ?? "" },
  });

  return (
    <AccountCard title="Profile">
      <form
        noValidate
        className="flex flex-col gap-3.5 md:gap-4.5"
        onSubmit={handleSubmit(({ name }) =>
          updateName.mutate(name, {
            onSuccess: (saved) => setValue("name", saved.name ?? ""),
            onError: (error) => {
              if (isInvalidName(error)) {
                setError("name", { message: NAME_RULE });
              }
            },
          }),
        )}
      >
        <FormField
          id="account-name"
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          inputClassName={ACCOUNT_INPUT}
          {...register("name")}
        />
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink-secondary">Email</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <p
              className={cn(
                "flex min-w-0 flex-1 items-center rounded-lg border border-readonly-border bg-readonly-bg px-3.5 text-base text-readonly-text",
                ACCOUNT_INPUT,
              )}
            >
              <span className="truncate">{user.email}</span>
            </p>
            {user.authProvider === "google" && (
              <p className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ink-body">
                <GoogleIcon className="size-4" />
                Signed in with Google
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={updateName.isPending}
            className={ACCOUNT_PRIMARY_BUTTON}
          >
            Save
          </Button>
        </div>
      </form>
    </AccountCard>
  );
}
