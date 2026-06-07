import "dotenv/config";

const vars = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
];

for (const key of vars) {
  const value = process.env[key] ?? "";
  const issues = [];

  if (!value) issues.push("MISSING");
  if (value.includes("%")) issues.push("HAS_PERCENT");
  if (value.includes(" ")) issues.push("HAS_SPACES");
  if (!value.startsWith("/") && key.includes("URL") && !key.includes("KEY")) {
    issues.push("SHOULD_START_WITH_SLASH");
  }
  if (key.includes("PUBLISHABLE") && !value.startsWith("pk_")) {
    issues.push("SHOULD_START_WITH_pk_");
  }
  if (key === "CLERK_SECRET_KEY" && !value.startsWith("sk_")) {
    issues.push("SHOULD_START_WITH_sk_");
  }

  console.log(`${key}: ${issues.length ? issues.join(", ") : "ok"}`);
}
