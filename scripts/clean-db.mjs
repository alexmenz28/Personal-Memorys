/**
 * Wipes all user/app data. Keeps system_holidays (shared reference data).
 * Usage: node scripts/clean-db.mjs
 */
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
  TRUNCATE TABLE
    reminder_deliveries,
    reminders,
    event_notes,
    event_people,
    events,
    person_notes,
    preferences,
    user_preference_categories,
    people,
    user_hidden_holidays,
    device_tokens,
    subscriptions,
    user_profiles,
    session,
    account,
    verification,
    "user"
  RESTART IDENTITY CASCADE;
`;

try {
  await pool.query(sql);
  console.log("Database cleaned. system_holidays preserved.");
} catch (error) {
  console.error("Clean failed:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}
