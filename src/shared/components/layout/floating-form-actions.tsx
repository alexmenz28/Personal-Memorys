import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

/**
 * End-aligned actions that float at the bottom while scrolling (no full-width bar).
 */
export function FloatingFormActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("sticky bottom-4 z-10 mt-6 flex justify-end", className)}
      {...props}
    />
  );
}
