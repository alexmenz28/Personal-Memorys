"use client";

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
        <select
          id="country"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.countryCode}
          onChange={(event) => handleCountryChange(event.target.value)}
        >
          {supportedCountries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">{labels.timezone}</Label>
        <select
          id="timezone"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.timezone}
          onChange={(event) =>
            onChange({ ...form, timezone: event.target.value })
          }
        >
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
        {labels.timezoneHint ? (
          <p className="text-xs text-muted-foreground">{labels.timezoneHint}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">{labels.language}</Label>
        <select
          id="language"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.locale}
          onChange={(event) =>
            onChange({
              ...form,
              locale: event.target.value as UpdateProfileInput["locale"],
            })
          }
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>
    </>
  );
}
