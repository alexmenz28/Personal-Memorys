"use client";

import { useSidebarCollapsed } from "@/shared/hooks/use-sidebar-collapsed";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Settings,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/today", labelKey: "today", icon: CalendarDays },
  { href: "/upcoming", labelKey: "upcoming", icon: Clock3 },
  { href: "/people", labelKey: "people", icon: Users },
  { href: "/undated", labelKey: "undated", icon: Waypoints },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  onPrefetch,
  compact = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  collapsed?: boolean;
  onPrefetch?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      title={collapsed ? label : undefined}
      className={cn(
        "relative flex items-center transition-colors duration-150",
        compact
          ? "min-w-0 flex-1 flex-col gap-1 rounded-xl px-1 py-2 text-[11px] font-medium"
          : cn(
              "rounded-xl text-sm font-medium",
              collapsed
                ? "justify-center px-0 py-2.5"
                : "gap-3 px-3 py-2.5",
            ),
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive ? (
        <span
          className={cn(
            "absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/15",
            compact && "rounded-2xl",
          )}
        />
      ) : null}
      <Icon className="relative z-10 size-4 shrink-0" />
      {!collapsed && !compact ? (
        <span className="relative z-10 truncate">{label}</span>
      ) : null}
      {compact ? (
        <span className="relative z-10 truncate">{label}</span>
      ) : null}
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const { collapsed, toggleCollapsed, ready } = useSidebarCollapsed();

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ width: ready ? (collapsed ? 72 : 256) : 256 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="hidden h-dvh shrink-0 overflow-y-auto overscroll-y-contain border-r border-border/60 bg-card/30 md:flex md:flex-col md:py-6"
      >
        <div
          className={cn(
            "mb-8 flex items-center px-3",
            collapsed ? "justify-center" : "gap-2",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="truncate text-sm font-semibold tracking-tight">
                  Personal Memories
                </p>
                <p className="text-xs text-muted-foreground">Your moments</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2">
          {navItems.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={t(labelKey)}
              icon={icon}
              collapsed={collapsed}
              onPrefetch={() => router.prefetch(href)}
              isActive={
                pathname === href || pathname.startsWith(`${href}/`)
              }
            />
          ))}
        </div>

        <div className="mt-4 px-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? t("expand") : t("collapse")}
            className={cn(
              "flex w-full items-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground",
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span className="text-sm font-medium">{t("collapse")}</span>
              </>
            )}
          </button>
        </div>
      </motion.nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {navItems.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={t(labelKey)}
              icon={icon}
              compact
              onPrefetch={() => router.prefetch(href)}
              isActive={
                pathname === href || pathname.startsWith(`${href}/`)
              }
            />
          ))}
        </div>
      </nav>
    </>
  );
}
