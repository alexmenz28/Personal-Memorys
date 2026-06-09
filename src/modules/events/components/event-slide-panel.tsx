"use client";

import { EventPanelContent } from "@/modules/events/components/event-panel-content";
import type { EventMutationResult } from "@/modules/events/components/event-panel-content";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import type { SerializedEvent } from "@/modules/calendar/types/calendar-items";
import { SlidePanel } from "@/shared/components/layout/slide-panel";

type EventSlidePanelProps = {
  open: boolean;
  mode: "create" | "edit";
  event?: SerializedEvent | null;
  people: PersonOption[];
  today: string;
  defaultDate?: string;
  defaultUndated?: boolean;
  defaultPersonIds?: string[];
  stacked?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onClose: () => void;
  onCreated?: (event: EventMutationResult) => void;
  onUpdated?: (event: EventMutationResult) => void;
  onDeleted?: (eventId: string) => void;
};

export function EventSlidePanel({
  open,
  onClose,
  stacked = false,
  ...contentProps
}: EventSlidePanelProps) {
  return (
    <SlidePanel open={open} onClose={onClose} stacked={stacked}>
      <EventPanelContent {...contentProps} onSuccess={onClose} />
    </SlidePanel>
  );
}
