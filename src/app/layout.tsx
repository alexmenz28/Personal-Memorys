import { AppProviders } from "@/components/providers/app-providers";
import { getCurrentUserProfile } from "@/lib/auth";
import type { ThemePreference } from "@/lib/theme";
import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
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
