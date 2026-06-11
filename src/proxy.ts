import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = (pathname: string) =>
  /^\/(today|upcoming|people|undated|settings|onboarding|auth\/continue)(\/|$)/.test(
    pathname,
  );

export async function proxy(request: NextRequest) {
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
