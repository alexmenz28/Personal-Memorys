"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "personal-memories-sidebar-collapsed";
const CHANGE_EVENT = "personal-memories-sidebar-change";

function getCollapsedSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribeCollapsed(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    () => false,
  );

  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggleCollapsed = useCallback(() => {
    const next = !getCollapsedSnapshot();
    window.localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { collapsed, toggleCollapsed, ready };
}
