import { AppProviders } from "@/components/providers/app-providers";
import { getCurrentUserProfile } from "@/modules/auth/server/session";
import type { ThemePreference } from "@/shared/lib/theme";
import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Memories",
  description:
    "Track important dates, people, and the context you need when the moment arrives.",
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const profile = await getCurrentUserProfile();
  const userTheme = profile?.theme as ThemePreference | undefined;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground transition-colors duration-200">
        <AppProviders
          locale={locale}
          messages={messages}
          userTheme={userTheme}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
