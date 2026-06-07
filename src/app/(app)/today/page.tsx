import { TodayPageContent } from "@/modules/calendar/components/today-page-content";
import { ContentSkeleton } from "@/shared/components/layout/content-skeleton";
import { Suspense } from "react";

export default function TodayPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <TodayPageContent />
    </Suspense>
  );
}
