import "dotenv/config";

const isProductionCheck = process.argv.includes("--production");
const vars = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
];

let hasErrors = false;

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

  if (issues.length) {
    hasErrors = true;
  }

  console.log(`${key}: ${issues.length ? issues.join(", ") : "ok"}`);
}

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const secretKey = process.env.CLERK_SECRET_KEY ?? "";

if (publishableKey.startsWith("pk_test_")) {
  console.log("clerk: development instance (pk_test_) — sign-in shows “Development mode”");
} else if (publishableKey.startsWith("pk_live_")) {
  console.log("clerk: production instance (pk_live_)");
} else if (publishableKey) {
  console.log("clerk: unknown publishable key prefix");
  hasErrors = true;
}

if (secretKey.startsWith("sk_test_") && publishableKey.startsWith("pk_live_")) {
  console.log("clerk: MISMATCH — publishable is live but secret is test");
  hasErrors = true;
}

if (secretKey.startsWith("sk_live_") && publishableKey.startsWith("pk_test_")) {
  console.log("clerk: MISMATCH — publishable is test but secret is live");
  hasErrors = true;
}

if (isProductionCheck) {
  if (publishableKey.startsWith("pk_test_")) {
    console.log(
      "production: FAIL — use Clerk production keys (pk_live_ / sk_live_) in Vercel",
    );
    hasErrors = true;
  } else {
    console.log("production: ok — Clerk production keys detected");
  }
}

process.exit(hasErrors ? 1 : 0);
