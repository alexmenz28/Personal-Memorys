"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

export function ExportDataCard() {
  const t = useTranslations("settings");
  const linkClassName = cn(
    buttonVariants({ variant: "outline" }),
    "gap-2 no-underline",
  );

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>{t("exportData")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("exportDataHint")}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <a href="/api/export?format=json" className={linkClassName} download>
          <Download className="size-4" />
          {t("exportJson")}
        </a>
        <a href="/api/export?format=csv" className={linkClassName} download>
          <Download className="size-4" />
          {t("exportCsv")}
        </a>
      </CardContent>
    </Card>
  );
}
