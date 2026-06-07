import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function TodayPage() {
  const t = await getTranslations("today");

  return (
    <AppShell title={t("title")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("holidays")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message={t("empty")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("events")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message={t("empty")} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
