"use client";

import { AppNav } from "@/components/layout/app-nav";
import { FadeIn } from "@/components/motion/fade-in";
import { UserButton } from "@clerk/nextjs";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppNav />
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 px-4 py-5 backdrop-blur-md md:px-8">
          <div className="flex items-start justify-between gap-4">
            <FadeIn className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </FadeIn>
            <div className="flex shrink-0 items-center gap-3">
              {action}
              <UserButton />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <FadeIn delay={0.05}>{children}</FadeIn>
        </main>
      </div>
    </div>
  );
}
