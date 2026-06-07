"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

type PageActionButtonProps = ComponentProps<typeof Button>;

export function PageActionButton({
  className,
  children,
  ...props
}: PageActionButtonProps) {
  return (
    <Button className={cn("gap-2 shadow-sm", className)} {...props}>
      {children}
    </Button>
  );
}
