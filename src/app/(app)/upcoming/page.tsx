import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function UpcomingPage() {
  const t = await getTranslations("upcoming");

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <EmptyState message={t("empty")} />
    </AppShell>
  );
}
