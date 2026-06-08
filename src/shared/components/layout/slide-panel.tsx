"use client";

import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type SlidePanelProps = {
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  /** When true, panel and backdrop only appear from md breakpoint up. */
  desktopOnly?: boolean;
  /** When true, raises z-index so this panel can sit above another open panel. */
  stacked?: boolean;
};

const panelEase = [0.22, 1, 0.36, 1] as const;

export function SlidePanel({
  open,
  children,
  onClose,
  className,
  desktopOnly = false,
  stacked = false,
}: SlidePanelProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: panelEase };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            className={cn(
              "fixed inset-0 bg-background/40 backdrop-blur-[2px]",
              stacked ? "z-50" : "z-40",
              desktopOnly && "hidden md:block",
            )}
            aria-label="Close panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          />
          <motion.aside
            className={cn(
              "fixed inset-y-0 right-0 flex w-[min(100%,32rem)] flex-col border-l border-border/60 bg-background shadow-xl",
              stacked ? "z-60" : "z-50",
              desktopOnly && "hidden md:flex",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={transition}
          >
            <div className="flex items-center justify-end border-b border-border/60 px-4 py-3 md:px-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6">
              {children}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
