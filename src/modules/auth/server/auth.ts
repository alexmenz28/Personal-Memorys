import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { resolveAuthBaseUrl } from "@/modules/auth/server/base-url";
import { sendAuthEmail } from "@/modules/auth/server/email";
import { db } from "@/shared/server/db";

const baseURL = resolveAuthBaseUrl();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendAuthEmail({
        to: user.email,
        subject: "Restablecer contraseña — Personal Memories",
        html: `
          <p>Hola${user.name ? ` ${user.name}` : ""},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p><a href="${url}">Restablecer contraseña</a></p>
          <p>Si no la solicitaste, ignora este correo.</p>
        `,
        text: `Restablece tu contraseña: ${url}`,
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
          },
        }
      : undefined,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  trustedOrigins: [baseURL],
  plugins: [nextCookies()],
});

export const isGoogleAuthEnabled = Boolean(googleClientId && googleClientSecret);
