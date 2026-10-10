import { useState } from "react";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/features/auth/data/types";

import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { isInvalidPassword } from "../utils/accountErrors";
import { ACCOUNT_INPUT } from "../utils/styles";

export function DeleteAccountDialog({
  user,
  onCancel,
}: {
  user: User;
  onCancel: () => void;
}) {
  const deleteAccount = useDeleteAccount();
  const [value, setValue] = useState("");
  const isGoogle = user.authProvider === "google";
  const canConfirm = isGoogle
    ? value.trim().toLowerCase() === user.email.toLowerCase()
    : value !== "";
  const error =
    deleteAccount.error && isInvalidPassword(deleteAccount.error)
      ? "That password isn't right."
      : undefined;

  const blockWhilePending = (event: Event) => {
    if (deleteAccount.isPending) event.preventDefault();
  };

  return (
    <DialogContent
      showCloseButton={false}
      onEscapeKeyDown={blockWhilePending}
      onInteractOutside={blockWhilePending}
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canConfirm) return;
          deleteAccount.mutate(isGoogle ? {} : { password: value });
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone. We&apos;ll delete your menu, shopping
            list, favourites, regulars and unpublished recipes. Recipes
            you&apos;ve published stay on Crockpot, without your name.
          </DialogDescription>
        </DialogHeader>
        <FormField
          id="delete-account-confirm"
          label={isGoogle ? "Type your email to confirm" : "Password"}
          type={isGoogle ? "email" : "password"}
          autoComplete={isGoogle ? "off" : "current-password"}
          placeholder={isGoogle ? user.email : undefined}
          value={value}
          error={error}
          inputClassName={ACCOUNT_INPUT}
          onChange={(e) => {
            setValue(e.target.value);
            deleteAccount.reset();
          }}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={deleteAccount.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={!canConfirm || deleteAccount.isPending}
          >
            Delete account
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
