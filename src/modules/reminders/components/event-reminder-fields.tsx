"use client";

import { Label } from "@/components/ui/label";
import { REMINDER_DAY_OPTIONS } from "@/modules/reminders/schemas/reminder.schema";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

type EventReminderFieldsProps = {
  enabled: boolean;
  daysBefore: number;
  disabled?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onDaysBeforeChange: (daysBefore: number) => void;
};

export function EventReminderFields({
  enabled,
  daysBefore,
  disabled = false,
  onEnabledChange,
  onDaysBeforeChange,
}: EventReminderFieldsProps) {
  const t = useTranslations("events");

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          className="size-4 rounded border-input"
        />
        <span className="font-medium">{t("reminderEmail")}</span>
      </label>

      {enabled ? (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t("reminderDaysBefore")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_DAY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onDaysBeforeChange(option)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  daysBefore === option
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border/60 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`reminderDays.${option}`)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("reminderHint")}</p>
        </div>
      ) : null}
    </div>
  );
}
