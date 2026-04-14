import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = postgres(DATABASE_URL, {
  ssl: "require",
  prepare: false,
  onnotice: () => {},
});

export async function initSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL UNIQUE,
      gender              TEXT NOT NULL,
      gender_probability  DOUBLE PRECISION NOT NULL,
      sample_size         INTEGER NOT NULL,
      age                 INTEGER NOT NULL,
      age_group           TEXT NOT NULL,
      country_id          TEXT NOT NULL,
      country_probability DOUBLE PRECISION NOT NULL,
      created_at          TEXT NOT NULL
    )
  `;
}
