"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PageChromeState = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

type PageChromeContextValue = {
  chrome: PageChromeState;
  setChrome: (chrome: PageChromeState) => void;
};

const PageChromeContext = createContext<PageChromeContextValue | null>(null);

const defaultChrome: PageChromeState = { title: "" };

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<PageChromeState>(defaultChrome);
  const value = useMemo(() => ({ chrome, setChrome }), [chrome]);

  return (
    <PageChromeContext.Provider value={value}>
      {children}
    </PageChromeContext.Provider>
  );
}

export function usePageChrome() {
  const context = useContext(PageChromeContext);

  if (!context) {
    throw new Error("usePageChrome must be used within PageChromeProvider");
  }

  return context;
}

type SetPageChromeProps = PageChromeState;

export function SetPageChrome({
  title,
  subtitle,
  action,
}: SetPageChromeProps) {
  const { setChrome } = usePageChrome();

  useEffect(() => {
    queueMicrotask(() => {
      setChrome({ title, subtitle, action });
    });
  }, [title, subtitle, action, setChrome]);

  return null;
}

export function PageActions() {
  const { chrome } = usePageChrome();

  if (!chrome.action) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
      {chrome.action}
    </div>
  );
}

type AppPageProps = PageChromeState & {
  children: ReactNode;
};

export function AppPage({ title, subtitle, action, children }: AppPageProps) {
  return (
    <>
      <SetPageChrome title={title} subtitle={subtitle} action={action} />
      <PageActions />
      {children}
    </>
  );
}
