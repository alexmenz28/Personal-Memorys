import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

/**
 * End-aligned action row (LTR: trailing / right).
 * Order children: secondary/destructive first, primary last (rightmost).
 */
export function FormActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2",
        className,
      )}
      {...props}
    />
  );
}
