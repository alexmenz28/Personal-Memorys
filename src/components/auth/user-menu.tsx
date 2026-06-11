"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/modules/auth/client/auth-client";
import { useTranslations } from "next-intl";
import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("auth");
  const router = useRouter();

  if (!session) {
    return null;
  }

  const initials =
    session.user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-9 items-center justify-center rounded-full border border-input bg-background text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
        aria-label={t("accountMenu")}
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{session.user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="gap-2"
        >
          <UserRound className="size-4" />
          {t("settings")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="gap-2">
          <LogOut className="size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
