import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(process.env.NODE_ENV === "development"
    ? {
        // LAN access for testing on phone (local dev only).
        allowedDevOrigins: ["192.168.26.2", "192.168.236.1"],
      }
    : {}),
};

export default withNextIntl(nextConfig);
