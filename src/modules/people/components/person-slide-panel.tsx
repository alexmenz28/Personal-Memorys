"use client";

import { SlidePanel } from "@/shared/components/layout/slide-panel";

type PersonSlidePanelProps = {
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
};

export function PersonSlidePanel({ open, children, onClose }: PersonSlidePanelProps) {
  return (
    <SlidePanel open={open} onClose={onClose} desktopOnly>
      {children}
    </SlidePanel>
  );
}
