import { UpcomingPageContent } from "@/modules/calendar/components/upcoming-page-content";
import { ContentSkeleton } from "@/shared/components/layout/content-skeleton";
import { Suspense } from "react";

export default function UpcomingPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <UpcomingPageContent />
    </Suspense>
  );
}
