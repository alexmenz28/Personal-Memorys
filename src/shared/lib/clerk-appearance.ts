import type { Appearance } from "@clerk/types";

/** Shared Clerk UI config — hides dev-instance banners while using pk_test_ keys. */
export const clerkAppearance: Appearance = {
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
};
