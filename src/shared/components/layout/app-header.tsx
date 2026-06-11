"use client";

import { UserMenu } from "@/components/auth/user-menu";
import { usePageChrome } from "@/shared/components/layout/page-chrome";

export function AppHeader() {
  const { chrome } = usePageChrome();

  return (
    <header className="shrink-0 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-md md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {chrome.title}
          </h1>
          {chrome.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {chrome.subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
