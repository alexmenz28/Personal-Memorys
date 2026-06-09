"use client";

import { useSyncExternalStore } from "react";

function subscribeMediaQuery(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onStoreChange);

  return () => media.removeEventListener("change", onStoreChange);
}

function getMediaQuerySnapshot(query: string) {
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => subscribeMediaQuery(query, onStoreChange),
    () => getMediaQuerySnapshot(query),
    () => false,
  );
}
