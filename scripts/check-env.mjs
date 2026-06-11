import "dotenv/config";

const isProductionCheck = process.argv.includes("--production");
const vars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

let hasErrors = false;

for (const key of vars) {
  const value = process.env[key] ?? "";
  const issues = [];

  if (!value) issues.push("MISSING");
  if (value.includes("%")) issues.push("HAS_PERCENT");
  if (value.includes(" ")) issues.push("HAS_SPACES");

  if (key === "BETTER_AUTH_URL" && value && !value.startsWith("http")) {
    issues.push("SHOULD_START_WITH_http");
  }

  if (key === "BETTER_AUTH_SECRET" && value && value.length < 32) {
    issues.push("TOO_SHORT");
  }

  if (issues.length) {
    hasErrors = true;
  }

  console.log(`${key}: ${issues.length ? issues.join(", ") : "ok"}`);
}

if (isProductionCheck) {
  const authUrl = process.env.BETTER_AUTH_URL ?? "";

  if (authUrl.startsWith("http://localhost")) {
    console.log(
      "production: FAIL — BETTER_AUTH_URL must be your public HTTPS URL in Vercel",
    );
    hasErrors = true;
  } else if (authUrl.startsWith("https://")) {
    console.log("production: ok — BETTER_AUTH_URL uses HTTPS");
  } else if (authUrl) {
    console.log("production: WARN — BETTER_AUTH_URL should be a full HTTPS URL");
  }
}

process.exit(hasErrors ? 1 : 0);
