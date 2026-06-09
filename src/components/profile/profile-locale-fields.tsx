"use client";

import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import {
  getTimezonesForCountry,
  resolveTimezoneForCountry,
  supportedCountries,
} from "@/modules/profile/constants/locales-data";
import type { UpdateProfileInput } from "@/modules/profile/schemas/profile.schema";
import { useEffect, useRef } from "react";

type ProfileLocaleFieldsProps = {
  form: UpdateProfileInput;
  onChange: React.Dispatch<React.SetStateAction<UpdateProfileInput>>;
  labels: {
    country: string;
    timezone: string;
    language: string;
    timezoneHint?: string;
  };
  autoDetectTimezoneOnMount?: boolean;
};

export function ProfileLocaleFields({
  form,
  onChange,
  labels,
  autoDetectTimezoneOnMount = false,
}: ProfileLocaleFieldsProps) {
  const hasAutoDetected = useRef(false);
  const timezones = getTimezonesForCountry(form.countryCode);

  useEffect(() => {
    if (!autoDetectTimezoneOnMount || hasAutoDetected.current) {
      return;
    }

    hasAutoDetected.current = true;

    onChange((current) => ({
      ...current,
      timezone: resolveTimezoneForCountry(current.countryCode, current.timezone),
    }));
  }, [autoDetectTimezoneOnMount, onChange]);

  function handleCountryChange(countryCode: string) {
    onChange({
      ...form,
      countryCode,
      timezone: resolveTimezoneForCountry(countryCode),
    });
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="country">{labels.country}</Label>
        <FormSelect
          id="country"
          value={form.countryCode}
          onValueChange={handleCountryChange}
          options={supportedCountries.map((country) => ({
            value: country.code,
            label: country.label,
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">{labels.timezone}</Label>
        <FormSelect
          id="timezone"
          value={form.timezone}
          onValueChange={(timezone) => onChange({ ...form, timezone })}
          options={timezones.map((timezone) => ({
            value: timezone,
            label: timezone,
          }))}
        />
        {labels.timezoneHint ? (
          <p className="text-xs text-muted-foreground">{labels.timezoneHint}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">{labels.language}</Label>
        <FormSelect
          id="language"
          value={form.locale}
          onValueChange={(locale) =>
            onChange({
              ...form,
              locale: locale as UpdateProfileInput["locale"],
            })
          }
          options={[
            { value: "en", label: "English" },
            { value: "es", label: "Spanish" },
          ]}
        />
      </div>
    </>
  );
}
