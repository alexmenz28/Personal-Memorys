"use client";

import { useState } from "react";

/**
 * Keeps client state aligned with fresh server props after navigation or router.refresh().
 */
export function useServerSyncedState<T>(serverValue: T) {
  const [value, setValue] = useState(serverValue);
  const [previousServerValue, setPreviousServerValue] = useState(serverValue);

  if (previousServerValue !== serverValue) {
    setPreviousServerValue(serverValue);
    setValue(serverValue);
  }

  return [value, setValue] as const;
}
