import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getCurrentUserProfile() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return db.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { subscription: true },
  });
}

export async function requireCurrentUserProfile() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile;
}

export async function syncUserProfileFromClerk() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  return db.userProfile.upsert({
    where: { clerkUserId: user.id },
    update: { email },
    create: {
      clerkUserId: user.id,
      email,
      countryCode: "US",
      subscription: {
        create: {},
      },
    },
    include: { subscription: true },
  });
}
