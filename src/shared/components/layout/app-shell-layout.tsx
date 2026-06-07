"use client";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppNav } from "@/shared/components/layout/app-nav";
import { PageChromeProvider } from "@/shared/components/layout/page-chrome";

type AppShellLayoutProps = {
  children: React.ReactNode;
};

export function AppShellLayout({ children }: AppShellLayoutProps) {
  return (
    <PageChromeProvider>
      <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
        <AppNav />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <AppHeader />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </PageChromeProvider>
  );
}
