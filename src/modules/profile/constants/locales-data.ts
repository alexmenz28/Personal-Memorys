export type CountryProfile = {
  code: string;
  label: string;
  defaultTimezone: string;
  timezones: readonly string[];
};

export const countryProfiles: readonly CountryProfile[] = [
  {
    code: "US",
    label: "United States",
    defaultTimezone: "America/New_York",
    timezones: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
    ],
  },
  {
    code: "MX",
    label: "Mexico",
    defaultTimezone: "America/Mexico_City",
    timezones: [
      "America/Mexico_City",
      "America/Tijuana",
      "America/Cancun",
      "America/Monterrey",
    ],
  },
  {
    code: "ES",
    label: "Spain",
    defaultTimezone: "Europe/Madrid",
    timezones: ["Europe/Madrid", "Atlantic/Canary"],
  },
  {
    code: "AR",
    label: "Argentina",
    defaultTimezone: "America/Buenos_Aires",
    timezones: ["America/Buenos_Aires"],
  },
  {
    code: "BO",
    label: "Bolivia",
    defaultTimezone: "America/La_Paz",
    timezones: ["America/La_Paz"],
  },
  {
    code: "CO",
    label: "Colombia",
    defaultTimezone: "America/Bogota",
    timezones: ["America/Bogota"],
  },
  {
    code: "CL",
    label: "Chile",
    defaultTimezone: "America/Santiago",
    timezones: ["America/Santiago", "Pacific/Easter"],
  },
  {
    code: "PE",
    label: "Peru",
    defaultTimezone: "America/Lima",
    timezones: ["America/Lima"],
  },
  {
    code: "GB",
    label: "United Kingdom",
    defaultTimezone: "Europe/London",
    timezones: ["Europe/London"],
  },
  {
    code: "CA",
    label: "Canada",
    defaultTimezone: "America/Toronto",
    timezones: [
      "America/Toronto",
      "America/Vancouver",
      "America/Edmonton",
      "America/Winnipeg",
      "America/Halifax",
    ],
  },
] as const;

export const supportedCountries = countryProfiles.map(({ code, label }) => ({
  code,
  label,
}));

export function getCountryProfile(countryCode: string) {
  return countryProfiles.find((country) => country.code === countryCode);
}

export function getTimezonesForCountry(countryCode: string) {
  return getCountryProfile(countryCode)?.timezones ?? ["UTC"];
}

export function getDefaultTimezoneForCountry(countryCode: string) {
  return getCountryProfile(countryCode)?.defaultTimezone ?? "UTC";
}

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function resolveTimezoneForCountry(
  countryCode: string,
  currentTimezone?: string,
) {
  const options = getTimezonesForCountry(countryCode);

  if (currentTimezone && options.includes(currentTimezone)) {
    return currentTimezone;
  }

  const browserTimezone = getBrowserTimezone();
  if (options.includes(browserTimezone)) {
    return browserTimezone;
  }

  return getDefaultTimezoneForCountry(countryCode);
}
