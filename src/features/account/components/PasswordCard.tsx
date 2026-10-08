import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import type { User } from "@/features/auth/data/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useChangePassword } from "../hooks/useChangePassword";
import { changePasswordFieldError } from "../utils/accountErrors";
import { changePasswordSchema } from "../utils/accountSchemas";
import { ACCOUNT_INPUT, ACCOUNT_PRIMARY_BUTTON } from "../utils/styles";
import { AccountCard } from "./AccountCard";

export function PasswordCard({ user }: { user: User }) {
  return (
    <AccountCard title="Password">
      {user.authProvider === "google" ? (
        <p className="text-[13.5px] text-ink-body md:text-[14.5px]">
          You sign in with Google, so there&apos;s no password to change here.
        </p>
      ) : (
        <ChangePasswordForm />
      )}
    </AccountCard>
  );
}

function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-3.5 md:gap-4.5"
      onSubmit={handleSubmit((input) =>
        changePassword.mutate(input, {
          onSuccess: () => {
            setValue("currentPassword", "");
            setValue("newPassword", "");
          },
          onError: (error) => {
            const fieldError = changePasswordFieldError(error);
            if (fieldError) {
              setError(fieldError.field, { message: fieldError.message });
            }
          },
        }),
      )}
    >
      <FormField
        id="account-current-password"
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        inputClassName={ACCOUNT_INPUT}
        {...register("currentPassword")}
      />
      <FormField
        id="account-new-password"
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.newPassword?.message}
        inputClassName={ACCOUNT_INPUT}
        {...register("newPassword")}
      />
      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={changePassword.isPending}
          className={ACCOUNT_PRIMARY_BUTTON}
        >
          Change password
        </Button>
      </div>
    </form>
  );
}
