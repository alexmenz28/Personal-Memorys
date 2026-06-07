"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  Settings,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  compact = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center transition-colors duration-200",
        compact
          ? "min-w-0 flex-1 flex-col gap-1 rounded-xl px-1 py-2 text-[11px] font-medium"
          : "gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive ? (
        <motion.span
          layoutId="nav-active"
          className={cn(
            "absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/15",
            compact && "rounded-2xl",
          )}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
      <Icon className="relative z-10 size-4" />
      <span className="relative z-10 truncate">{label}</span>
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <>
      <nav className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/60 md:bg-card/30 md:px-4 md:py-6">
        <div className="mb-8 flex items-center gap-2 px-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Personal Memories</p>
            <p className="text-xs text-muted-foreground">Your moments</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={t(labelKey)}
              icon={icon}
              isActive={
                pathname === href || pathname.startsWith(`${href}/`)
              }
            />
          ))}
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {navItems.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={t(labelKey)}
              icon={icon}
              compact
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
