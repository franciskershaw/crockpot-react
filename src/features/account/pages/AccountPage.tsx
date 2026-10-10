import { PageTitle } from "@/components/meta/PageTitle";
import { useAuth } from "@/features/auth/components/AuthContext";

import { DeleteAccountCard } from "../components/DeleteAccountCard";
import { PasswordCard } from "../components/PasswordCard";
import { ProfileCard } from "../components/ProfileCard";

export function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="px-5 pt-6 pb-10 md:px-6 md:pt-14 md:pb-16">
      <PageTitle>Account</PageTitle>
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-5 font-display text-[27px] leading-tight font-medium md:mb-7 md:text-[34px]">
          Account settings
        </h1>
        <div className="flex flex-col gap-4 md:gap-5.5">
          <ProfileCard user={user} />
          <PasswordCard user={user} />
          <DeleteAccountCard user={user} />
        </div>
      </div>
    </div>
  );
}
